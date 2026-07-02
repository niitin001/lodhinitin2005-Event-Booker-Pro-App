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
  Search, MapPin, Camera, Star, ArrowRight,
  CheckCircle, Navigation, Shield, Clock, Zap, Award, TrendingUp, Wand2,
} from "lucide-react";
import { useGetTrendingPhotographers, useListPhotographers } from "@workspace/api-client-react";
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



const TRENDING_PACKAGES = [
  { name: "Wedding Complete", price: "₹85,000", originalPrice: "₹1,10,000", desc: "Photographer + Cinematographer + Drone + Same-day highlight reel", badge: "Best Value", color: "from-rose-600 to-pink-700" },
  { name: "Corporate Premium", price: "₹45,000", originalPrice: "₹60,000", desc: "Event photography + AV setup + Professional anchor + Live streaming", badge: "Most Booked", color: "from-blue-600 to-indigo-700" },
  { name: "Reel Creator Pro", price: "₹12,000", originalPrice: "₹18,000", desc: "2 reels + editing + captions + 24-hour delivery", badge: "Trending", color: "from-violet-600 to-purple-700" },
  { name: "Party Blast", price: "₹20,000", originalPrice: "₹28,000", desc: "DJ + Balloon decor + Birthday cake + Photographer", badge: "Popular", color: "from-amber-500 to-orange-600" },
];

const VENDOR_TYPES = [
  {
    name: "Photographer",
    desc: "Wedding · Pre-Wedding · Candid · Drone · Reel",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    href: "/explore?category=photographer",
    available: true,
  },
  {
    name: "Makeup Artist",
    desc: "Bridal · HD · Airbrush · Engagement · Party",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    href: "/explore?category=makeup",
    available: true,
  },
  {
    name: "DJ",
    desc: "Weddings · Parties · Corporate Events",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    href: null,
    available: false,
  },
  {
    name: "Decoration",
    desc: "Floral · Balloon · Stage · Mandap · Lighting",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
    href: null,
    available: false,
  },
  {
    name: "Catering",
    desc: "Veg · Non-Veg · Multi-Cuisine · Live Counters",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80",
    href: null,
    available: false,
  },
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
  const cityRef = useRef<HTMLDivElement>(null);
  const { data: trending } = useGetTrendingPhotographers();
  const { data: allPhotographersData } = useListPhotographers({});
  const featured = allPhotographersData?.photographers?.slice(0, 6) ?? [];

  const filteredCities = CITIES.filter(c => c.toLowerCase().startsWith(cityInput.toLowerCase()) && cityInput.length > 0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
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
        <section className="relative min-h-[100svh] sm:h-[90vh] sm:min-h-[600px] flex items-center justify-center overflow-hidden py-20 sm:py-0">
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

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur text-xs sm:text-sm px-3 sm:px-4 py-1.5 tracking-wide">
                2,400+ Verified Vendors across 80+ Indian Cities
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-5 leading-tight"
            >
              Cinematic Memories,<br />
              <span className="italic text-amber-400">Booked Instantly.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0"
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

        {/* ── VENDOR TYPES ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <Badge variant="outline" className="mb-3 text-xs font-semibold tracking-wider uppercase">Browse</Badge>
                <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">What are you looking for?</h2>
                <p className="text-muted-foreground mt-2">Select a vendor type to see available professionals near you.</p>
              </div>
              <Button variant="ghost" onClick={() => setLocation("/explore")} className="hidden sm:flex">
                All Vendors <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {VENDOR_TYPES.map((vt, i) => (
                <motion.div
                  key={vt.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  {vt.available ? (
                    <Link href={vt.href!} className="group block relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={vt.image}
                        alt={vt.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-3 right-3 text-white">
                        <h3 className="font-bold text-base leading-tight">{vt.name}</h3>
                        <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">{vt.desc}</p>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Explore</span>
                      </div>
                    </Link>
                  ) : (
                    <div className="group block relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm opacity-70 cursor-not-allowed">
                      <img
                        src={vt.image}
                        alt={vt.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Coming Soon</span>
                      </div>
                      <div className="absolute bottom-4 left-3 right-3 text-white">
                        <h3 className="font-bold text-base leading-tight">{vt.name}</h3>
                        <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">{vt.desc}</p>
                      </div>
                    </div>
                  )}
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

        {/* ── FEATURED PHOTOGRAPHERS (real data from API) ── */}
        {featured.length > 0 && (
          <section className="py-20 bg-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">Featured Photographers</h2>
                    <p className="text-muted-foreground text-sm">Verified professionals, ready to book</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLocation("/explore")}>
                  View all 17 <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((photographer, i) => {
                  const waNumber = (photographer as any).whatsappNumber as string | null;
                  const igHandle = (photographer as any).instagramHandle as string | null;
                  const badges = ["Top Pick", "Trending", "Verified", "Top Pick", "Most Booked", "Verified"];
                  return (
                    <motion.div
                      key={photographer.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                        <div
                          className="aspect-video overflow-hidden relative"
                          onClick={() => setLocation(`/photographers/${photographer.id}`)}
                        >
                          <img
                            src={photographer.coverImageUrl || "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80"}
                            alt={photographer.displayName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-black/70 text-white border-0 text-xs backdrop-blur">{badges[i] ?? "Verified"}</Badge>
                          </div>
                          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {photographer.rating.toFixed(1)}
                          </div>
                          {igHandle && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                              <span className="text-white text-[11px] font-medium">@{igHandle.replace(/^@/, "")}</span>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-4 flex flex-col flex-1">
                          <div
                            className="cursor-pointer mb-3"
                            onClick={() => setLocation(`/photographers/${photographer.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-base leading-tight">{photographer.displayName}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" /> {photographer.city}
                                </p>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <p className="text-xs text-muted-foreground">Starting</p>
                                <p className="font-bold text-sm">₹{photographer.startingPrice.toLocaleString("en-IN")}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {photographer.specializations?.slice(0, 3).map(spec => (
                                <span key={spec} className="text-[10px] uppercase tracking-wider font-semibold bg-muted px-2 py-0.5 rounded">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-auto pt-3 border-t flex gap-2">
                            {waNumber && (
                              <button
                                onClick={() => {
                                  const msg = encodeURIComponent("Hi, I found your profile on EventShooter and I'm interested in booking you. Could you share more details?");
                                  window.open(`https://wa.me/91${waNumber}?text=${msg}`, "_blank");
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-md border border-green-600 text-green-700 dark:text-green-400 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current flex-shrink-0">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                WhatsApp
                              </button>
                            )}
                            {igHandle && (
                              <button
                                onClick={() => window.open(`https://instagram.com/${igHandle.replace(/^@/, "")}`, "_blank")}
                                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                                style={{ color: "#E1306C" }}
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current flex-shrink-0">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                Instagram
                              </button>
                            )}
                            {!waNumber && !igHandle && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs h-8"
                                onClick={() => setLocation(`/photographers/${photographer.id}`)}
                              >
                                View Profile <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

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
