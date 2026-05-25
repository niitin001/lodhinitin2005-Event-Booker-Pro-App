export interface Vendor {
  id: number;
  name: string;
  role: string;
  city: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  image: string;
  tags: string[];
  about: string;
}

export interface Package {
  name: string;
  price: number;
  duration: string;
  includes: string[];
  popular?: boolean;
}

export interface CategoryData {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  accentColor: string;
  description: string;
  services: string[];
  vendors: Vendor[];
  packages: Package[];
  faqs: { q: string; a: string }[];
}

export const CATEGORY_DATA: Record<string, CategoryData> = {
  wedding: {
    slug: "wedding",
    title: "Wedding Services",
    subtitle: "Your dream wedding, perfectly captured and beautifully planned.",
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80",
    accentColor: "#c9935a",
    description: "From breathtaking photography and cinematic videography to stunning decor and flawless makeup — we connect you with the best wedding vendors in India.",
    services: ["Photography", "Videography", "Decoration", "Makeup & Bridal", "Mehendi", "Catering", "Venue", "DJ & Music"],
    vendors: [
      { id: 101, name: "Arjun Kapoor Studios", role: "Wedding Photographer", city: "Mumbai", rating: 4.9, reviews: 234, startingPrice: 45000, image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80", tags: ["Photography", "Candid", "Cinematic"], about: "Award-winning wedding photographer with 10+ years experience. Specialises in candid and destination weddings." },
      { id: 102, name: "Priya Mehta Bridal Studio", role: "Bridal Makeup Artist", city: "Delhi", rating: 4.8, reviews: 187, startingPrice: 15000, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", tags: ["Bridal Makeup", "HD Makeup", "Airbrush"], about: "Celebrity bridal makeup artist known for natural, long-lasting looks that photograph beautifully." },
      { id: 103, name: "Royal Blooms Decor", role: "Wedding Decorator", city: "Bangalore", rating: 4.7, reviews: 142, startingPrice: 75000, image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80", tags: ["Floral", "Theme Decor", "Mandap"], about: "Creating magical wedding environments with fresh florals, lighting, and custom installations since 2010." },
      { id: 104, name: "CinemaWed Films", role: "Wedding Videographer", city: "Hyderabad", rating: 4.9, reviews: 198, startingPrice: 55000, image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80", tags: ["Cinematic Film", "Drone", "Same-day Edit"], about: "Cinematic wedding films that tell your love story. Hollywood-style production for your most precious day." },
      { id: 105, name: "Ananya Mehendi Art", role: "Mehendi Artist", city: "Jaipur", rating: 4.8, reviews: 312, startingPrice: 8000, image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", tags: ["Bridal Mehendi", "Arabic", "Rajasthani"], about: "Traditional and contemporary mehendi designs crafted with love. Bridal specialist for 8+ years." },
      { id: 106, name: "Grand Feast Catering", role: "Wedding Caterer", city: "Pune", rating: 4.6, reviews: 98, startingPrice: 250000, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80", tags: ["Multi-cuisine", "Live Counters", "Dessert Bar"], about: "Serving over 500+ weddings. Multi-cuisine expertise with live cooking stations and beautiful presentation." },
    ],
    packages: [
      { name: "Silver Wedding", price: 85000, duration: "1 Day", includes: ["1 Photographer (8hrs)", "200 edited photos", "Makeup artist (1 session)", "Basic floral decor", "Online gallery"], },
      { name: "Gold Wedding", price: 185000, duration: "2 Days", includes: ["2 Photographers", "Cinematographer", "400+ edited photos", "Full cinematic film (10 min)", "Bridal makeup + family", "Full venue decoration", "Drone shots"], popular: true },
      { name: "Platinum Wedding", price: 350000, duration: "3 Days", includes: ["3 Photographers + 2 videographers", "600+ edited photos", "30-min cinematic film", "Pre-wedding shoot", "Bridal + groom makeup", "Premium decor & florals", "Drone + same-day edit", "Photo book (100 pages)", "Mehendi artist"], },
    ],
    faqs: [
      { q: "How early should I book wedding vendors?", a: "We recommend booking 6-12 months in advance for peak wedding season (Oct-Feb). For off-season, 3-4 months is usually sufficient." },
      { q: "Can I customise packages?", a: "Absolutely! All our packages can be customised. Add or remove services to fit your exact budget and requirements." },
      { q: "Do vendors travel to destination weddings?", a: "Yes, most of our vendors are available for destination weddings. Travel and accommodation costs are charged separately." },
    ],
  },

  corporate: {
    slug: "corporate",
    title: "Corporate Events",
    subtitle: "Professional event solutions for conferences, launches, and corporate gatherings.",
    heroImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80",
    accentColor: "#2563eb",
    description: "From annual conferences and product launches to team events and award ceremonies — we provide complete corporate event solutions that make your brand shine.",
    services: ["Event Photography", "Stage & AV Setup", "Conference Management", "Brand Activation", "Corporate Videography", "Anchoring", "Photo Booth", "Live Streaming"],
    vendors: [
      { id: 201, name: "Vikram Nair Photography", role: "Corporate Photographer", city: "Delhi", rating: 4.8, reviews: 167, startingPrice: 30000, image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80", tags: ["Conference", "Headshots", "Brand Events"], about: "Specialist in corporate photography — conferences, headshots, product launches, and award ceremonies." },
      { id: 202, name: "TechStage Productions", role: "Stage & AV Setup", city: "Bangalore", rating: 4.7, reviews: 89, startingPrice: 120000, image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80", tags: ["LED Wall", "Sound System", "Lighting"], about: "End-to-end stage fabrication and AV solutions for corporate events of any scale." },
      { id: 203, name: "SoundPro Event AV", role: "Audio-Visual Specialist", city: "Mumbai", rating: 4.9, reviews: 203, startingPrice: 45000, image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80", tags: ["PA Systems", "LED Display", "Live Streaming"], about: "Premium AV rental and management for conferences, summits, and product launches." },
      { id: 204, name: "Executive Films", role: "Corporate Videographer", city: "Chennai", rating: 4.7, reviews: 134, startingPrice: 40000, image: "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=600&q=80", tags: ["Brand Film", "Testimonial Video", "Highlight Reel"], about: "Corporate video production from event highlights and testimonials to full brand films." },
      { id: 205, name: "Rahul Sharma — MC & Anchor", role: "Corporate Anchor", city: "Mumbai", rating: 4.8, reviews: 276, startingPrice: 20000, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", tags: ["Bilingual", "Awards Host", "Keynote MC"], about: "Bilingual anchor (Hindi/English) with 12+ years hosting corporate events across India." },
      { id: 206, name: "BrandActivate Agency", role: "Brand Activation & Booth", city: "Hyderabad", rating: 4.6, reviews: 72, startingPrice: 60000, image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=600&q=80", tags: ["Photo Booth", "Brand Experience", "Activation"], about: "Creative brand activation experiences — from interactive photo booths to immersive installations." },
    ],
    packages: [
      { name: "Starter Corporate", price: 45000, duration: "Half Day", includes: ["1 Corporate Photographer (4hrs)", "150 edited images", "Basic PA system", "Event anchor (2hrs)", "Digital delivery 48hrs"] },
      { name: "Professional Corporate", price: 120000, duration: "Full Day", includes: ["2 Photographers + 1 Videographer", "300 edited images", "Highlight reel (3 min)", "Full AV setup", "Professional anchor (full day)", "Live streaming setup"], popular: true },
      { name: "Premium Corporate", price: 250000, duration: "2 Days", includes: ["Complete photography & videography team", "Stage fabrication & branding", "Full AV system + LED wall", "Brand activation booth", "Professional anchor (both days)", "Same-day highlight video", "Live streaming"], },
    ],
    faqs: [
      { q: "Do you handle multi-city corporate events?", a: "Yes! We have vendor networks in 25+ Indian cities and can coordinate simultaneous multi-city events." },
      { q: "Can we get branded deliverables?", a: "Absolutely. All photos and videos can include your company logo overlay and branded packaging." },
      { q: "What is the typical turnaround for corporate photos?", a: "Edited photos are delivered within 24-48 hours. Video highlights within 72 hours." },
    ],
  },

  fashion: {
    slug: "fashion",
    title: "Fashion & Runway Events",
    subtitle: "Elevate your fashion event with runway-ready photography and flawless production.",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80",
    accentColor: "#9333ea",
    description: "Fashion shows, lookbook shoots, e-commerce photography, and editorial campaigns — we connect you with the most creative fashion professionals in the industry.",
    services: ["Fashion Photography", "Runway Setup", "Model Booking", "Styling", "Lighting Design", "E-commerce Shoots", "Lookbook", "Backstage Coverage"],
    vendors: [
      { id: 301, name: "Sneha Reddy Fashion", role: "Fashion Photographer", city: "Mumbai", rating: 4.9, reviews: 189, startingPrice: 40000, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80", tags: ["Editorial", "Runway", "Campaign"], about: "Vogue-featured fashion photographer specialising in editorial, runway, and campaign photography." },
      { id: 302, name: "Ramp Masters India", role: "Runway Setup & Design", city: "Delhi", rating: 4.7, reviews: 98, startingPrice: 85000, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80", tags: ["Runway Design", "Lighting", "Stage"], about: "Professional runway construction, lighting design, and backstage management for fashion shows." },
      { id: 303, name: "Style Studio Collective", role: "Fashion Stylist", city: "Mumbai", rating: 4.8, reviews: 156, startingPrice: 25000, image: "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=600&q=80", tags: ["Wardrobe", "Accessories", "Editorial Styling"], about: "Celebrity fashion stylists with expertise in editorial, commercial, and runway styling." },
      { id: 304, name: "Lumina Lighting Design", role: "Event Lighting Designer", city: "Bangalore", rating: 4.9, reviews: 112, startingPrice: 55000, image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80", tags: ["Runway Lighting", "Ambience", "LED Design"], about: "Specialised lighting design for fashion events — from intimate showrooms to grand runway shows." },
      { id: 305, name: "Model Management Hub", role: "Model Booking Agency", city: "Mumbai", rating: 4.7, reviews: 203, startingPrice: 15000, image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80", tags: ["Runway Models", "Catalog Models", "Talent Management"], about: "Connect with 200+ verified professional models for runway, catalog, and commercial shoots." },
      { id: 306, name: "PixelFashion Studio", role: "E-commerce Photographer", city: "Chennai", rating: 4.6, reviews: 287, startingPrice: 18000, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80", tags: ["Product Photography", "E-commerce", "White Background"], about: "High-volume e-commerce and catalog photography with quick turnaround for fashion brands." },
    ],
    packages: [
      { name: "Lookbook Shoot", price: 60000, duration: "1 Day", includes: ["Fashion photographer (6hrs)", "1 professional stylist", "2 models (4hrs each)", "150 edited images", "Digital delivery"] },
      { name: "Fashion Show Standard", price: 180000, duration: "1 Day", includes: ["2 Photographers + 1 Videographer", "Runway design & setup", "Lighting design", "6 runway models", "Backstage coverage", "Highlight reel (5 min)"], popular: true },
      { name: "Grand Fashion Show", price: 380000, duration: "2 Days", includes: ["Full photography & video team", "Custom runway & stage design", "Professional lighting design", "12+ models (runway + backstage)", "Stylist team (3 people)", "Live streaming", "Full show film + lookbook photos", "Same-day highlight reel"], },
    ],
    faqs: [
      { q: "How many models are included in packages?", a: "Packages include 2-12 models depending on the tier. Additional models can be added at per-model pricing." },
      { q: "Do you handle both print and digital deliverables?", a: "Yes. We deliver high-res images suitable for print media and web-optimised versions for digital campaigns." },
      { q: "Can you handle international fashion shows?", a: "We have experience managing fashion events across India and can travel internationally with advanced notice." },
    ],
  },

  party: {
    slug: "party",
    title: "Parties & Celebrations",
    subtitle: "Make every party an unforgettable experience with the best in the business.",
    heroImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1400&q=80",
    accentColor: "#f59e0b",
    description: "Birthday bashes, anniversary celebrations, house parties, farewell functions — we bring together DJs, decorators, caterers, photographers, and entertainers to make your party legendary.",
    services: ["DJ & Music", "Party Photography", "Balloon Decoration", "Birthday Cakes", "Catering", "Anchoring & Entertainment", "Photo Booth", "Return Gifts"],
    vendors: [
      { id: 401, name: "DJ Rohan Beats", role: "DJ & Music Producer", city: "Mumbai", rating: 4.9, reviews: 445, startingPrice: 18000, image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&q=80", tags: ["Bollywood", "EDM", "House"], about: "Mumbai's top DJ for birthdays, anniversaries, and corporate parties. 8 years of experience, 500+ events." },
      { id: 402, name: "Balloon Dreams Decor", role: "Party Decorator", city: "Delhi", rating: 4.8, reviews: 312, startingPrice: 12000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", tags: ["Balloon Art", "Theme Parties", "LED Decor"], about: "Transforming spaces into magical party environments. Specialists in theme-based and balloon decor." },
      { id: 403, name: "SnapParty Photos", role: "Party Photographer", city: "Bangalore", rating: 4.7, reviews: 198, startingPrice: 12000, image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80", tags: ["Candid", "Photo Booth", "Birthday"], about: "Fun and energetic party photographer capturing your best moments with a spontaneous, candid style." },
      { id: 404, name: "Zesty Bites Catering", role: "Party Caterer", city: "Pune", rating: 4.6, reviews: 167, startingPrice: 45000, image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80", tags: ["Finger Foods", "Multi-cuisine", "Buffet"], about: "Delicious party catering from finger foods and cocktail snacks to elaborate buffets for any occasion." },
      { id: 405, name: "Priya Events & Entertainment", role: "Event Anchor & Entertainer", city: "Hyderabad", rating: 4.8, reviews: 223, startingPrice: 15000, image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80", tags: ["Games", "Host", "Entertainment"], about: "High-energy event anchor and entertainer keeping guests engaged with games, activities, and fun hosting." },
      { id: 406, name: "Cake Artistry by Meera", role: "Custom Cake Designer", city: "Chennai", rating: 4.9, reviews: 567, startingPrice: 3500, image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80", tags: ["Custom Cakes", "Fondant", "Multi-tier"], about: "Handcrafted custom cakes for every occasion. From elegant fondant designs to fun-themed birthday cakes." },
    ],
    packages: [
      { name: "House Party", price: 25000, duration: "4 Hours", includes: ["DJ + sound system (4hrs)", "Basic balloon decor", "Party photographer (3hrs)", "100 edited photos", "Photo booth props"] },
      { name: "Birthday Blast", price: 65000, duration: "6 Hours", includes: ["DJ + lighting (6hrs)", "Theme decoration + balloon art", "Party photographer + photo booth", "Anchor & entertainment (games)", "Custom birthday cake", "Catering for 30 guests"], popular: true },
      { name: "Grand Celebration", price: 150000, duration: "Full Day", includes: ["DJ + full sound & light system", "Premium theme decor + LED", "2 Photographers + Videographer", "Professional anchor + entertainment", "Custom cake + dessert table", "Catering for 100 guests", "Return gift coordination", "Highlight video"], },
    ],
    faqs: [
      { q: "Can you handle theme-based parties?", a: "Yes! We specialise in themed parties — from Bollywood nights and Retro themes to Disney and Hollywood parties." },
      { q: "Is there a minimum guest count requirement?", a: "No minimum requirement. We cater to intimate gatherings of 10 people all the way to large parties of 500+." },
      { q: "Do you handle outdoor parties?", a: "Absolutely. We have all the equipment for outdoor venues including weather-proof setups and generator backup." },
    ],
  },

  drone: {
    slug: "drone",
    title: "Drone & Aerial Shoots",
    subtitle: "Stunning aerial footage and photography from licensed drone professionals.",
    heroImage: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1400&q=80",
    accentColor: "#0ea5e9",
    description: "Capture breathtaking aerial perspectives for weddings, real estate, events, and commercial projects. All our drone operators are DGCA-certified and fully insured.",
    services: ["Wedding Aerial Shots", "Event Aerial Coverage", "Real Estate Photography", "Commercial Drone Film", "360 Aerial VR", "FPV Racing Drone", "Night Drone Shots", "Time-lapse"],
    vendors: [
      { id: 501, name: "SkyShots Aerial", role: "Drone Videographer", city: "Mumbai", rating: 4.9, reviews: 145, startingPrice: 25000, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80", tags: ["DGCA Certified", "4K Drone", "Wedding Aerial"], about: "DGCA-certified drone pilots delivering cinematic 4K aerial footage. 300+ successful shoots." },
      { id: 502, name: "Aerial Vision India", role: "Aerial Photographer", city: "Delhi", rating: 4.8, reviews: 98, startingPrice: 20000, image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&q=80", tags: ["Real Estate", "Events", "Commercial"], about: "Specialised aerial photography for real estate, events, and commercial projects across India." },
      { id: 503, name: "FPV Drone Masters", role: "FPV Drone Specialist", city: "Bangalore", rating: 4.7, reviews: 67, startingPrice: 35000, image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80", tags: ["FPV", "Action Shots", "Sports Events"], about: "High-speed FPV drone specialists creating immersive, cinematic first-person view footage." },
      { id: 504, name: "Night Sky Drones", role: "Night Aerial Specialist", city: "Hyderabad", rating: 4.8, reviews: 89, startingPrice: 30000, image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", tags: ["Night Shots", "City Lights", "Wedding Aerial"], about: "Specialised low-light and night drone photography. Stunning cityscapes and wedding aerial shots at night." },
      { id: 505, name: "360 Aerial Studio", role: "360 Aerial VR Specialist", city: "Chennai", rating: 4.6, reviews: 43, startingPrice: 40000, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", tags: ["360 VR", "Virtual Tour", "Real Estate"], about: "Interactive 360° aerial virtual tours for real estate, resorts, and event venues." },
      { id: 506, name: "TimeLapse Drones", role: "Aerial Timelapse Specialist", city: "Jaipur", rating: 4.7, reviews: 56, startingPrice: 28000, image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80", tags: ["Timelapse", "Hyperlapse", "Construction"], about: "Aerial timelapse and hyperlapse photography for construction monitoring, events, and commercial projects." },
    ],
    packages: [
      { name: "Basic Aerial", price: 18000, duration: "2 Hours", includes: ["1 DGCA-certified pilot", "DJI Mavic Pro (4K)", "30 edited aerial photos", "3-min aerial video", "Location permit guidance"] },
      { name: "Premium Aerial", price: 45000, duration: "5 Hours", includes: ["2 drone pilots", "DJI Inspire 2 (6K)", "100 edited aerial photos", "10-min cinematic aerial film", "Ground photographer included", "DGCA permissions handled"], popular: true },
      { name: "Cinema Aerial Package", price: 95000, duration: "Full Day", includes: ["3 drone pilots + 2 ground operators", "Multiple drone types (aerial + FPV)", "Full-day shoot (sunrise to sunset)", "200+ edited aerial images", "Full cinematic aerial film (20+ min)", "All DGCA permits handled", "Same-day preview clips"], },
    ],
    faqs: [
      { q: "Are all your drone operators DGCA certified?", a: "Yes, every drone operator on our platform holds a valid DGCA remote pilot certificate and all required permissions." },
      { q: "What happens if the weather is bad?", a: "We monitor weather closely. If flying conditions are unsafe, we reschedule at no extra charge." },
      { q: "Do you handle DGCA permissions for events?", a: "Yes, we take care of all necessary DGCA approvals and airspace permissions as part of our service." },
    ],
  },

  reel: {
    slug: "reel",
    title: "Reels & Short Films",
    subtitle: "Viral-worthy content created by India's best reel creators and short film directors.",
    heroImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1400&q=80",
    accentColor: "#ec4899",
    description: "From Instagram reels and YouTube Shorts to brand films and creative short films — connect with content creators, videographers, and editors who know how to make content that gets noticed.",
    services: ["Instagram Reels", "YouTube Shorts", "Brand Reels", "Short Films", "Product Reel", "Wedding Reels", "Music Videos", "Video Editing"],
    vendors: [
      { id: 601, name: "Reel Kings Studio", role: "Reel Creator & Director", city: "Mumbai", rating: 4.9, reviews: 678, startingPrice: 8000, image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80", tags: ["Instagram Reels", "Viral Content", "Brand Reels"], about: "Creators behind 50+ viral Instagram reels. Specialise in brand storytelling and engaging short-form content." },
      { id: 602, name: "Short Story Films", role: "Short Film Director", city: "Bangalore", rating: 4.8, reviews: 134, startingPrice: 35000, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80", tags: ["Short Film", "Narrative", "Festival Circuit"], about: "Award-winning short film director with films featured at MAMI and IFFI. Creative storytelling at its finest." },
      { id: 603, name: "EditMagic Post", role: "Video Editor", city: "Delhi", rating: 4.7, reviews: 445, startingPrice: 5000, image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80", tags: ["Reels Editing", "Color Grading", "Motion Graphics"], about: "Professional video editing with trendy transitions, color grading, and music sync for maximum engagement." },
      { id: 604, name: "Zara Creative Content", role: "Content Creator & Influencer", city: "Mumbai", rating: 4.8, reviews: 892, startingPrice: 12000, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", tags: ["UGC Content", "Lifestyle Reels", "Brand Collabs"], about: "500K+ Instagram following. Creates authentic UGC content and brand reels that drive real engagement." },
      { id: 605, name: "ProductReel Pro", role: "Product Videographer", city: "Chennai", rating: 4.6, reviews: 267, startingPrice: 15000, image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80", tags: ["Product Videos", "E-commerce Reels", "Demo Videos"], about: "Specialist in product demonstration videos and e-commerce reels that convert browsers into buyers." },
      { id: 606, name: "Music Reel Studios", role: "Music Video Director", city: "Hyderabad", rating: 4.9, reviews: 189, startingPrice: 45000, image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80", tags: ["Music Videos", "Lyric Videos", "Concert Coverage"], about: "Director of 100+ music videos across Bollywood, regional, and indie music. From concept to final cut." },
    ],
    packages: [
      { name: "Reel Starter", price: 8000, duration: "3 Hours", includes: ["1 videographer (3hrs)", "1 edited reel (60 sec)", "Basic color grade", "Trending music sync", "1 revision"] },
      { name: "Reel Pro", price: 22000, duration: "Full Day", includes: ["2 videographers + director", "3 edited reels (30-60 sec each)", "Pro color grading + transitions", "Custom music / licensed track", "1 long-form cut (3 min)", "3 revisions"], popular: true },
      { name: "Reel Campaign", price: 65000, duration: "2 Days", includes: ["Full production crew (3-4 people)", "10 edited reels (mix of durations)", "Script + concept development", "Professional models / talent", "Studio / location management", "Full post-production suite", "Unlimited revisions for 7 days"], },
    ],
    faqs: [
      { q: "How long does reel editing take?", a: "Standard reels are delivered within 24-48 hours. Complex reels with motion graphics within 3-5 days." },
      { q: "Can you create reels in specific trending styles?", a: "Yes! We stay on top of every trend — from POV transitions to aesthetic storytelling and viral audio trends." },
      { q: "Do you provide licensed music?", a: "Yes, we have access to royalty-free and licensed music libraries. We can also sync reels to your preferred audio." },
    ],
  },
};

export const ALL_CATEGORIES = Object.values(CATEGORY_DATA);
