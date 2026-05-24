import { Router, type IRouter } from "express";
import { eq, and, avg } from "drizzle-orm";
import { db, reviewsTable, photographersTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/reviews", requireAuth, async (req, res): Promise<void> => {
  const { photographerId, bookingId, rating, comment } = req.body as {
    photographerId: number; bookingId: number; rating: number; comment?: string;
  };
  const [review] = await db.insert(reviewsTable).values({
    customerId: req.userId!, photographerId, bookingId, rating, comment, isApproved: true,
  }).returning();

  // Update photographer avg rating
  const allReviews = await db.select({ rating: reviewsTable.rating }).from(reviewsTable)
    .where(and(eq(reviewsTable.photographerId, photographerId), eq(reviewsTable.isApproved, true)));
  const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
  await db.update(photographersTable).set({ rating: avgRating, totalReviews: allReviews.length }).where(eq(photographersTable.id, photographerId));

  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  res.status(201).json({
    ...review, createdAt: review.createdAt.toISOString(), updatedAt: review.updatedAt.toISOString(),
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email, avatarUrl: customer.avatarUrl, role: customer.role, isVerified: customer.isVerified, isBanned: customer.isBanned, city: customer.city, phone: customer.phone, referralCode: customer.referralCode, createdAt: customer.createdAt.toISOString() } : undefined,
  });
});

router.get("/reviews/photographer/:photographerId", async (req, res): Promise<void> => {
  const photographerId = parseInt(Array.isArray(req.params.photographerId) ? req.params.photographerId[0] : req.params.photographerId, 10);
  const reviews = await db.select().from(reviewsTable)
    .where(and(eq(reviewsTable.photographerId, photographerId), eq(reviewsTable.isApproved, true)))
    .orderBy(reviewsTable.createdAt);

  const withCustomers = await Promise.all(reviews.map(async r => {
    const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, r.customerId));
    return { ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(), customer: customer ? { id: customer.id, name: customer.name, email: customer.email, avatarUrl: customer.avatarUrl, role: customer.role, isVerified: customer.isVerified, isBanned: customer.isBanned, city: customer.city, phone: customer.phone, referralCode: customer.referralCode, createdAt: customer.createdAt.toISOString() } : undefined };
  }));

  res.json(withCustomers);
});

router.patch("/reviews/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { rating, comment } = req.body as { rating?: number; comment?: string };
  const [review] = await db.update(reviewsTable).set({ rating, comment }).where(eq(reviewsTable.id, id)).returning();
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  res.json({ ...review, createdAt: review.createdAt.toISOString(), updatedAt: review.updatedAt.toISOString() });
});

router.delete("/reviews/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  res.sendStatus(204);
});

export default router;
