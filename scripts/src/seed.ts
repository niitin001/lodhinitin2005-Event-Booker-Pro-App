import { db } from "@workspace/db";
import {
  usersTable,
  photographersTable,
  packagesTable,
  couponsTable,
  portfolioItemsTable,
} from "@workspace/db";
import { createHmac, randomBytes } from "crypto";
import { eq } from "drizzle-orm";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return `${salt}:${hash}`;
}
function createReferralCode(name: string): string {
  return name.replace(/\s+/g, "").substring(0, 5).toUpperCase().padEnd(5, "X") + Math.floor(100 + Math.random() * 900);
}

// ─── Real photographers from images ───
const PHOTOGRAPHERS = [
  {
    name: "Rudransh Films",
    email: "rudranshfilms@eventshooter.in",
    city: "Bhopal",
    whatsapp: "9348912960",
    instagram: "21rudranshfilms",
    bio: "RKMEDIA.PVT.LTD — We Don't Just Capture Moments, We Create Memories. Cinematic wedding photography & videography specialists serving Bhopal and surrounding areas.",
    specializations: ["Wedding", "Pre-Wedding", "Birthday", "Ceremony"],
    startingPrice: 12000,
    rating: 4.8,
    experience: 6,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
    ],
    packages: [
      { name: "Traditional Wedding", description: "Traditional photo & video coverage", price: 18000, duration: 8, includes: ["1 photographer", "1 videographer", "Edited photos", "Full video", "Online gallery"] },
      { name: "Cinematic Wedding", description: "Premium cinematic film + photography", price: 35000, duration: 12, includes: ["2 photographers", "Cinematic video", "Drone shots", "400+ edited photos", "Luxury album"] },
      { name: "Pre-Wedding Shoot", description: "Romantic couple outdoor shoot", price: 12000, duration: 4, includes: ["1 photographer", "100+ edited photos", "2 locations", "Online gallery"] },
      { name: "Birthday Shoot", description: "Beautiful birthday photography", price: 15000, duration: 5, includes: ["1 photographer", "200+ edited photos", "Edited reel", "Online gallery"] },
      { name: "Ceremony Cinematic", description: "Cinematic ceremony coverage", price: 30000, duration: 10, includes: ["2 photographers", "Cinematic video", "300+ photos", "Drone coverage"] },
    ],
  },
  {
    name: "Bittu Kushwah Photography",
    email: "bittukushwah@eventshooter.in",
    city: "Gwalior",
    whatsapp: "7987967692",
    instagram: "bittu_kushwah_photographer",
    bio: "Budget-friendly photography for all your special moments — weddings, birthdays, pujas, and any event. Contact me for any shoot requirement!",
    specializations: ["Wedding", "Birthday", "Haldi", "Poojan"],
    startingPrice: 500,
    rating: 4.5,
    experience: 3,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
    ],
    packages: [
      { name: "Full Wedding", description: "Complete wedding shoot at lowest price", price: 2000, duration: 12, includes: ["Full wedding coverage", "Edited photos", "Pen drive delivery"] },
      { name: "Haldi Shoot", description: "Haldi ceremony photography", price: 500, duration: 2, includes: ["Haldi coverage", "Edited photos"] },
      { name: "Barat Shoot", description: "Barat + Jaymala pose coverage", price: 1000, duration: 3, includes: ["Barat coverage", "Jaymala poses", "Edited photos"] },
      { name: "Birthday / Poojan", description: "Birthday party or poojan shoot", price: 500, duration: 2, includes: ["Event coverage", "Edited photos"] },
    ],
  },
  {
    name: "Neeraj Photography",
    email: "neerajphotography@eventshooter.in",
    city: "Delhi",
    whatsapp: "7017149657",
    instagram: "ns_digitek_film",
    bio: "5.0 stars | 500+ reviews | 100+ weddings covered across Delhi & Uttarakhand. Luxury wedding photography & films. On-time delivery guaranteed. WhatsApp available.",
    specializations: ["Wedding", "Pre-Wedding", "Engagement", "Haldi", "Mehendi"],
    startingPrice: 25000,
    rating: 5.0,
    experience: 8,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800",
    ],
    packages: [
      { name: "Silver – 1 Day Wedding", description: "1-day wedding coverage (Haldi to Reception)", price: 25000, duration: 8, includes: ["Team 2+2", "Edited photos", "Luxury album", "Premium photo frame", "Social media reels", "Trailer video", "40-sheet album"] },
      { name: "Gold – 2 Day Package", description: "2-day Haldi/Mehendi + Wedding coverage", price: 35000, duration: 16, includes: ["Day 1: Team 1+1", "Day 2: Team 2+2", "Edited photos", "Online gallery (50 shots)", "Social media reels", "Cinematic video (5-7 min)", "Complimentary gift"] },
      { name: "Platinum – 3 Day Package", description: "Full engagement + Haldi + Wedding coverage", price: 50000, duration: 24, includes: ["Day 1-3: Full team", "All functions covered", "Drone coverage", "Social media reels", "30-sheet album (2 pcs)", "Cinematic wedding film"] },
    ],
  },
  {
    name: "Work by Sumit",
    email: "workbysumit@eventshooter.in",
    city: "Indore",
    whatsapp: "7987573394",
    instagram: "work_by_sumit",
    bio: "Let's Make Your Memories Stand Out! Reels, Photography, Graphic Designing — Stories, Posts, Advertisements, Wedding Cards, Invitation Cards. Professional creative services for all your needs.",
    specializations: ["Reel", "Photography", "Corporate", "Product", "Graphic Design"],
    startingPrice: 800,
    rating: 4.7,
    experience: 4,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
    ],
    packages: [
      { name: "Single Reel", description: "One professional reel", price: 800, duration: 1, includes: ["1 reel", "Professional edit", "Background music"] },
      { name: "Reel + Voiceover", description: "Reel with voiceover narration", price: 1200, duration: 2, includes: ["1 reel with voiceover", "Script assistance", "Professional edit"] },
      { name: "3 Reels Pack", description: "Bundle of 3 reels", price: 2200, duration: 4, includes: ["3 reels", "Professional edit", "Background music", "Delivery in 48 hrs"] },
      { name: "5 Reels Pack", description: "Bundle of 5 reels", price: 3700, duration: 6, includes: ["5 reels", "Professional edit", "Priority delivery"] },
      { name: "Photography – Half Day", description: "Professional photography (6 hours)", price: 3500, duration: 6, includes: ["6 hours shoot", "100+ edited photos", "Online gallery"] },
    ],
  },
  {
    name: "Deepu Photography",
    email: "deepuphotography@eventshooter.in",
    city: "Nagpur",
    whatsapp: "7295926707",
    instagram: "deepu_photography.99",
    bio: "Every Moment is Precious, Let Us Capture It Beautifully. Specializing in engagement, baby, anniversary, party, and portrait shoots. Add-ons available: reels, full video, album.",
    specializations: ["Engagement", "Birthday", "Anniversary", "Portrait", "Baby Shoot"],
    startingPrice: 2499,
    rating: 4.6,
    experience: 5,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=800",
      "https://images.unsplash.com/photo-1524160101800-c8a6c001fb5a?w=800",
      "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=800",
    ],
    packages: [
      { name: "Traditional Shoot", description: "Traditional ceremony photography", price: 2499, duration: 3, includes: ["Edited photos", "Online gallery"] },
      { name: "Baby / Portrait Shoot", description: "Adorable baby or portrait session", price: 3499, duration: 2, includes: ["Professional studio setup", "50+ edited photos", "Online gallery"] },
      { name: "Engagement Shoot", description: "Romantic engagement photography", price: 5999, duration: 4, includes: ["2 locations", "100+ edited photos", "Online gallery", "1 reel"] },
      { name: "Anniversary Shoot", description: "Anniversary couple photography", price: 4999, duration: 3, includes: ["Location shoot", "80+ edited photos", "Online gallery"] },
      { name: "Party Program", description: "Birthday / party coverage", price: 3999, duration: 4, includes: ["Full event coverage", "200+ edited photos", "Short highlight video"] },
    ],
  },
  {
    name: "Innovatehub Studios",
    email: "innovatehub@eventshooter.in",
    city: "Delhi",
    whatsapp: null,
    instagram: "innovatehub_studios",
    bio: "Professional | Creative | Memorable. Offering beginner to premium photography packages across India. Specializing in model portfolios, fashion shoots, and wedding photography.",
    specializations: ["Fashion", "Portfolio", "Wedding", "Product", "Corporate"],
    startingPrice: 5000,
    rating: 4.7,
    experience: 7,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800",
    ],
    packages: [
      { name: "Mini Shoot (30-60 min)", description: "Quick outdoor/casual shoot", price: 5000, duration: 1, includes: ["30-60 min session", "10+ edited photos", "Single location"] },
      { name: "Portrait Shoot", description: "Professional portrait session", price: 7500, duration: 2, includes: ["2 hour session", "30+ edited photos", "2 looks"] },
      { name: "Model Portfolio", description: "Complete portfolio shoot", price: 20000, duration: 6, includes: ["Full day shoot", "Multiple looks", "50+ edited photos", "Online gallery"] },
      { name: "Wedding Photography", description: "Full wedding photography", price: 50000, duration: 12, includes: ["Full day coverage", "300+ photos", "Edited album", "Online gallery"] },
    ],
  },
  {
    name: "Gunja Films Studio",
    email: "gunjafilms@eventshooter.in",
    city: "Raipur",
    whatsapp: "9149785892",
    instagram: "gunjafilms.studio",
    bio: "Har Pal, Hamesha Ke Liye — Memories jo feel ho, videos jo hamesha rahe. Candid Master Akku & team. High Quality | On Time | Latest Equipment | 100% Satisfaction. Location: Raipur, Mahaveer Nagar.",
    specializations: ["Wedding", "Pre-Wedding", "Drone", "Events", "Corporate"],
    startingPrice: 18000,
    rating: 4.8,
    experience: 5,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
    ],
    packages: [
      { name: "Silver Wedding", description: "Essential wedding coverage", price: 18000, duration: 8, includes: ["1 photographer", "1 videographer", "Edited photos", "Full video", "Online gallery"] },
      { name: "Gold Wedding", description: "Premium wedding package with drone", price: 28000, duration: 12, includes: ["2 photographers", "Cinematic video", "Drone shots", "300+ photos", "Album"] },
      { name: "Pre-Wedding Shoot", description: "Romantic outdoor pre-wedding", price: 10000, duration: 4, includes: ["Location shoot", "100+ photos", "Short reel"] },
      { name: "Drone Package", description: "Aerial drone photography & video", price: 8000, duration: 3, includes: ["Drone photography", "Aerial video", "Edited deliverables"] },
    ],
  },
  {
    name: "PS Photography",
    email: "psphotography@eventshooter.in",
    city: "Mumbai",
    whatsapp: "6265731007",
    instagram: "ai_ps__photography_02",
    bio: "Capturing Moments, Creating Memories. Cinematic, Candid, Traditional photography. Baby shoots, Reels. Starting just ₹1999! Free 1 reel video & same day preview. Serving your city and nearby areas.",
    specializations: ["Wedding", "Candid", "Traditional", "Baby Shoot", "Reel"],
    startingPrice: 1999,
    rating: 4.5,
    experience: 4,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=800",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
    ],
    packages: [
      { name: "Starter Pack", description: "All types of shoots starting offer", price: 1999, duration: 3, includes: ["1 reel free", "Same day preview", "High quality editing", "Edited photos"] },
      { name: "Wedding Package", description: "Complete wedding coverage", price: 15000, duration: 10, includes: ["Full day coverage", "Cinematic video", "200+ edited photos", "Online gallery"] },
      { name: "Baby Shoot", description: "Adorable baby photography", price: 3999, duration: 2, includes: ["Studio props", "30+ edited photos", "Online gallery"] },
    ],
  },
  {
    name: "Utsav Sathi Photography",
    email: "utsavsathi@eventshooter.in",
    city: "Patna",
    whatsapp: null,
    instagram: "utsavsathi",
    bio: "Patna waalon ke liye — ab shadiyon ki yaadein hongi aur bhi khoobsurat, bina budget ki tension ke! Affordable luxury wedding photography in Patna & Bihar.",
    specializations: ["Wedding", "Candid", "Videography", "Drone"],
    startingPrice: 35000,
    rating: 4.6,
    experience: 6,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800",
    ],
    packages: [
      { name: "Package 1 – Traditional", description: "Traditional photo + video package", price: 35000, duration: 10, includes: ["Traditional photography", "Traditional videography", "30-sheet album (180 pics)", "1/2 hour full video", "Master video"] },
      { name: "Package 2 – Semi-Cinematic", description: "Candid + drone wedding coverage", price: 70000, duration: 16, includes: ["Traditional photo/video", "Candid photography", "Drone wedding day", "Cinematography", "40-sheet album (240 pics)", "Cinematic video"] },
      { name: "Package 3 – Full Cinematic", description: "Premium all-functions coverage", price: 100000, duration: 24, includes: ["Cinematic & traditional", "Candid photography", "All functions covered", "3 reels video", "30-sheet album (300 pics)", "All photos soft copy"] },
    ],
  },
  {
    name: "AK Photography",
    email: "akphotography@eventshooter.in",
    city: "Jharkhand",
    whatsapp: "6202293744",
    instagram: "ak.signature.shots",
    bio: "AK Photography Jharkhand — We Capture Your Best Moments. Complete Photo + Video + Album package. 250-400 edited photos, 3-5 min cinematic highlight video, 12x36 HD album. Limited dates available — Book Now!",
    specializations: ["Wedding", "Videography", "Album", "Engagement", "Pre-Wedding"],
    startingPrice: 30000,
    rating: 4.8,
    experience: 7,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
    ],
    packages: [
      { name: "Complete Wedding Package", description: "Full photo + video + album combo", price: 30000, duration: 12, includes: ["250-400 edited photos", "3-5 min cinematic highlight video", "Full event video", "12x36 HD album (20-25 sheets)", "Instagram reel", "Google Drive delivery"] },
      { name: "Pre-Wedding Shoot", description: "Romantic outdoor shoot", price: 8000, duration: 4, includes: ["80+ edited photos", "1 location", "Online gallery", "Short reel"] },
    ],
  },
  {
    name: "ClickTech Productions",
    email: "clicktech@eventshooter.in",
    city: "Bangalore",
    whatsapp: "9845118183",
    instagram: "clicktech_productions",
    bio: "Wedding Bookings Open for 2026! Professional photography & videography. Budget Friendly to Premium packages for Reception & Muhurtham. Candid, Traditional, Drone coverage available.",
    specializations: ["Wedding", "Candid", "Drone", "Videography", "Corporate"],
    startingPrice: 79999,
    rating: 4.9,
    experience: 10,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
    ],
    packages: [
      { name: "Budget Friendly", description: "Reception & Muhurtham — essential coverage", price: 79999, duration: 12, includes: ["1 candid photographer", "1 traditional photographer", "1 traditional videographer", "Cinematic highlights (3-5 min)", "1 Instagram reel", "1 premium album (40 pages)", "All edited photos & videos"] },
      { name: "Mid-Range Package", description: "2 candid photographers + drone", price: 109999, duration: 16, includes: ["2 candid photographers", "1 traditional photographer", "2 traditional videographers", "Cinematic highlights film", "Teaser video + 2 Instagram reels", "Drone coverage", "2 premium albums (40 pages each)", "Hard drive with all data"] },
      { name: "Premium Package", description: "Full luxury wedding production", price: 149999, duration: 24, includes: ["2 candid + 2 traditional photographers", "2 cinematographers", "Cinematic wedding film (10-15 min)", "Teaser video + 3 reels", "Drone coverage", "LED wall display (6x8 ft)", "Same day edit", "2 premium albums (40 pages)", "Online gallery"] },
    ],
  },
  {
    name: "Frame & Focus Films",
    email: "frameandfocus@eventshooter.in",
    city: "Jharkhand",
    whatsapp: "9771387852",
    instagram: "frameeeandfocuss_",
    bio: "Frame & Focus Film & Foto — Capturing Love Stories, Turning Moments into Memories. Based in Rajmahal, Jharkhand. Silver, Gold, Platinum wedding packages. Pre-wedding & drone add-ons available.",
    specializations: ["Wedding", "Pre-Wedding", "Drone", "Mehendi", "Haldi"],
    startingPrice: 30000,
    rating: 4.7,
    experience: 6,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    ],
    packages: [
      { name: "Silver Package", description: "All functions: Haldi, Mehendi, Wedding, Reception (1 day)", price: 30000, duration: 10, includes: ["1 day wedding coverage", "1 photographer + 1 videographer", "25 sheets album (12x18)", "All raw copies (high quality)"] },
      { name: "Gold Package", description: "2-day full coverage", price: 55000, duration: 16, includes: ["2 days wedding coverage", "1 photographer + 1 cinematographer", "35 sheets album (12x18 premium)", "All raw copies (high quality)"] },
      { name: "Platinum Package", description: "Full 3-day wedding production", price: 90000, duration: 24, includes: ["Full wedding coverage (3 days)", "2 photographers + 2 cinematographers", "45 sheets album (12x18 premium)", "Drone coverage", "All raw copies (high quality)"] },
      { name: "Pre-Wedding Shoot", description: "Outdoor pre-wedding photography", price: 20000, duration: 4, includes: ["Pre-wedding photography", "Outdoor locations", "Edited photos"] },
    ],
  },
  {
    name: "RDX Photography Studio",
    email: "rdxphotography@eventshooter.in",
    city: "Mauganj",
    whatsapp: "8799014125",
    instagram: "rdxclicks_",
    bio: "We Don't Take Pictures, We Capture Memories. RDX Photography Studio — Professional gear, premium quality, memories forever. K Pass RDX Studio, District Mauganj MP. Book your shoot now!",
    specializations: ["Wedding", "Drone", "Video", "Birthday", "Pre-Wedding"],
    startingPrice: 20000,
    rating: 4.6,
    experience: 5,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    ],
    packages: [
      { name: "Silver", description: "Essential wedding package", price: 20000, duration: 8, includes: ["Video camera", "Photo camera", "Pen drive", "160 album photos"] },
      { name: "Gold", description: "Premium wedding with drone", price: 28000, duration: 12, includes: ["Drone shot", "Video & photo camera", "5 reels", "Pen drive", "200 album photos", "Waterproof album"] },
      { name: "Premium", description: "Full cinematic wedding production", price: 35000, duration: 14, includes: ["Cinematic photography", "Video & photo camera", "10 reels", "Pen drive", "240 album photos", "Waterproof album"] },
    ],
  },
  {
    name: "Click on Demand",
    email: "clickondemand@eventshooter.in",
    city: "Hyderabad",
    whatsapp: null,
    instagram: "clickondemand_",
    bio: "By Artistic Root — Turning moments into timeless visuals. Premium photo & video services. Creative | Unique | Modern. Professional | Experienced | Trusted. Let's Capture Your Best Moments!",
    specializations: ["Portrait", "Couple", "Fashion", "Pre-Wedding", "Birthday"],
    startingPrice: 699,
    rating: 4.8,
    experience: 4,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
      "https://images.unsplash.com/photo-1524160101800-c8a6c001fb5a?w=800",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
    ],
    packages: [
      { name: "1 Hour Session", description: "Quick outdoor / casual shoot", price: 699, duration: 1, includes: ["50 photos", "10 edited photos", "Single location", "Outdoor/casual shoot"] },
      { name: "2 Hour Session", description: "Extended shoot with multiple poses", price: 1299, duration: 2, includes: ["100+ photos", "20 edited photos", "1-2 locations", "Multiple poses & angles"] },
      { name: "3 Hour Session", description: "In-depth shoot with reels", price: 1999, duration: 3, includes: ["150+ photos", "35 edited photos", "2-3 locations", "Reel shots included"] },
      { name: "4+ Hours Custom", description: "Full day custom photography", price: 2499, duration: 5, includes: ["200+ photos", "50+ edited photos", "Multiple locations", "Reel + short video"] },
    ],
  },
  {
    name: "Arun Kumar Photography",
    email: "arunkumar@eventshooter.in",
    city: "Bareilly",
    whatsapp: "9193256274",
    instagram: "candidbyarun",
    bio: "Capturing Moments, Creating Memories. Freelance photographer based in Bareilly. Affordable packages for all wedding functions — Haldi, Mehndi, Reception, Ring Ceremony, Full Wedding, Birthday. Outstation policy: package price doubles outside Bareilly.",
    specializations: ["Wedding", "Haldi", "Mehndi", "Birthday", "Ceremony"],
    startingPrice: 1000,
    rating: 4.5,
    experience: 3,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800",
    ],
    packages: [
      { name: "Single Function (Up to 6 hrs)", description: "Haldi, Mehndi, Reception, Ring Ceremony or Half Wedding", price: 1000, duration: 6, includes: ["Full function coverage", "Edited photos", "Online delivery"] },
      { name: "Full Wedding (Up to 12 hrs)", description: "Complete wedding day coverage", price: 2000, duration: 12, includes: ["Full wedding coverage", "Edited photos", "Online delivery"] },
      { name: "Birthday Party (Up to 6 hrs)", description: "Birthday celebration photography", price: 1000, duration: 6, includes: ["Full birthday coverage", "Edited photos", "Online delivery"] },
    ],
  },
  {
    name: "Bihari Babu Films",
    email: "biharibabufilms@eventshooter.in",
    city: "Patna",
    whatsapp: "7808100906",
    instagram: "biharibabuafilms",
    bio: "We Shoot Every Moment, Every Emotion. Photo & video shoot, phone & camera both supported, cinematic films, high quality photos, drone shoot. Weddings, Pre-weddings, Events, Car Delivery, New Home Puja, Birthdays, Corporate. Drop a message on WhatsApp!",
    specializations: ["Wedding", "Pre-Wedding", "Drone", "Birthday", "Corporate"],
    startingPrice: 10000,
    rating: 4.6,
    experience: 5,
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
    ],
    packages: [
      { name: "Wedding Package", description: "Full wedding photography & video", price: 20000, duration: 10, includes: ["Wedding coverage", "Cinematic film", "High quality photos", "Online delivery"] },
      { name: "Pre-Wedding + Events", description: "Pre-wedding or event shoot", price: 10000, duration: 4, includes: ["Location shoot", "100+ photos", "Short highlight video"] },
      { name: "Birthday + Corporate", description: "Birthday party or corporate event", price: 8000, duration: 5, includes: ["Event coverage", "200+ edited photos", "Highlight reel"] },
      { name: "Drone Package", description: "Aerial drone photography", price: 6000, duration: 3, includes: ["Drone photography", "Aerial video", "Edited deliverables"] },
    ],
  },
  {
    name: "Black Magic Studio",
    email: "blackmagicstudio@eventshooter.in",
    city: "Chennai",
    whatsapp: "8637643399",
    instagram: "black_magic_studioz",
    bio: "Your Love Story Deserves Timeless Memories. 4K Cinematic Quality | Drone Coverage | Cinematic Films | Instagram Reels. Turning Moments Into Timeless Memories. Available across Tamil Nadu.",
    specializations: ["Wedding", "Cinematic", "Drone", "Reel", "Videography"],
    startingPrice: 34999,
    rating: 4.9,
    experience: 8,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=1200&q=80",
    portfolio: [
      "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800",
    ],
    packages: [
      { name: "Classic", description: "Traditional + candid package", price: 34999, duration: 10, includes: ["Traditional photo & video", "Candid photo", "Outdoor photoshoot", "Premium album", "Video edit with pendrive", "Wood frame (complimentary)", "Calendar"] },
      { name: "Premium", description: "Most popular — full cinematic", price: 54999, duration: 12, includes: ["Traditional photo & video", "Outdoor photo & video", "Candid photo", "Premium album", "Video edit with 4K pendrive", "Wood frame x2 (complimentary)", "Calendar"] },
      { name: "Luxury", description: "Luxury album + cinematic teaser", price: 79999, duration: 14, includes: ["All Premium inclusions", "Luxury album", "4K video edit", "Cinematic teaser + insta reels", "Wood frame x2 (complimentary)"] },
      { name: "Ultra-Luxury", description: "Full cinematic production", price: 99999, duration: 16, includes: ["All Luxury inclusions", "2 luxury albums", "8K video edit", "Cinematic full video", "Insta reels unlimited", "Wood frame x2", "Surprise gifts"] },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // ── Admin & Customer ──
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

  // ── Clear existing photographer data ──
  console.log("Clearing existing photographer data...");
  const existingPhotographers = await db.select({ id: photographersTable.id }).from(photographersTable);
  for (const p of existingPhotographers) {
    await db.delete(portfolioItemsTable).execute();
    await db.delete(packagesTable).execute();
    break; // one pass clears all
  }
  const existingPhotoUserIds = await db.select({ userId: photographersTable.userId }).from(photographersTable);
  await db.delete(photographersTable).execute();
  for (const { userId } of existingPhotoUserIds) {
    await db.delete(usersTable).where(eq(usersTable.id, userId)).execute().catch(() => {});
  }

  // ── Seed real photographers ──
  for (const p of PHOTOGRAPHERS) {
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
      bio: p.bio,
      specializations: p.specializations,
      startingPrice: p.startingPrice,
      rating: p.rating,
      totalReviews: Math.floor(Math.random() * 120 + 30),
      totalBookings: Math.floor(Math.random() * 180 + 50),
      isApproved: true,
      isFeatured: p.isFeatured,
      isVerified: true,
      isAvailable: true,
      yearsOfExperience: p.experience,
      equipment: "Canon EOS R6, Sony A7IV, DJI Drone, Godox Lighting",
      instagramHandle: p.instagram,
      whatsappNumber: p.whatsapp || null,
      coverImageUrl: p.coverImage,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=200&background=random&color=fff`,
    }).returning();

    const photographer = insertedPhotographers[0];
    if (!photographer) { console.log(`Could not create profile for ${p.name}`); continue; }

    // Insert packages
    for (const pkg of p.packages) {
      await db.insert(packagesTable).values({
        photographerId: photographer.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        isActive: true,
        includes: pkg.includes,
        eventTypes: p.specializations,
        addons: [
          { name: "Extra hour", price: Math.round(pkg.price * 0.1) },
          { name: "Short reel", price: 1500 },
        ],
      });
    }

    // Insert portfolio
    for (const url of p.portfolio) {
      await db.insert(portfolioItemsTable).values({
        photographerId: photographer.id,
        mediaUrl: url,
        mediaType: "photo",
        eventType: p.specializations[0],
        isApproved: true,
      });
    }

    console.log(`Created photographer: ${p.name} | WA: ${p.whatsapp || "N/A"} | IG: @${p.instagram}`);
  }

  // ── Coupons ──
  await db.insert(couponsTable).values([
    { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrderAmount: 5000, maxDiscountAmount: 2000, usageLimit: 100, isActive: true },
    { code: "FIRST1000", discountType: "flat", discountValue: 1000, minOrderAmount: 10000, usageLimit: 50, isActive: true },
    { code: "WEDDING20", discountType: "percentage", discountValue: 20, minOrderAmount: 40000, maxDiscountAmount: 10000, usageLimit: 30, isActive: true },
    { code: "RUDRANSH15", discountType: "percentage", discountValue: 15, minOrderAmount: 15000, maxDiscountAmount: 5000, usageLimit: 20, isActive: true },
  ]).onConflictDoNothing();

  console.log("\nSeed complete! All real photographers added.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
