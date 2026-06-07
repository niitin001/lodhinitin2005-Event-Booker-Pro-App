import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, notificationsTable, wishlistTable, photographersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { serializeUser } from "./auth";

const router: IRouter = Router();

function serializePhotographer(p: typeof photographersTable.$inferSelect) {
  return {
    id: p.id, userId: p.userId, displayName: p.displayName, bio: p.bio,
    city: p.city, specializations: p.specializations, rating: p.rating,
    totalReviews: p.totalReviews, totalBookings: p.totalBookings, startingPrice: p.startingPrice,
    coverImageUrl: p.coverImageUrl, avatarUrl: p.avatarUrl, isAvailable: p.isAvailable,
    isFeatured: p.isFeatured, isVerified: p.isVerified, isApproved: p.isApproved,
    yearsOfExperience: p.yearsOfExperience, instagramHandle: p.instagramHandle,
    whatsappNumber: p.whatsappNumber,
  };
}

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(serializeUser(user));
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (req.userId !== id) { res.status(403).json({ error: "Forbidden" }); return; }
  const { name, phone, avatarUrl, city } = req.body as { name?: string; phone?: string; avatarUrl?: string; city?: string };
  const [user] = await db.update(usersTable).set({ name, phone, avatarUrl, city }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(serializeUser(user));
});

router.get("/users/:id/wishlist", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const items = await db.select({ photographer: photographersTable })
    .from(wishlistTable)
    .innerJoin(photographersTable, eq(wishlistTable.photographerId, photographersTable.id))
    .where(eq(wishlistTable.userId, id));
  res.json(items.map(i => serializePhotographer(i.photographer)));
});

router.post("/users/:id/wishlist", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { photographerId } = req.body as { photographerId: number };
  const existing = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, id), eq(wishlistTable.photographerId, photographerId)));
  if (existing.length === 0) {
    await db.insert(wishlistTable).values({ userId: id, photographerId });
  }
  res.json({ message: "Added to wishlist" });
});

router.delete("/users/:id/wishlist/:photographerId", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const photographerId = parseInt(Array.isArray(req.params.photographerId) ? req.params.photographerId[0] : req.params.photographerId, 10);
  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, id), eq(wishlistTable.photographerId, photographerId)));
  res.sendStatus(204);
});

router.get("/users/:id/notifications", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const notifs = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, id))
    .orderBy(notificationsTable.createdAt);
  res.json(notifs.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
});

export default router;
export { serializePhotographer };
