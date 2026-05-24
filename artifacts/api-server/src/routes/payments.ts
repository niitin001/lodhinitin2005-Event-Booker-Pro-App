import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable, bookingsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function generateInvoiceNumber(): string {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

router.get("/payments", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const bookings = await db.select({ id: bookingsTable.id }).from(bookingsTable).where(eq(bookingsTable.customerId, userId));
  const bookingIds = bookings.map(b => b.id);
  if (bookingIds.length === 0) { res.json([]); return; }

  const allPayments = await db.select().from(paymentsTable);
  const userPayments = allPayments.filter(p => bookingIds.includes(p.bookingId));
  res.json(userPayments.map(p => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })));
});

router.post("/payments/initiate", requireAuth, async (req, res): Promise<void> => {
  const { bookingId, amount, type, method } = req.body as { bookingId: number; amount: number; type: string; method?: string };
  const orderId = `order_${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(paymentsTable).values({
    bookingId, amount, type: type as "advance" | "remaining" | "full", status: "pending",
    method: method || "razorpay", razorpayOrderId: orderId,
    invoiceNumber: generateInvoiceNumber(),
  });
  res.json({ orderId, amount, currency: "INR", keyId: "rzp_test_key" });
});

router.post("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body as {
    bookingId: number; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string;
  };
  const [payment] = await db.update(paymentsTable)
    .set({ status: "completed", razorpayPaymentId, razorpaySignature })
    .where(eq(paymentsTable.razorpayOrderId, razorpayOrderId))
    .returning();
  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
  res.json({ ...payment, createdAt: payment.createdAt.toISOString(), updatedAt: payment.updatedAt.toISOString() });
});

router.get("/payments/:id/invoice", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, payment.bookingId));
  res.json({
    id: payment.id, bookingId: payment.bookingId, paymentId: payment.id,
    invoiceNumber: payment.invoiceNumber || generateInvoiceNumber(),
    amount: payment.amount, taxAmount: payment.amount * 0.18,
    customerName: "Customer", photographerName: "Photographer",
    eventType: booking?.eventType || "Event", eventDate: booking?.eventDate || "",
    issuedAt: payment.createdAt.toISOString(),
  });
});

router.post("/payments/:id/refund", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.update(paymentsTable).set({ status: "refunded" }).where(eq(paymentsTable.id, id));
  res.json({ message: "Refund request submitted successfully" });
});

export default router;
