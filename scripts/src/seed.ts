import { db } from "@workspace/db";
import {
  usersTable,
  photographersTable,
  packagesTable,
  couponsTable,
  portfolioItemsTable,
} from "@workspace/db";
import { createHmac, randomBytes } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return `${salt}:${hash}`;
}

function createReferralCode(name: string): string {
  return name
    .replace(/\s+/g, "")
    .substring(0, 5)
    .toUpperCase()
    .padEnd(5, "X") + Math.floor(100 + Math.random() * 900);
}

async function main() {
  console.log("Seeding database...");

  await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@eventshooter.in",
    passwordHash: hashPassword("admin123"),
    role: "admin",
    isVerified: true,
    city: "Bhopal",
    referralCode: "ADMIN001",
  }).onConflictDoNothing();

  await db.insert(usersTable).values({
    name: "Priya Sharma",
    email: "priya@example.com",
    passwordHash: hashPassword("password123"),
    role: "customer",
    isVerified: true,
    city: "Bhopal",
    phone: "9876543210",
    referralCode: "CUST001",
  }).onConflictDoNothing();

  const photographerData = [
    {
      name: "Arjun Verma",
      email: "arjun@eventshooter.in",
      city: "Bhopal",
      specializations: ["Wedding", "Pre-wedding"],
      startingPrice: 25000,
      rating: 4.9,
      experience: 7,
      coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
        "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
      ],
    },
    {
      name: "Sneha Reddy",
      email: "sneha@eventshooter.in",
      city: "Indore",
      specializations: ["Birthday", "Party"],
      startingPrice: 15000,
      rating: 4.8,
      experience: 5,
      coverImageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      ],
    },
    {
      name: "Vikram Nair",
      email: "vikram@eventshooter.in",
      city: "Delhi",
      specializations: ["Corporate", "Conference"],
      startingPrice: 35000,
      rating: 4.7,
      experience: 9,
      coverImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
      ],
    },
    {
      name: "Meera Iyer",
      email: "meera@eventshooter.in",
      city: "Bhopal",
      specializations: ["Fashion", "Portfolio"],
      startingPrice: 30000,
      rating: 4.8,
      experience: 6,
      coverImageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800",
      ],
    },
    {
      name: "Rohan Gupta",
      email: "rohan@eventshooter.in",
      city: "Jabalpur",
      specializations: ["Reel", "Drone", "Party"],
      startingPrice: 18000,
      rating: 4.6,
      experience: 4,
      coverImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
      ],
    },
    {
      name: "Ananya Singh",
      email: "ananya@eventshooter.in",
      city: "Bhopal",
      specializations: ["Maternity", "Engagement"],
      startingPrice: 22000,
      rating: 4.9,
      experience: 6,
      coverImageUrl: "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=1200&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=800",
        "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
      ],
    },
  ];

  for (const p of photographerData) {
    const insertedUsers = await db.insert(usersTable).values({
      name: p.name,
      email: p.email,
      passwordHash: hashPassword("photo123"),
      role: "photographer",
      isVerified: true,
      city: p.city,
      referralCode: createReferralCode(p.name),
    }).onConflictDoNothing().returning();

    const user = insertedUsers[0];

    if (!user) {
      console.log(`Skipping ${p.name} - already exists`);
      continue;
    }

    const insertedPhotographers = await db.insert(photographersTable).values({
      userId: user.id,
      displayName: p.name,
      city: p.city,
      bio: `Hi, I am ${p.name}, a professional ${p.specializations[0].toLowerCase()} photographer from ${p.city}. I capture real emotions, creative moments, and beautiful memories with ${p.experience}+ years of experience.`,
      specializations: p.specializations,
      startingPrice: p.startingPrice,
      rating: p.rating,
      totalReviews: Math.floor(Math.random() * 80 + 20),
      totalBookings: Math.floor(Math.random() * 120 + 30),
      isApproved: true,
      isFeatured: p.rating >= 4.8,
      isVerified: true,
      isAvailable: true,
      yearsOfExperience: p.experience,
      equipment: "Sony A7IV, Canon EOS R6, DJI Ronin, Godox Lighting Kit",
      instagramHandle: `@${p.name.toLowerCase().replace(/\s/g, ".")}_shoots`,
      coverImageUrl: p.coverImageUrl,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=200&background=random`,
    }).returning();

    const photographer = insertedPhotographers[0];

    if (!photographer) {
      console.log(`Photographer profile not created for ${p.name}`);
      continue;
    }

    await db.insert(packagesTable).values([
      {
        photographerId: photographer.id,
        name: "Silver",
        description: "Best for small and intimate events",
        price: p.startingPrice,
        duration: 4,
        isActive: true,
        includes: ["1 photographer", "150 edited photos", "Online gallery", "3 week delivery"],
        eventTypes: p.specializations,
        addons: [
          { name: "Extra hour", price: 3000 },
          { name: "Short reel", price: 5000 },
        ],
      },
      {
        photographerId: photographer.id,
        name: "Gold",
        description: "Complete event photography package",
        price: Math.round(p.startingPrice * 1.7),
        duration: 8,
        isActive: true,
        includes: ["2 photographers", "350 edited photos", "Highlight reel", "Online gallery"],
        eventTypes: p.specializations,
        addons: [
          { name: "Photo album", price: 10000 },
          { name: "Drone shots", price: 8000 },
        ],
      },
      {
        photographerId: photographer.id,
        name: "Platinum",
        description: "Premium all-inclusive photography and video package",
        price: Math.round(p.startingPrice * 2.5),
        duration: 12,
        isActive: true,
        includes: ["3 photographers", "600+ edited photos", "Cinematic film", "Drone coverage", "Photo album"],
        eventTypes: p.specializations,
        addons: [
          { name: "Live streaming", price: 10000 },
          { name: "Second venue coverage", price: 12000 },
        ],
      },
    ]);

    for (const url of p.portfolio) {
      await db.insert(portfolioItemsTable).values({
        photographerId: photographer.id,
        mediaUrl: url,
        mediaType: "photo",
        eventType: p.specializations[0],
        isApproved: true,
      });
    }

    console.log(`Created photographer: ${p.name}`);
  }

  await db.insert(couponsTable).values([
    {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 5000,
      maxDiscountAmount: 2000,
      usageLimit: 100,
      isActive: true,
    },
    {
      code: "FIRST1000",
      discountType: "flat",
      discountValue: 1000,
      minOrderAmount: 10000,
      usageLimit: 50,
      isActive: true,
    },
    {
      code: "WEDDING20",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 40000,
      maxDiscountAmount: 10000,
      usageLimit: 30,
      isActive: true,
    },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});