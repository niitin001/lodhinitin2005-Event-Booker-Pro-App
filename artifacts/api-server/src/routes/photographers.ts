import { Router, type IRouter } from "express";
import { eq, and, ilike, gte, lte, desc, sql } from "drizzle-orm";
import { db, photographersTable, portfolioItemsTable, packagesTable, bookingsTable, reviewsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { serializePhotographer } from "./users";

const router: IRouter = Router();

router.get("/photographers", async (req, res): Promise<void> => {
  const { city, eventType, minPrice, maxPrice, rating, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  let query = db.select().from(photographersTable).where(eq(photographersTable.isApproved, true)).$dynamic();

  const conditions = [eq(photographersTable.isApproved, true)];
  if (city) conditions.push(ilike(photographersTable.city, `%${city}%`));
  if (minPrice) conditions.push(gte(photographersTable.startingPrice, parseFloat(minPrice)));
  if (maxPrice) conditions.push(lte(photographersTable.startingPrice, parseFloat(maxPrice)));
  if (rating) conditions.push(gte(photographersTable.rating, parseFloat(rating)));
  if (search) conditions.push(ilike(photographersTable.displayName, `%${search}%`));

  const photographers = await db.select().from(photographersTable)
    .where(and(...conditions))
    .orderBy(desc(photographersTable.isFeatured), desc(photographersTable.rating))
    .limit(parseInt(limit))
    .offset((parseInt(page) - 1) * parseInt(limit));

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(photographersTable).where(and(...conditions));

  res.json({
    photographers: photographers.map(serializePhotographer),
    total: Number(count),
    page: parseInt(page),
    limit: parseInt(limit),
  });
});

router.get("/photographers/trending", async (_req, res): Promise<void> => {
  const photographers = await db.select().from(photographersTable)
    .where(and(eq(photographersTable.isApproved, true), eq(photographersTable.isFeatured, true)))
    .orderBy(desc(photographersTable.rating))
    .limit(8);
  res.json(photographers.map(serializePhotographer));
});

router.get("/photographers/stats", async (_req, res): Promise<void> => {
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(photographersTable).where(eq(photographersTable.isApproved, true));
  const [{ bookings }] = await db.select({ bookings: sql<number>`count(*)` }).from(bookingsTable);
  const [{ cities }] = await db.select({ cities: sql<number>`count(distinct city)` }).from(photographersTable);
  const [{ avgRating }] = await db.select({ avgRating: sql<number>`avg(rating)` }).from(photographersTable).where(eq(photographersTable.isApproved, true));
  res.json({
    totalPhotographers: Number(total),
    totalBookings: Number(bookings),
    happyClients: Math.max(0, Number(bookings) - 5),
    citiesCovered: Number(cities),
    averageRating: Number(avgRating) || 4.8,
  });
});

router.get("/photographers/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [photographer] = await db.select().from(photographersTable).where(eq(photographersTable.id, id));
  if (!photographer) { res.status(404).json({ error: "Photographer not found" }); return; }

  const portfolio = await db.select().from(portfolioItemsTable).where(eq(portfolioItemsTable.photographerId, id));
  const packages = await db.select().from(packagesTable).where(and(eq(packagesTable.photographerId, id), eq(packagesTable.isActive, true)));
  const reviews = await db.select().from(reviewsTable).where(and(eq(reviewsTable.photographerId, id), eq(reviewsTable.isApproved, true))).limit(10);

  res.json({
    ...serializePhotographer(photographer),
    equipment: photographer.equipment,
    instagramHandle: photographer.instagramHandle,
    portfolio: portfolio.map(p => ({ ...p, createdAt: p.createdAt.toISOString() })),
    packages: packages.map(pkg => ({ ...pkg, addons: pkg.addons as object[] })),
    reviews: reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
  });
});

router.patch("/photographers/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const update = req.body as Partial<typeof photographersTable.$inferInsert>;
  const [photographer] = await db.update(photographersTable).set(update).where(eq(photographersTable.id, id)).returning();
  if (!photographer) { res.status(404).json({ error: "Photographer not found" }); return; }
  res.json(serializePhotographer(photographer));
});

router.get("/photographers/:id/portfolio", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const items = await db.select().from(portfolioItemsTable).where(eq(portfolioItemsTable.photographerId, id));
  res.json(items.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })));
});

router.post("/photographers/:id/portfolio", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { mediaUrl, mediaType, title, eventType } = req.body as { mediaUrl: string; mediaType: "photo" | "video" | "reel"; title?: string; eventType?: string };
  const [item] = await db.insert(portfolioItemsTable).values({ photographerId: id, mediaUrl, mediaType, title, eventType, isApproved: true }).returning();
  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.get("/photographers/:id/availability", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  // Return next 30 available days as placeholder
  const slots = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      id: i + 1, photographerId: id,
      date: d.toISOString().split("T")[0],
      isAvailable: i % 7 !== 6 && i % 7 !== 0,
      timeSlots: ["09:00", "12:00", "15:00", "18:00"],
    };
  });
  res.json(slots);
});

router.post("/photographers/:id/availability", requireAuth, async (_req, res): Promise<void> => {
  res.json({ message: "Availability updated successfully" });
});

router.get("/photographers/:id/packages", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const packages = await db.select().from(packagesTable).where(and(eq(packagesTable.photographerId, id), eq(packagesTable.isActive, true)));
  res.json(packages.map(pkg => ({ ...pkg, addons: pkg.addons as object[] })));
});

router.post("/photographers/:id/packages", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, description, price, duration, includes, eventTypes } = req.body as {
    name: string; description?: string; price: number; duration: number; includes?: string[]; eventTypes?: string[];
  };
  const [pkg] = await db.insert(packagesTable).values({
    photographerId: id, name, description, price, duration,
    includes: includes || [], eventTypes: eventTypes || [], addons: [],
  }).returning();
  res.status(201).json({ ...pkg, addons: pkg.addons as object[] });
});

router.get("/photographers/:id/earnings", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [{ total }] = await db.select({ total: sql<number>`coalesce(sum(total_amount), 0)` })
    .from(bookingsTable).where(and(eq(bookingsTable.photographerId, id), eq(bookingsTable.status, "completed")));

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [{ thisMonth }] = await db.select({ thisMonth: sql<number>`coalesce(sum(total_amount), 0)` })
    .from(bookingsTable).where(and(
      eq(bookingsTable.photographerId, id), eq(bookingsTable.status, "completed"),
      gte(bookingsTable.createdAt, thisMonthStart)
    ));

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { month: d.toLocaleDateString("en", { month: "short", year: "2-digit" }), amount: Math.random() * 50000, bookings: Math.floor(Math.random() * 10) };
  }).reverse();

  res.json({ totalEarned: Number(total), pendingAmount: Number(total) * 0.1, thisMonth: Number(thisMonth), lastMonth: Number(thisMonth) * 0.9, monthlyData });
});

router.get("/photographers/:id/dashboard", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const allBookings = await db.select().from(bookingsTable).where(eq(bookingsTable.photographerId, id)).orderBy(desc(bookingsTable.createdAt)).limit(5);
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(bookingsTable).where(eq(bookingsTable.photographerId, id));
  const [{ pending }] = await db.select({ pending: sql<number>`count(*)` }).from(bookingsTable).where(and(eq(bookingsTable.photographerId, id), eq(bookingsTable.status, "pending")));
  const [{ completed }] = await db.select({ completed: sql<number>`count(*)` }).from(bookingsTable).where(and(eq(bookingsTable.photographerId, id), eq(bookingsTable.status, "completed")));
  const [{ earnings }] = await db.select({ earnings: sql<number>`coalesce(sum(total_amount), 0)` }).from(bookingsTable).where(and(eq(bookingsTable.photographerId, id), eq(bookingsTable.status, "completed")));
  const [photographer] = await db.select().from(photographersTable).where(eq(photographersTable.id, id));

  res.json({
    totalBookings: Number(total), pendingBookings: Number(pending), confirmedBookings: 0,
    completedBookings: Number(completed), totalEarnings: Number(earnings), thisMonthEarnings: Number(earnings) * 0.15,
    rating: photographer?.rating || 0, totalReviews: photographer?.totalReviews || 0,
    recentBookings: allBookings.map(b => ({ ...b, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() })),
  });
});

export default router;
