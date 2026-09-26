import { Router } from "express";
import crypto from "node:crypto";
import { db } from "@workspace/db";
import { users, providers, bookings } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();
const secret = process.env.SESSION_SECRET || "event-booker-dev-secret";
const hash = (value:string) => crypto.createHash("sha256").update(value).digest("hex");
const token = (user:{id:number;role:string}) => {
  const body=Buffer.from(JSON.stringify(user)).toString("base64url");
  const sig=crypto.createHmac("sha256",secret).update(body).digest("base64url");
  return body+"."+sig;
};
function auth(req:any,res:any,next:any){
  const raw=req.headers.authorization?.replace("Bearer ","");
  if(!raw) return res.status(401).json({message:"Login required"});
  try{
    const [body,sig]=raw.split(".");
    const expected=crypto.createHmac("sha256",secret).update(body).digest("base64url");
    if(sig!==expected) throw new Error();
    req.user=JSON.parse(Buffer.from(body,"base64url").toString());
    next();
  }catch{return res.status(401).json({message:"Invalid session"});}
}
const role=(...roles:string[]) => (req:any,res:any,next:any) => roles.includes(req.user?.role) ? next() : res.status(403).json({message:"Access denied"});

router.post("/auth/register",async(req,res)=>{
  try{
    const {name,email,password,role:requestedRole="customer"}=req.body||{};
    if(!name||!email||!password) return res.status(400).json({message:"Name, email and password are required"});
    const role=requestedRole==="provider"?"provider":"customer";
    const normalized=String(email).toLowerCase().trim();
    if((await db.select().from(users).where(eq(users.email,normalized))).length) return res.status(409).json({message:"Email already registered"});
    const [user]=await db.insert(users).values({name,email:normalized,passwordHash:hash(String(password)),role}).returning({id:users.id,name:users.name,email:users.email,role:users.role});
    res.status(201).json({user,token:token({id:user.id,role:user.role})});
  }catch(e){req.log?.error(e);res.status(500).json({message:"Registration failed"});}
});
router.post("/auth/login",async(req,res)=>{
  try{
    const {email,password}=req.body||{};
    const [user]=await db.select().from(users).where(eq(users.email,String(email||"").toLowerCase().trim()));
    if(!user||user.passwordHash!==hash(String(password||""))) return res.status(401).json({message:"Invalid email or password"});
    res.json({user:{id:user.id,name:user.name,email:user.email,role:user.role},token:token({id:user.id,role:user.role})});
  }catch(e){req.log?.error(e);res.status(500).json({message:"Login failed"});}
});

router.get("/providers",async(req,res)=>{
  try{
    const category=String(req.query.category||"").trim();
    const location=String(req.query.location||"").trim().toLowerCase();
    const maxPrice=Number(req.query.maxPrice||0);
    let rows=category?await db.select().from(providers).where(eq(providers.category,category)):await db.select().from(providers);
    if(location) rows=rows.filter(p=>p.location.toLowerCase().includes(location));
    if(maxPrice>0) rows=rows.filter(p=>p.price<=maxPrice);
    res.json(rows);
  }catch{res.status(500).json({message:"Could not load providers"});}
});

router.post("/providers",auth,role("provider","admin"),async(req:any,res)=>{
  try{
    const {name,category,location,price=0,rating=5,phone,description}=req.body||{};
    if(!name||!category||!location) return res.status(400).json({message:"Name, category and location are required"});
    const ownerId = req.user.role === "admin" ? Number(req.body?.ownerId || req.user.id) : req.user.id;
    const [provider]=await db.insert(providers).values({ownerId,name,category,location,price:Number(price),rating:Number(rating),phone,description,verified:req.user.role==="admin"?"approved":"pending"}).returning();
    res.status(201).json(provider);
  }catch(e){req.log?.error(e);res.status(500).json({message:"Provider creation failed"});}
});

router.post("/bookings",auth,async(req:any,res)=>{
  try{
    const {providerId,eventDate,notes}=req.body||{};
    if(!providerId||!eventDate) return res.status(400).json({message:"Provider and event date are required"});
    const date=new Date(eventDate);
    if(Number.isNaN(date.getTime())||date.getTime()<Date.now()) return res.status(400).json({message:"Choose a valid future event date"});
    const [booking]=await db.insert(bookings).values({customerId:req.user.id,providerId:Number(providerId),eventDate:date,notes,status:"pending"}).returning();
    res.status(201).json(booking);
  }catch(e){req.log?.error(e);res.status(500).json({message:"Booking failed"});}
});
router.get("/bookings/me",auth,async(req:any,res)=>res.json(await db.select().from(bookings).where(eq(bookings.customerId,req.user.id))));

router.get("/dashboard/customer",auth,async(req:any,res:any)=>{
  const user=(await db.select({id:users.id,name:users.name,email:users.email,role:users.role}).from(users).where(eq(users.id,req.user.id)))[0];
  const rows=await db.select().from(bookings).where(eq(bookings.customerId,req.user.id));
  res.json({user,bookings:rows,counts:{total:rows.length,pending:rows.filter(b=>b.status==="pending").length,confirmed:rows.filter(b=>b.status==="confirmed").length,completed:rows.filter(b=>b.status==="completed").length,cancelled:rows.filter(b=>b.status==="cancelled").length}});
});
router.get("/dashboard/provider",auth,role("provider"),async(req:any,res:any)=>{
  const owned=await db.select().from(providers).where(eq(providers.ownerId,req.user.id));
  const ids=new Set(owned.map(p=>p.id));
  const rows=(await db.select().from(bookings)).filter(b=>ids.has(b.providerId));
  res.json({providers:owned,bookings:rows,counts:{total:rows.length,pending:rows.filter(b=>b.status==="pending").length,confirmed:rows.filter(b=>b.status==="confirmed").length,completed:rows.filter(b=>b.status==="completed").length,cancelled:rows.filter(b=>b.status==="cancelled").length}});
});
router.get("/dashboard/admin",auth,role("admin"),async(_req:any,res:any)=>{
  const [allUsers,allProviders,allBookings]=await Promise.all([db.select().from(users),db.select().from(providers),db.select().from(bookings)]);
  res.json({counts:{users:allUsers.length,providers:allProviders.length,bookings:allBookings.length,pendingProviders:allProviders.filter(p=>p.verified==="pending").length},users:allUsers,providers:allProviders,bookings:allBookings});
});
router.patch("/providers/:id/verification",auth,role("admin"),async(req:any,res:any)=>{
  const verified=String(req.body?.verified||"");
  if(!["pending","approved","rejected"].includes(verified)) return res.status(400).json({message:"Invalid verification state"});
  const [updated]=await db.update(providers).set({verified}).where(eq(providers.id,Number(req.params.id))).returning();
  if(!updated) return res.status(404).json({message:"Provider not found"});
  res.json(updated);
});

router.get("/bookings/provider",auth,role("provider","admin"),async(req:any,res)=>{
  const rows=await db.select().from(bookings);
  res.json(rows);
});
router.patch("/bookings/:id/status",auth,role("provider","admin"),async(req:any,res)=>{
  const status=String(req.body?.status||"");
  if(!["pending","confirmed","completed","cancelled"].includes(status)) return res.status(400).json({message:"Invalid booking status"});
  const bookingId=Number(req.params.id);
  const existing = (await db.select().from(bookings).where(eq(bookings.id,bookingId)))[0];
  if(!existing) return res.status(404).json({message:"Booking not found"});
  if(req.user.role==="provider"){
    const owned=(await db.select().from(providers).where(eq(providers.id,existing.providerId)))[0];
    if(!owned || owned.ownerId!==req.user.id) return res.status(403).json({message:"You do not manage this booking"});
  }
  const [updated]=await db.update(bookings).set({status}).where(eq(bookings.id,bookingId)).returning();
  if(!updated) return res.status(404).json({message:"Booking not found"});
  res.json(updated);
});

export default router;
