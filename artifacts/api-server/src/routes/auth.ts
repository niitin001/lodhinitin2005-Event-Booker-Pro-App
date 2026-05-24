import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, photographersTable } from "@workspace/db";
import { signJwt, hashPassword, verifyPassword, generateOtp } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serializeUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    role: u.role,
    isVerified: u.isVerified,
    isBanned: u.isBanned,
    city: u.city,
    referralCode: u.referralCode,
    createdAt: u.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, role, phone } = req.body as {
    name: string; email: string; password: string; role: string; phone?: string;
  };
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = hashPassword(password);
  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, phone, role: role as "customer" | "photographer" | "admin",
    isVerified: true, referralCode,
  }).returning();

  if (role === "photographer") {
    await db.insert(photographersTable).values({
      userId: user.id,
      displayName: name,
      city: "",
      specializations: [],
      isApproved: false,
    });
  }

  const token = signJwt({ id: user.id, role: user.role });
  res.status(201).json({ token, user: serializeUser(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: "Missing email or password" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: "Account banned" });
    return;
  }
  const token = signJwt({ id: user.id, role: user.role });
  res.json({ token, user: serializeUser(user) });
});

router.post("/auth/google", async (req, res): Promise<void> => {
  const { token: googleToken } = req.body as { token: string };
  if (!googleToken) {
    res.status(400).json({ error: "Missing token" });
    return;
  }
  // Stub: decode a mock Google token (base64 encoded JSON)
  try {
    const decoded = JSON.parse(Buffer.from(googleToken, "base64").toString()) as {
      email: string; name: string; sub: string;
    };
    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, decoded.email));
    if (!user) {
      const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      [user] = await db.insert(usersTable).values({
        name: decoded.name, email: decoded.email, googleId: decoded.sub,
        isVerified: true, role: "customer", referralCode,
      }).returning();
    }
    const jwtToken = signJwt({ id: user.id, role: user.role });
    res.json({ token: jwtToken, user: serializeUser(user) });
  } catch {
    res.status(400).json({ error: "Invalid Google token" });
  }
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body as { email: string };
  if (!email) { res.status(400).json({ error: "Missing email" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (user) {
    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await db.update(usersTable).set({ otpCode: otp, otpExpiresAt: expires }).where(eq(usersTable.id, user.id));
    req.log.info({ email, otp }, "OTP generated (in production, send via email)");
  }
  res.json({ message: "If that email exists, an OTP has been sent" });
});

router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { email, otp } = req.body as { email: string; otp: string };
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }
  res.json({ message: "OTP verified successfully" });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { email, otp, newPassword } = req.body as { email: string; otp: string; newPassword: string };
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }
  const passwordHash = hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash, otpCode: null, otpExpiresAt: null }).where(eq(usersTable.id, user.id));
  res.json({ message: "Password reset successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(serializeUser(user));
});

export default router;
export { serializeUser };
