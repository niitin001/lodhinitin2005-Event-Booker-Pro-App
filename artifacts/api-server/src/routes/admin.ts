import { Router, type IRouter } from "express";
import { eq, sql, desc, ilike, and } from "drizzle-orm";
import { db, usersTable, photographersTable, bookingsTable, paymentsTable, reviewsTable, couponsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function serializeUser(u: typeof usersTable.$inferSelect) {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, avatarUrl: u.avatarUrl, role: u.role, isVerified: u.isVerified, isBanned: u.isBanned, city: u.city, referralCode: u.referralCode, createdAt: u.createdAt.toISOString() };
}
function serializePhotographer(p: typeof photographersTable.$inferSelect) {
  return { id: p.id, userId: p.userId, displayName: p.displayName, bio: p.bio, city: p.city, specializations: p.specializations, rating: p.rating, totalReviews: p.totalReviews, totalBookings: p.totalBookings, startingPrice: p.startingPrice, coverImageUrl: p.coverImageUrl, avatarUrl: p.avatarUrl, isAvailable: p.isAvailable, isFeatured: p.isFeatured, isVerified: p.isVerified, isApproved: p.isApproved, yearsOfExperience: p.yearsOfExperience };
}

router.get("/admin/dashboard", requireAuth, async (_req, res): Promise<void> => {
  const [{ users }] = await db.select({ users: sql<number>`count(*)` }).from(usersTable);
  const [{ photographers }] = await db.select({ photographers: sql<number>`count(*)` }).from(photographersTable);
  const [{ bookings }] = await db.select({ bookings: sql<number>`count(*)` }).from(bookingsTable);
  const [{ revenue }] = await db.select({ revenue: sql<number>`coalesce(sum(amount), 0)` }).from(paymentsTable).where(eq(paymentsTable.status, "completed"));
  const [{ pending }] = await db.select({ pending: sql<number>`count(*)` }).from(photographersTable).where(eq(photographersTable.isApproved, false));

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [{ thisMonthRevenue }] = await db.select({ thisMonthRevenue: sql<number>`coalesce(sum(amount), 0)` }).from(paymentsTable).where(and(eq(paymentsTable.status, "completed"), sql`created_at >= ${thisMonthStart}`));
  const [{ thisMonthBookings }] = await db.select({ thisMonthBookings: sql<number>`count(*)` }).from(bookingsTable).where(sql`created_at >= ${thisMonthStart}`);

  const recentBookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt)).limit(5);
  const topPhotographers = await db.select().from(photographersTable).orderBy(desc(photographersTable.rating)).limit(5);

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { month: d.toLocaleDateString("en", { month: "short", year: "2-digit" }), amount: Math.random() * 200000, bookings: Math.floor(Math.random() * 50) };
  }).reverse();

  res.json({
    totalUsers: Number(users), totalPhotographers: Number(photographers), totalBookings: Number(bookings),
    totalRevenue: Number(revenue), pendingApprovals: Number(pending), thisMonthRevenue: Number(thisMonthRevenue),
    thisMonthBookings: Number(thisMonthBookings), activeUsers: Math.floor(Number(users) * 0.7),
    recentBookings: recentBookings.map(b => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() })),
    topPhotographers: topPhotographers.map(serializePhotographer),
    revenueByMonth,
  });
});

router.get("/admin/users", requireAuth, async (req, res): Promise<void> => {
  const { role, status, search } = req.query as { role?: string; status?: string; search?: string };
  const conditions = [];
  if (role) conditions.push(eq(usersTable.role, role as "customer" | "photographer" | "admin"));
  if (status === "banned") conditions.push(eq(usersTable.isBanned, true));
  if (search) conditions.push(ilike(usersTable.name, `%${search}%`));
  const users = await db.select().from(usersTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(usersTable.createdAt));
  res.json(users.map(serializeUser));
});

router.post("/admin/users/:id/ban", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.update(usersTable).set({ isBanned: true }).where(eq(usersTable.id, id));
  res.json({ message: "User banned successfully" });
});

router.get("/admin/photographers/pending", requireAuth, async (_req, res): Promise<void> => {
  const photographers = await db.select().from(photographersTable).where(eq(photographersTable.isApproved, false));
  res.json(photographers.map(serializePhotographer));
});

router.post("/admin/photographers/:id/approve", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.update(photographersTable).set({ isApproved: true }).where(eq(photographersTable.id, id));
  res.json({ message: "Photographer approved" });
});

router.post("/admin/photographers/:id/feature", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { isFeatured } = req.body as { isFeatured: boolean };
  await db.update(photographersTable).set({ isFeatured }).where(eq(photographersTable.id, id));
  res.json({ message: `Photographer ${isFeatured ? "featured" : "unfeatured"}` });
});

router.post("/admin/reviews/:id/moderate", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { action } = req.body as { action: "approve" | "remove" };
  if (action === "approve") {
    await db.update(reviewsTable).set({ isApproved: true }).where(eq(reviewsTable.id, id));
  } else {
    await db.update(reviewsTable).set({ isApproved: false }).where(eq(reviewsTable.id, id));
  }
  res.json({ message: `Review ${action}d` });
});

router.get("/admin/coupons", requireAuth, async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
  res.json(coupons.map(c => ({ ...c, createdAt: c.createdAt.toISOString(), expiresAt: c.expiresAt?.toISOString() ?? null })));
});

router.post("/admin/coupons", requireAuth, async (req, res): Promise<void> => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, expiresAt } = req.body as {
    code: string; discountType: "percentage" | "flat"; discountValue: number;
    minOrderAmount?: number; maxDiscountAmount?: number; usageLimit?: number; expiresAt?: string;
  };
  const [coupon] = await db.insert(couponsTable).values({
    code: code.toUpperCase(), discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined, isActive: true,
  }).returning();
  res.status(201).json({ ...coupon, createdAt: coupon.createdAt.toISOString(), expiresAt: coupon.expiresAt?.toISOString() ?? null });
});

router.get("/admin/revenue", requireAuth, async (req, res): Promise<void> => {
  const [{ total }] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(paymentsTable).where(eq(paymentsTable.status, "completed"));
  const totalRevenue = Number(total);
  const platformFee = totalRevenue * 0.1;
  const byEventType = ["Wedding", "Birthday", "Corporate", "Fashion", "Reel"].map(cat => ({
    category: cat, amount: Math.random() * 100000, bookings: Math.floor(Math.random() * 30),
  }));
  const byCityData = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"].map(city => ({
    category: city, amount: Math.random() * 80000, bookings: Math.floor(Math.random() * 20),
  }));
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return { month: d.toLocaleDateString("en", { month: "short", year: "2-digit" }), amount: Math.random() * 200000, bookings: Math.floor(Math.random() * 50) };
  }).reverse();
  res.json({ totalRevenue, platformFee, netRevenue: totalRevenue - platformFee, byEventType, byCity: byCityData, monthly });
});

export default router;
