import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, MapPin, Camera, Star, ArrowRight, Video,
  Aperture, Plane, Music, Wand2, CheckCircle, Navigation,
  TrendingUp, Heart, Shield, Clock, Zap, Award,
} from "lucide-react";
import { useGetTrendingPhotographers } from "@workspace/api-client-react";
import { BookingDialog } from "@/components/BookingDialog";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune",
  "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh", "Lucknow", "Goa",
  "Surat", "Indore", "Bhopal", "Nagpur", "Vadodara", "Coimbatore",
  "Kochi", "Agra", "Varanasi", "Amritsar", "Udaipur", "Jodhpur",
];

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "pre-wedding", label: "Pre-Wedding Shoot" },
  { value: "corporate", label: "Corporate Event" },
  { value: "fashion", label: "Fashion Shoot" },
  { value: "party", label: "Birthday / Party" },
  { value: "drone", label: "Drone Aerial" },
  { value: "reel", label: "Reel / Short Film" },
  { value: "engagement", label: "Engagement" },
  { value: "maternity", label: "Maternity Shoot" },
  { value: "product", label: "Product Photography" },
];

const CATEGORIES = [
  { name: "Wedding", slug: "wedding", icon: Aperture, image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", desc: "Photographers · Decorators · Mehendi" },
  { name: "Corporate", slug: "corporate", icon: Camera, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", desc: "AV Setup · Anchors · Branding" },
  { name: "Fashion", slug: "fashion", icon: Star, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", desc: "Runway · Stylists · Lighting" },
  { name: "Party", slug: "party", icon: Music, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80", desc: "DJs · Decorators · Catering" },
  { name: "Drone", slug: "drone", icon: Plane, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80", desc: "DGCA Certified · 4K Aerial" },
  { name: "Reels", slug: "reel", icon: Video, image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80", desc: "Viral Content · Short Films" },
];

const FEATURED_VENDOR_TYPES = [
  {
    type: "Top Photographers",
    icon: Camera,
    color: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
    iconColor: "text-rose-600",
    vendors: [
      { name: "Arjun Kapoor Studios", city: "Mumbai", price: "₹35,000", rating: 4.9, img: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=300&q=80", badge: "Top Pick", id: 1 },
      { name: "Sneha Iyer Visuals", city: "Bangalore", price: "₹28,000", rating: 4.8, img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=80", badge: "Trending", id: 2 },
      { name: "Vikram Nair Films", city: "Chennai", price: "₹22,000", rating: 4.7, img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&q=80", badge: "Verified", id: 3 },
    ],
    slug: "wedding",
  },
  {
    type: "Top DJs",
    icon: Music,
    color: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
    iconColor: "text-violet-600",
    vendors: [
      { name: "DJ Rahul Beats", city: "Delhi", price: "₹15,000", rating: 4.8, img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&q=80", badge: "Top Pick", id: 4 },
      { name: "DJ Priya Sounds", city: "Mumbai", price: "₹12,000", rating: 4.7, img: "https://images.unsplash.com/photo-1571266028243-3716f02d2d01?w=300&q=80", badge: "Trending", id: 5 },
      { name: "DJ Karan Mix", city: "Pune", price: "₹10,000", rating: 4.6, img: "https://images.unsplash.com/photo-1574879948818-4cc04a0a8e30?w=300&q=80", badge: "New", id: 6 },
    ],
    slug: "party",
  },
  {
    type: "Top Decorators",
    icon: Award,
    color: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600",
    vendors: [
      { name: "Royal Decor Co.", city: "Jaipur", price: "₹40,000", rating: 4.9, img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&q=80", badge: "Top Pick", id: 7 },
      { name: "Bloom Events", city: "Hyderabad", price: "₹25,000", rating: 4.8, img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300&q=80", badge: "Trending", id: 5 },
      { name: "Floral Dreams", city: "Bangalore", price: "₹18,000", rating: 4.6, img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&q=80", badge: "Verified", id: 6 },
    ],
    slug: "wedding",
  },
  {
    type: "Drone Operators",
    icon: Plane,
    color: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800",
    iconColor: "text-sky-600",
    vendors: [
      { name: "SkyShot Aerials", city: "Mumbai", price: "₹18,000", rating: 4.9, img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&q=80", badge: "DGCA Cert.", id: 5 },
      { name: "AeroView India", city: "Delhi", price: "₹15,000", rating: 4.8, img: "https://images.unsplash.com/photo-1527977966861-9b0ef23e6c5f?w=300&q=80", badge: "Top Pick", id: 6 },
      { name: "Cloud Nine Films", city: "Goa", price: "₹20,000", rating: 4.7, img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300&q=80", badge: "Trending", id: 4 },
    ],
    slug: "drone",
  },
];

const TRENDING_PACKAGES = [
  { name: "Wedding Complete", price: "₹85,000", originalPrice: "₹1,10,000", desc: "Photographer + Cinematographer + Drone + Same-day highlight reel", badge: "Best Value", color: "from-rose-600 to-pink-700" },
  { name: "Corporate Premium", price: "₹45,000", originalPrice: "₹60,000", desc: "Event photography + AV setup + Professional anchor + Live streaming", badge: "Most Booked", color: "from-blue-600 to-indigo-700" },
  { name: "Reel Creator Pro", price: "₹12,000", originalPrice: "₹18,000", desc: "2 reels + editing + captions + 24-hour delivery", badge: "Trending", color: "from-violet-600 to-purple-700" },
  { name: "Party Blast", price: "₹20,000", originalPrice: "₹28,000", desc: "DJ + Balloon decor + Birthday cake + Photographer", badge: "Popular", color: "from-amber-500 to-orange-600" },
];

const LIVE_ACTIVITY = [
  { msg: "Rohan from Mumbai just booked Arjun Kapoor for a Wedding", time: "2 min ago" },
  { msg: "Anjali from Delhi sent a booking request to DJ Rahul Beats", time: "5 min ago" },
  { msg: "Technovate Co. booked AV setup for Corporate Summit in Bangalore", time: "8 min ago" },
  { msg: "Priya from Chennai booked a Drone shoot for her pre-wedding", time: "12 min ago" },
  { msg: "Neha from Jaipur booked Royal Decor for a wedding", time: "15 min ago" },
];

const TESTIMONIALS = [
  { name: "Priya & Rohan Sharma", event: "Wedding, Mumbai", rating: 5, text: "EventShooter made our wedding planning completely stress-free. Found our photographer, decorator, and caterer all in one place. The booking was seamless and the vendors were incredibly professional!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { name: "Technovate Solutions", event: "Corporate Summit, Bangalore", rating: 5, text: "Booked our entire event team — photographer, AV setup, and anchor — within 24 hours. Every vendor showed up on time and delivered beyond expectations. Will use again for sure.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { name: "Anjali Kapoor", event: "Birthday Party, Delhi", rating: 5, text: "Found an amazing DJ and balloon decorator for my daughter's birthday. The booking process was so easy and the vendors were absolutely fantastic. My daughter loved every moment!", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
  { name: "Vikram Nair", event: "Pre-Wedding Shoot, Goa", rating: 5, text: "Got a drone operator + photographer combo for our pre-wedding in Goa. The aerial shots were cinematic. EventShooter matched us perfectly with vendors who understood our vision.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
  { name: "Meera Events", event: "Fashion Show, Chennai", rating: 5, text: "Organized a 200-person fashion show with vendors from EventShooter — runway photographer, lighting team, and reel creator. Everyone was punctual, professional, and talented.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Tell us your event", desc: "Choose event type, date, city, and budget. Takes under 2 minutes.", icon: "📋" },
  { step: "02", title: "Get matched instantly", desc: "We match you with verified vendors available on your date within your budget.", icon: "⚡" },
  { step: "03", title: "Review and confirm", desc: "Compare portfolios, reviews, and packages. Confirm with a secure advance payment.", icon: "✅" },
  { step: "04", title: "Relax and enjoy", desc: "Your vendor handles everything. Receive all deliverables on time, every time.", icon: "🎉" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [city, setCity] = useState("");
  const [eventType, setEventType] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [activityIdx, setActivityIdx] = useState(0);
  const cityRef = useRef<HTMLDivElement>(null);
  const { data: trending } = useGetTrendingPhotographers();

  const filteredCities = CITIES.filter(c => c.toLowerCase().startsWith(cityInput.toLowerCase()) && cityInput.length > 0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActivityIdx(i => (i + 1) % LIVE_ACTIVITY.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => {
        setCityInput("Mumbai");
        setCity("Mumbai");
      },
      () => {}
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = EVENT_TYPES.find(t => t.value === eventType);
    if (eventType && ["wedding", "corporate", "fashion", "party", "drone", "reel"].includes(eventType)) {
      setLocation(`/category/${eventType}`);
    } else {
      setLocation(`/explore?city=${city}&eventType=${eventType}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background with blur */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=90"
              alt="Cinematic wedding photography"
              className="w-full h-full object-cover object-center scale-105"
              style={{ filter: "blur(2px)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
          </div>

          {/* Live Activity Ticker */}
          <div className="absolute top-20 left-0 right-0 z-20 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activityIdx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs px-4 py-2 rounded-full flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                {LIVE_ACTIVITY[activityIdx].msg}
                <span className="text-white/50 ml-1">{LIVE_ACTIVITY[activityIdx].time}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-5 text-white border-white/30 bg-white/10 backdrop-blur text-sm px-4 py-1.5 tracking-wide">
                2,400+ Verified Vendors across 80+ Indian Cities
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-5 leading-tight"
            >
              Cinematic Memories,<br />
              <span className="italic text-amber-400">Booked Instantly.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
            >
              Hire elite photographers, videographers, DJs, decorators, and more — for your next big event.
            </motion.p>

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
            >
              {/* City Autocomplete */}
              <div className="relative flex-1" ref={cityRef}>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={e => { setCityInput(e.target.value); setCity(e.target.value); setShowCitySuggestions(true); }}
                  onFocus={() => setShowCitySuggestions(true)}
                  placeholder="City (Mumbai, Delhi...)"
                  className="w-full pl-9 pr-3 h-12 bg-background/95 text-foreground rounded-lg text-sm border-0 outline-none focus:ring-2 focus:ring-amber-400/50"
                />
                {showCitySuggestions && filteredCities.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-background rounded-lg shadow-xl border z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {filteredCities.map(c => (
                      <button
                        key={c}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2"
                        onClick={() => { setCityInput(c); setCity(c); setShowCitySuggestions(false); }}
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Type Dropdown */}
              <div className="flex-1">
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="h-12 bg-background/95 border-0 rounded-lg text-sm focus:ring-2 focus:ring-amber-400/50">
                    <SelectValue placeholder="Event type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accent Search Button */}
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 text-base font-semibold bg-amber-500 hover:bg-amber-400 text-black rounded-xl shrink-0 shadow-lg shadow-amber-500/30"
              >
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </motion.form>

            {/* Quick Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-4"
            >
              <button
                type="button"
                onClick={handleUseLocation}
                className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors"
              >
                <Navigation className="h-3.5 w-3.5" /> Use my location
              </button>
              <span className="text-gray-600 text-xs">|</span>
              {["Wedding", "Party", "Corporate", "Reel"].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setEventType(q.toLowerCase()); setLocation(`/category/${q.toLowerCase()}`); }}
                  className="text-sm text-gray-300 hover:text-amber-400 transition-colors underline underline-offset-2"
                >
                  {q}
                </button>
              ))}
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-300"
            >
              {[
                { icon: CheckCircle, label: "15,000+ Events" },
                { icon: Star, label: "4.8 Avg Rating" },
                { icon: Shield, label: "All Verified" },
                { icon: Clock, label: "2-hour Response" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-amber-400" /> {label}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── LIVE ACTIVITY BAR ── */}
        <div className="bg-amber-500 text-black py-2.5 px-4 text-sm font-medium overflow-hidden">
          <div className="container mx-auto max-w-7xl flex items-center gap-3">
            <span className="flex items-center gap-1.5 shrink-0 font-bold uppercase text-xs tracking-wider">
              <span className="w-2 h-2 bg-black rounded-full animate-pulse" /> Live
            </span>
            <div className="overflow-hidden flex-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activityIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {LIVE_ACTIVITY[activityIdx].msg}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <Badge variant="outline" className="mb-3 text-xs font-semibold tracking-wider uppercase">Browse</Badge>
                <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Book by Category</h2>
                <p className="text-muted-foreground mt-2">Specialists, packages, and prices for every event type.</p>
              </div>
              <Button variant="ghost" onClick={() => setLocation("/explore")} className="hidden sm:flex">
                All Vendors <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORIES.map((category, i) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/category/${category.slug}`} className="group block relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-3 right-3 text-white">
                      <h3 className="font-bold text-base leading-tight">{category.name}</h3>
                      <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">{category.desc}</p>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Explore</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRENDING PACKAGES ── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-xs font-semibold tracking-wider uppercase">Packages</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Trending Event Packages</h2>
              <p className="text-muted-foreground mt-2">Pre-bundled combinations — save up to 30% vs booking individually.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TRENDING_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="overflow-hidden h-full group cursor-pointer hover:shadow-xl transition-all duration-300" onClick={() => setBookingOpen(true)}>
                    <div className={`bg-gradient-to-br ${pkg.color} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                      <Badge className="bg-white/20 text-white border-0 text-xs mb-3">{pkg.badge}</Badge>
                      <h3 className="font-bold text-xl mb-1">{pkg.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{pkg.price}</span>
                        <span className="text-white/60 line-through text-sm">{pkg.originalPrice}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{pkg.desc}</p>
                      <Button size="sm" className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90">Book This Package</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED VENDORS BY TYPE ── */}
        {FEATURED_VENDOR_TYPES.map((section, si) => (
          <section key={section.type} className={`py-20 ${si % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${section.color} flex items-center justify-center border`}>
                    <section.icon className={`h-5 w-5 ${section.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">{section.type}</h2>
                    <p className="text-muted-foreground text-sm">Verified professionals, ready to book</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLocation(`/category/${section.slug}`)}>
                  View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {section.vendors.map((vendor, i) => (
                  <motion.div
                    key={vendor.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card
                      className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => setLocation(`/photographers/${vendor.id}`)}
                    >
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={vendor.img}
                          alt={vendor.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-black/70 text-white border-0 text-xs backdrop-blur">{vendor.badge}</Badge>
                        </div>
                        <button
                          className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                          onClick={e => { e.stopPropagation(); }}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-base leading-tight">{vendor.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {vendor.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-semibold">
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> {vendor.rating}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Starting</p>
                            <p className="font-bold text-sm">{vendor.price}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-3">View Profile</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── TRENDING THIS WEEK (from API) ── */}
        {trending && trending.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <Badge variant="outline" className="mb-3 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 w-fit">
                    <TrendingUp className="h-3.5 w-3.5" /> Trending
                  </Badge>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Most Booked This Week</h2>
                  <p className="text-muted-foreground mt-2">Top-rated professionals across all categories.</p>
                </div>
                <Button variant="ghost" onClick={() => setLocation("/explore")} className="hidden sm:flex">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {trending.slice(0, 4).map((photographer, i) => (
                  <motion.div
                    key={photographer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card
                      className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 group cursor-pointer"
                      onClick={() => setLocation(`/photographers/${photographer.id}`)}
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={photographer.coverImageUrl || "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80"}
                          alt={photographer.displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          {photographer.rating.toFixed(1)}
                        </div>
                        {photographer.isVerified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-blue-600 text-white border-0 text-xs flex items-center gap-1">
                              <Shield className="h-2.5 w-2.5" /> Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-base line-clamp-1">{photographer.displayName}</h3>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{photographer.city}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {photographer.specializations?.slice(0, 2).map(spec => (
                            <span key={spec} className="text-[10px] uppercase tracking-wider font-semibold bg-muted px-2 py-0.5 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-xs text-muted-foreground">Starting at</span>
                          <span className="font-bold">₹{photographer.startingPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-3 text-xs font-semibold tracking-wider uppercase">Simple</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Book the best event professionals in 4 simple steps.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center relative"
                >
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-muted-foreground/20 -translate-x-8 z-0" />
                  )}
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 text-2xl relative z-10">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-primary/60 tracking-widest mb-2">STEP {step.step}</div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" onClick={() => setBookingOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/30">
                Book Your Event Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ── */}
        <section className="py-12 bg-foreground text-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Zap, label: "Instant Booking", sub: "Confirm in minutes" },
                { icon: Shield, label: "All Vendors Verified", sub: "Background checked" },
                { icon: Award, label: "Best Price Promise", sub: "Price match guarantee" },
                { icon: Clock, label: "24/7 Support", sub: "Always here to help" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center">
                  <Icon className="h-7 w-7 mb-3 text-amber-400" />
                  <p className="font-bold">{label}</p>
                  <p className="text-background/60 text-sm mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI FEATURES ── */}
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute bottom-0 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl mix-blend-screen" />
          </div>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <Badge className="mb-4 border-white/30 bg-white/10 text-white">AI-Powered</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4">Smarter bookings with AI</h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto">Our AI tools help you plan, estimate, and create — all in one place.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {[
                { title: "Cost Estimator", desc: "Get instant AI-powered budget estimates based on your event size and requirements." },
                { title: "Smart Matching", desc: "AI recommends the best vendors based on your style preferences and location." },
                { title: "Caption Generator", desc: "Auto-generate perfect Instagram captions for your event photos and reels." },
              ].map((f) => (
                <Card key={f.title} className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors">
                  <CardContent className="p-6">
                    <Wand2 className="h-8 w-8 mb-4 text-amber-400" />
                    <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-primary-foreground/70 text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" className="bg-amber-400 hover:bg-amber-300 text-black font-semibold" onClick={() => setLocation("/ai")}>
                Try AI Tools Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS CAROUSEL ── */}
        <section className="py-20 bg-background overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-3 text-xs font-semibold tracking-wider uppercase">Reviews</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">What Our Customers Say</h2>
              <p className="text-muted-foreground mt-3">Real stories from 15,000+ events across India.</p>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="p-8 shadow-lg border-0 bg-muted/20">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: TESTIMONIALS[testimonialIdx].rating }).map((_, j) => (
                        <Star key={j} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-foreground/80 leading-relaxed text-lg mb-6">"{TESTIMONIALS[testimonialIdx].text}"</p>
                    <div className="flex items-center gap-4">
                      <img src={TESTIMONIALS[testimonialIdx].avatar} alt={TESTIMONIALS[testimonialIdx].name} className="h-12 w-12 rounded-full object-cover border-2 border-border" />
                      <div>
                        <p className="font-semibold">{TESTIMONIALS[testimonialIdx].name}</p>
                        <p className="text-sm text-muted-foreground">{TESTIMONIALS[testimonialIdx].event}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          className="py-24 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-3xl px-4 text-center relative z-10">
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Ready to plan your event?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Submit a free request and get matched with top vendors in your city within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base px-8 shadow-lg shadow-amber-500/30" onClick={() => setBookingOpen(true)}>
                Book Now — Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8" onClick={() => setLocation("/explore")}>
                Browse All Vendors
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/10">
              {[
                { value: "15,000+", label: "Events Completed" },
                { value: "2,400+", label: "Verified Vendors" },
                { value: "98%", label: "Satisfaction Rate" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl md:text-4xl font-serif font-bold text-amber-400">{value}</p>
                  <p className="text-gray-400 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
