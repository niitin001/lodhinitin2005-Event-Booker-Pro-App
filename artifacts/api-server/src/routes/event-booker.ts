import { Router } from "express";
import crypto from "node:crypto";
import { db } from "@workspace/db";
import { users, providers, bookings } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();
const secret = process.env.SESSION_SECRET || "event-booker-dev-secret";

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function token(user: { id:number; role:string }) {
  const body = Buffer.from(JSON.stringify(user)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + sig;
}
function auth(req:any,res:any,next:any) {
  const raw = req.headers.authorization?.replace("Bearer ","");
  if (!raw) return res.status(401).json({message:"Login required"});
  try {
    const [body,sig]=raw.split(".");
    const expected=crypto.createHmac("sha256",secret).update(body).digest("base64url");
    if (sig!==expected) throw new Error("bad token");
    req.user=JSON.parse(Buffer.from(body,"base64url").toString());
    next();
  } catch { return res.status(401).json({message:"Invalid session"}); }
}

router.post("/auth/register", async (req,res)=>{
  try {
    const {name,email,password,role="customer"}=req.body||{};
    if(!name||!email||!password) return res.status(400).json({message:"Name, email and password are required"});
    const existing=await db.select().from(users).where(eq(users.email,String(email).toLowerCase()));
    if(existing.length) return res.status(409).json({message:"Email already registered"});
    const [user]=await db.insert(users).values({name,email:String(email).toLowerCase(),passwordHash:hash(password),role}).returning({id:users.id,name:users.name,email:users.email,role:users.role});
    res.status(201).json({user,token:token({id:user.id,role:user.role})});
  } catch(e){ req.log?.error(e); res.status(500).json({message:"Registration failed"}); }
});

router.post("/auth/login", async (req,res)=>{
  try {
    const {email,password}=req.body||{};
    const [user]=await db.select().from(users).where(eq(users.email,String(email||"").toLowerCase()));
    if(!user || user.passwordHash!==hash(String(password||""))) return res.status(401).json({message:"Invalid email or password"});
    res.json({user:{id:user.id,name:user.name,email:user.email,role:user.role},token:token({id:user.id,role:user.role})});
  } catch(e){ req.log?.error(e); res.status(500).json({message:"Login failed"}); }
});

router.get("/providers", async (req,res)=>{
  const category=String(req.query.category||"");
  const rows=category ? await db.select().from(providers).where(eq(providers.category,category)) : await db.select().from(providers);
  res.json(rows);
});

router.post("/bookings", auth, async (req:any,res)=>{
  try {
    const {providerId,eventDate,notes}=req.body||{};
    if(!providerId||!eventDate) return res.status(400).json({message:"Provider and event date are required"});
    const [booking]=await db.insert(bookings).values({customerId:req.user.id,providerId:Number(providerId),eventDate:new Date(eventDate),notes,status:"pending"}).returning();
    res.status(201).json(booking);
  } catch(e){ req.log?.error(e); res.status(500).json({message:"Booking failed"}); }
});

router.get("/bookings/me",auth,async(req:any,res)=>{
  const rows=await db.select().from(bookings).where(eq(bookings.customerId,req.user.id));
  res.json(rows);
});

export default router;
