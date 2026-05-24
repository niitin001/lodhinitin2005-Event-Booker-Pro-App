import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const { code, orderAmount } = req.body as { code: string; orderAmount: number };
  const [coupon] = await db.select().from(couponsTable).where(and(eq(couponsTable.code, code.toUpperCase()), eq(couponsTable.isActive, true)));

  if (!coupon) { res.status(404).json({ isValid: false, discountAmount: 0, finalAmount: orderAmount, coupon: null }); return; }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) { res.json({ isValid: false, discountAmount: 0, finalAmount: orderAmount, coupon: null }); return; }
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) { res.json({ isValid: false, discountAmount: 0, finalAmount: orderAmount, coupon: null }); return; }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) { res.json({ isValid: false, discountAmount: 0, finalAmount: orderAmount, coupon: null }); return; }

  let discountAmount = coupon.discountType === "percentage"
    ? orderAmount * (coupon.discountValue / 100)
    : coupon.discountValue;

  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  const finalAmount = Math.max(0, orderAmount - discountAmount);
  const serialized = { ...coupon, createdAt: coupon.createdAt.toISOString(), expiresAt: coupon.expiresAt?.toISOString() ?? null };
  res.json({ isValid: true, discountAmount, finalAmount, coupon: serialized });
});

export default router;
