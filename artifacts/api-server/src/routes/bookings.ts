import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, bookingsTable, photographersTable, usersTable, packagesTable, deliverablesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serializeBooking(b: typeof bookingsTable.$inferSelect, extras?: {
  photographer?: typeof photographersTable.$inferSelect;
  customer?: typeof usersTable.$inferSelect;
  package?: typeof packagesTable.$inferSelect;
}) {
  return {
    id: b.id, customerId: b.customerId, photographerId: b.photographerId, packageId: b.packageId,
    eventType: b.eventType, eventDate: b.eventDate, eventEndDate: b.eventEndDate,
    city: b.city, venue: b.venue, totalAmount: b.totalAmount, advanceAmount: b.advanceAmount,
    remainingAmount: b.remainingAmount, status: b.status, notes: b.notes,
    referenceImages: b.referenceImages, selectedAddons: b.selectedAddons,
    rejectionReason: b.rejectionReason, cancellationReason: b.cancellationReason,
    createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(),
    photographer: extras?.photographer ? {
      id: extras.photographer.id, userId: extras.photographer.userId,
      displayName: extras.photographer.displayName, city: extras.photographer.city,
      rating: extras.photographer.rating, totalReviews: extras.photographer.totalReviews,
      totalBookings: extras.photographer.totalBookings, startingPrice: extras.photographer.startingPrice,
      avatarUrl: extras.photographer.avatarUrl, coverImageUrl: extras.photographer.coverImageUrl,
      isAvailable: extras.photographer.isAvailable, isFeatured: extras.photographer.isFeatured,
      isVerified: extras.photographer.isVerified, isApproved: extras.photographer.isApproved,
      specializations: extras.photographer.specializations, yearsOfExperience: extras.photographer.yearsOfExperience,
      bio: extras.photographer.bio,
    } : undefined,
    customer: extras?.customer ? {
      id: extras.customer.id, name: extras.customer.name, email: extras.customer.email,
      phone: extras.customer.phone, avatarUrl: extras.customer.avatarUrl, role: extras.customer.role,
      isVerified: extras.customer.isVerified, isBanned: extras.customer.isBanned,
      city: extras.customer.city, referralCode: extras.customer.referralCode,
      createdAt: extras.customer.createdAt.toISOString(),
    } : undefined,
    package: extras?.package ? {
      id: extras.package.id, photographerId: extras.package.photographerId,
      name: extras.package.name, description: extras.package.description,
      price: extras.package.price, duration: extras.package.duration,
      includes: extras.package.includes, addons: extras.package.addons as object[],
      eventTypes: extras.package.eventTypes, isActive: extras.package.isActive,
    } : undefined,
  };
}

router.get("/bookings", requireAuth, async (req, res): Promise<void> => {
  const { status, as } = req.query as { status?: string; as?: string };
  const userId = req.userId!;
  const userRole = req.userRole!;

  let whereCondition;
  if (userRole === "photographer" || as === "photographer") {
    const [photographer] = await db.select().from(photographersTable).where(eq(photographersTable.userId, userId));
    if (!photographer) { res.json([]); return; }
    whereCondition = eq(bookingsTable.photographerId, photographer.id);
  } else if (userRole === "admin") {
    whereCondition = undefined;
  } else {
    whereCondition = eq(bookingsTable.customerId, userId);
  }

  const bookings = await db.select().from(bookingsTable)
    .where(whereCondition)
    .orderBy(bookingsTable.createdAt);

  const filtered = status ? bookings.filter(b => b.status === status) : bookings;

  const withExtras = await Promise.all(filtered.map(async b => {
    const [photographer] = await db.select().from(photographersTable).where(eq(photographersTable.id, b.photographerId));
    const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, b.customerId));
    const pkg = b.packageId ? (await db.select().from(packagesTable).where(eq(packagesTable.id, b.packageId)))[0] : undefined;
    return serializeBooking(b, { photographer, customer, package: pkg });
  }));

  res.json(withExtras);
});

router.post("/bookings", requireAuth, async (req, res): Promise<void> => {
  const { photographerId, packageId, eventType, eventDate, eventEndDate, city, venue, notes, referenceImages, selectedAddons } = req.body as {
    photographerId: number; packageId: number; eventType: string; eventDate: string;
    eventEndDate?: string; city: string; venue?: string; notes?: string;
    referenceImages?: string[]; selectedAddons?: string[];
  };

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
  const totalAmount = pkg ? pkg.price : 0;
  const advanceAmount = totalAmount * 0.3;

  const [booking] = await db.insert(bookingsTable).values({
    customerId: req.userId!, photographerId, packageId, eventType, eventDate, eventEndDate,
    city, venue, notes, referenceImages: referenceImages || [], selectedAddons: selectedAddons || [],
    totalAmount, advanceAmount, remainingAmount: totalAmount - advanceAmount, status: "pending",
  }).returning();

  await db.update(photographersTable)
    .set({ totalBookings: db.select({ count: eq(photographersTable.id, photographerId) }) as unknown as number })
    .where(eq(photographersTable.id, photographerId));

  res.status(201).json(serializeBooking(booking));
});

router.get("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  const [photographer] = await db.select().from(photographersTable).where(eq(photographersTable.id, booking.photographerId));
  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, booking.customerId));
  const pkg = booking.packageId ? (await db.select().from(packagesTable).where(eq(packagesTable.id, booking.packageId)))[0] : undefined;
  res.json(serializeBooking(booking, { photographer, customer, package: pkg }));
});

router.patch("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const update = req.body as Partial<typeof bookingsTable.$inferInsert>;
  const [booking] = await db.update(bookingsTable).set(update).where(eq(bookingsTable.id, id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(serializeBooking(booking));
});

router.post("/bookings/:id/accept", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [booking] = await db.update(bookingsTable).set({ status: "confirmed" }).where(eq(bookingsTable.id, id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(serializeBooking(booking));
});

router.post("/bookings/:id/reject", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { reason } = req.body as { reason: string };
  const [booking] = await db.update(bookingsTable).set({ status: "rejected", rejectionReason: reason }).where(eq(bookingsTable.id, id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(serializeBooking(booking));
});

router.post("/bookings/:id/cancel", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { reason } = req.body as { reason: string };
  const [booking] = await db.update(bookingsTable).set({ status: "cancelled", cancellationReason: reason }).where(eq(bookingsTable.id, id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(serializeBooking(booking));
});

router.post("/bookings/:id/complete", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [booking] = await db.update(bookingsTable).set({ status: "completed" }).where(eq(bookingsTable.id, id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(serializeBooking(booking));
});

router.get("/bookings/:id/deliverables", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const items = await db.select().from(deliverablesTable).where(eq(deliverablesTable.bookingId, id));
  res.json(items.map(d => ({ ...d, uploadedAt: d.uploadedAt.toISOString() })));
});

router.post("/bookings/:id/deliverables", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { mediaUrl, mediaType, caption } = req.body as { mediaUrl: string; mediaType: "photo" | "video"; caption?: string };
  const [item] = await db.insert(deliverablesTable).values({ bookingId: id, mediaUrl, mediaType, caption }).returning();
  res.status(201).json({ ...item, uploadedAt: item.uploadedAt.toISOString() });
});

router.post("/bookings/:id/price-estimate", requireAuth, async (req, res): Promise<void> => {
  const { packageId, durationHours, selectedAddons } = req.body as { packageId: number; eventType: string; durationHours: number; selectedAddons?: string[] };
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
  const basePrice = pkg ? pkg.price : 0;
  const addonsCost = (selectedAddons?.length || 0) * 2000;
  const totalAmount = basePrice + addonsCost;
  const advanceAmount = totalAmount * 0.3;
  res.json({
    basePrice, addonsCost, discountAmount: 0, couponDiscount: 0,
    totalAmount, advanceAmount, remainingAmount: totalAmount - advanceAmount,
    breakdown: [
      { label: "Base package", amount: basePrice },
      { label: "Addons", amount: addonsCost },
    ],
  });
});

export default router;
