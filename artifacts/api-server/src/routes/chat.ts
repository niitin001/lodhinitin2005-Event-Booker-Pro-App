import { Router, type IRouter } from "express";
import { eq, and, or, desc } from "drizzle-orm";
import { db, conversationsTable, messagesTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serializeUser(u: typeof usersTable.$inferSelect) {
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, role: u.role, isVerified: u.isVerified, isBanned: u.isBanned, city: u.city, phone: u.phone, referralCode: u.referralCode, createdAt: u.createdAt.toISOString() };
}

router.get("/chat/conversations", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const convos = await db.select().from(conversationsTable)
    .where(or(eq(conversationsTable.participantAId, userId), eq(conversationsTable.participantBId, userId)))
    .orderBy(desc(conversationsTable.lastMessageAt));

  const withExtras = await Promise.all(convos.map(async c => {
    const otherId = c.participantAId === userId ? c.participantBId : c.participantAId;
    const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherId));
    const unread = await db.select().from(messagesTable)
      .where(and(eq(messagesTable.conversationId, c.id), eq(messagesTable.isRead, false)));
    const myUnread = unread.filter(m => m.senderId !== userId).length;
    return {
      id: c.id, bookingId: c.bookingId, lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt?.toISOString() ?? null, unreadCount: myUnread,
      otherParticipant: other ? serializeUser(other) : undefined,
      createdAt: c.createdAt.toISOString(),
    };
  }));

  res.json(withExtras);
});

router.post("/chat/conversations", requireAuth, async (req, res): Promise<void> => {
  const { bookingId, participantId } = req.body as { bookingId: number; participantId: number };
  const existing = await db.select().from(conversationsTable).where(
    and(eq(conversationsTable.bookingId, bookingId),
      or(
        and(eq(conversationsTable.participantAId, req.userId!), eq(conversationsTable.participantBId, participantId)),
        and(eq(conversationsTable.participantAId, participantId), eq(conversationsTable.participantBId, req.userId!))
      )
    )
  );
  if (existing.length > 0) {
    const c = existing[0];
    const [other] = await db.select().from(usersTable).where(eq(usersTable.id, participantId));
    res.status(201).json({ id: c.id, bookingId: c.bookingId, lastMessage: c.lastMessage, lastMessageAt: c.lastMessageAt?.toISOString() ?? null, unreadCount: 0, otherParticipant: other ? serializeUser(other) : undefined, createdAt: c.createdAt.toISOString() });
    return;
  }
  const [convo] = await db.insert(conversationsTable).values({ bookingId, participantAId: req.userId!, participantBId: participantId }).returning();
  const [other] = await db.select().from(usersTable).where(eq(usersTable.id, participantId));
  res.status(201).json({ id: convo.id, bookingId: convo.bookingId, lastMessage: convo.lastMessage, lastMessageAt: convo.lastMessageAt?.toISOString() ?? null, unreadCount: 0, otherParticipant: other ? serializeUser(other) : undefined, createdAt: convo.createdAt.toISOString() });
});

router.get("/chat/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(messagesTable.createdAt);
  const withSenders = await Promise.all(messages.map(async m => {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, m.senderId));
    return { ...m, createdAt: m.createdAt.toISOString(), sender: sender ? serializeUser(sender) : undefined };
  }));
  res.json(withSenders);
});

router.post("/chat/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { content, type } = req.body as { content: string; type: "text" | "image" | "voice" | "file" };
  const [msg] = await db.insert(messagesTable).values({ conversationId: id, senderId: req.userId!, content, type: type || "text", isRead: false }).returning();
  await db.update(conversationsTable).set({ lastMessage: content, lastMessageAt: new Date() }).where(eq(conversationsTable.id, id));
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString(), sender: sender ? serializeUser(sender) : undefined });
});

router.post("/chat/conversations/:id/read", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.update(messagesTable).set({ isRead: true })
    .where(and(eq(messagesTable.conversationId, id)));
  res.json({ message: "Messages marked as read" });
});

export default router;
