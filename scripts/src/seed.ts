import { db } from "@workspace/db";
import {
  usersTable, photographersTable, packagesTable, bookingsTable,
  paymentsTable, reviewsTable, couponsTable, portfolioItemsTable
} from "@workspace/db";
import { createHmac, randomBytes } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Seeding database…");

  // Admin
  const [admin] = await db.insert(usersTable).values({
    name: "Admin User", email: "admin@eventshooter.in",
    passwordHash: hashPassword("admin123"), role: "admin",
    isVerified: true, city: "Mumbai", referralCode: "ADMIN001",
  }).onConflictDoNothing().returning();
  console.log("Admin:", admin?.id ?? "already exists");

  // Customer
  const [customer] = await db.insert(usersTable).values({
    name: "Priya Sharma", email: "priya@example.com",
    passwordHash: hashPassword("password123"), role: "customer",
    isVerified: true, city: "Mumbai", phone: "9876543210", referralCode: "CUST001",
  }).onConflictDoNothing().returning();
  console.log("Customer:", customer?.id ?? "already exists");

  // Photographers
  const photographerData = [
    { name: "Arjun Kapoor", email: "arjun@eventshooter.in", city: "Mumbai", specializations: ["Wedding", "Fashion"], startingPrice: 35000, rating: 4.9, experience: 8 },
    { name: "Sneha Reddy", email: "sneha@eventshooter.in", city: "Bangalore", specializations: ["Wedding", "Birthday", "Reel"], startingPrice: 25000, rating: 4.8, experience: 5 },
    { name: "Vikram Nair", email: "vikram@eventshooter.in", city: "Delhi", specializations: ["Corporate", "Fashion", "Drone"], startingPrice: 45000, rating: 4.7, experience: 10 },
    { name: "Meera Iyer", email: "meera@eventshooter.in", city: "Chennai", specializations: ["Wedding", "Maternity"], startingPrice: 30000, rating: 4.6, experience: 6 },
    { name: "Rohan Gupta", email: "rohan@eventshooter.in", city: "Hyderabad", specializations: ["Birthday", "Reel", "Corporate"], startingPrice: 18000, rating: 4.5, experience: 4 },
    { name: "Ananya Singh", email: "ananya@eventshooter.in", city: "Pune", specializations: ["Wedding", "Pre-wedding"], startingPrice: 40000, rating: 4.9, experience: 7 },
  ];

  for (const p of photographerData) {
    const [u] = await db.insert(usersTable).values({
      name: p.name, email: p.email, passwordHash: hashPassword("photo123"), role: "photographer",
      isVerified: true, city: p.city, referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    }).onConflictDoNothing().returning();
    if (!u) { console.log(`  Skipping ${p.name} (already exists)`); continue; }

    const [ph] = await db.insert(photographersTable).values({
      userId: u.id, displayName: p.name, city: p.city,
      bio: `Award-winning ${p.specializations[0].toLowerCase()} photographer based in ${p.city} with ${p.experience}+ years of experience.`,
      specializations: p.specializations, startingPrice: p.startingPrice,
      rating: p.rating, totalReviews: Math.floor(Math.random() * 80 + 20),
      totalBookings: Math.floor(Math.random() * 120 + 30),
      isApproved: true, isFeatured: p.rating >= 4.8, isVerified: true, isAvailable: true,
      yearsOfExperience: p.experience,
      equipment: "Sony A7IV, DJI Ronin, Profoto B10",
      instagramHandle: `@${p.name.toLowerCase().replace(/\s/g, ".")}_shoots`,
      coverImageUrl: `https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=200&background=random`,
    }).returning();
    console.log("  Photographer:", ph.id, p.name);

    // Packages
    await db.insert(packagesTable).values([
      {
        photographerId: ph.id, name: "Silver", description: "Essential coverage for intimate events",
        price: p.startingPrice, duration: 4, isActive: true,
        includes: ["1 photographer", "200 edited photos", "Online gallery", "3 month delivery"],
        eventTypes: p.specializations,
        addons: [{ name: "Extra hour", price: 5000 }, { name: "Drone shots", price: 8000 }],
      },
      {
        photographerId: ph.id, name: "Gold", description: "Complete coverage for memorable events",
        price: Math.round(p.startingPrice * 1.7), duration: 8, isActive: true,
        includes: ["2 photographers", "400 edited photos", "1 highlight reel (3 min)", "Same-day preview", "Online gallery"],
        eventTypes: p.specializations,
        addons: [{ name: "Photo book (100 pages)", price: 12000 }, { name: "Cinematic film", price: 15000 }],
      },
      {
        photographerId: ph.id, name: "Platinum", description: "Premium all-inclusive experience",
        price: Math.round(p.startingPrice * 2.8), duration: 12, isActive: true,
        includes: ["3 photographers + videographer", "600+ edited photos", "Full cinematic film", "Drone coverage", "Pre-event shoot", "Photo book"],
        eventTypes: p.specializations,
        addons: [{ name: "Second venue", price: 10000 }, { name: "Live streaming", price: 8000 }],
      },
    ]);

    // Portfolio
    const portfolioUrls = [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ];
    for (const url of portfolioUrls) {
      await db.insert(portfolioItemsTable).values({
        photographerId: ph.id, mediaUrl: url, mediaType: "photo",
        eventType: p.specializations[0], isApproved: true,
      });
    }
  }

  // Coupons
  await db.insert(couponsTable).values([
    {
      code: "WELCOME10", discountType: "percentage", discountValue: 10,
      minOrderAmount: 5000, maxDiscountAmount: 2000, usageLimit: 100, isActive: true,
    },
    {
      code: "FIRST1000", discountType: "flat", discountValue: 1000,
      minOrderAmount: 10000, usageLimit: 50, isActive: true,
    },
    {
      code: "WEDDING20", discountType: "percentage", discountValue: 20,
      minOrderAmount: 40000, maxDiscountAmount: 10000, usageLimit: 30, isActive: true,
    },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
