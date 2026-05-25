import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Camera, Star, ArrowRight, Video,
  Aperture, Plane, Music, Wand2, CheckCircle,
} from "lucide-react";
import { useGetTrendingPhotographers } from "@workspace/api-client-react";
import { BookingDialog } from "@/components/BookingDialog";

const CATEGORIES = [
  {
    name: "Wedding",
    slug: "wedding",
    icon: Aperture,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    desc: "Photographers, decorators, makeup",
  },
  {
    name: "Corporate",
    slug: "corporate",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    desc: "AV setup, anchors, branding",
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: Star,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    desc: "Runway, stylists, lighting",
  },
  {
    name: "Party",
    slug: "party",
    icon: Music,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
    desc: "DJs, decorators, catering",
  },
  {
    name: "Drone",
    slug: "drone",
    icon: Plane,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80",
    desc: "DGCA certified, 4K aerial",
  },
  {
    name: "Reels",
    slug: "reel",
    icon: Video,
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80",
    desc: "Viral content, short films",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Tell us your event", desc: "Choose your event type, date, city, and budget. Takes less than 2 minutes." },
  { step: "02", title: "Get matched instantly", desc: "We match you with verified vendors who are available on your date and fit your budget." },
  { step: "03", title: "Review & confirm", desc: "Compare vendor profiles, portfolios, and reviews. Confirm with a secure advance payment." },
  { step: "04", title: "Relax and enjoy", desc: "Your vendor handles everything. After the event, receive all deliverables on time." },
];

const TESTIMONIALS = [
  { name: "Priya & Rohan Sharma", event: "Wedding, Mumbai", rating: 5, text: "EventShooter made our wedding planning stress-free. We found our photographer, decorator, and caterer all in one place. Absolutely recommend!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { name: "Technovate Solutions", event: "Corporate Summit, Bangalore", rating: 5, text: "Excellent platform. Booked our entire event team — photographer, AV setup, and anchor — within 24 hours. Professional and seamless.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { name: "Anjali Kapoor", event: "Birthday Party, Delhi", rating: 5, text: "Found an amazing DJ and balloon decorator for my daughter's birthday. The booking process was so easy and the vendors were fantastic!", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
];

const AI_FEATURES = [
  { icon: "cost", title: "Cost Estimator", desc: "Get instant AI-powered budget estimates based on your event size and requirements." },
  { icon: "match", title: "Smart Matching", desc: "AI recommends the best vendors based on your style preferences and past bookings." },
  { icon: "caption", title: "Caption Generator", desc: "Auto-generate perfect Instagram captions for your event photos and reels." },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const { data: trending } = useGetTrendingPhotographers();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const city = formData.get("city") as string;
    const type = formData.get("type") as string;
    if (type && ["wedding", "corporate", "fashion", "party", "drone", "reel"].includes(type.toLowerCase())) {
      setLocation(`/category/${type.toLowerCase()}`);
    } else {
      setLocation(`/explore?city=${city}&eventType=${type}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80"
              alt="Cinematic wedding photography"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur text-sm px-4 py-1.5">
                2,400+ Verified Vendors across India
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
            >
              Cinematic Memories,<br />Booked Instantly.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto"
            >
              Hire elite photographers, videographers, decorators, DJs, and more for your next big moment.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto bg-background/10 p-2 rounded-xl backdrop-blur-md border border-white/20"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  name="city"
                  placeholder="City (e.g. Mumbai, Delhi)"
                  className="pl-10 bg-background/90 text-foreground border-0 h-12 text-base rounded-lg"
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  name="type"
                  placeholder="Event type (Wedding, Party, Corporate...)"
                  className="pl-10 bg-background/90 text-foreground border-0 h-12 text-base rounded-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 text-base">
                Search
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-300"
            >
              {["15,000+ Events", "4.8 Avg Rating", "80+ Cities"].map(stat => (
                <span key={stat} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" /> {stat}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="py-24 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Book by Category</h2>
                <p className="text-muted-foreground mt-2 text-lg">Each category has unique specialists, packages, and prices.</p>
              </div>
              <Button variant="ghost" onClick={() => setLocation("/explore")} className="hidden sm:flex">
                All Vendors <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((category, i) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/category/${category.slug}`} className="group block relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <category.icon className="h-5 w-5 mb-1.5 opacity-90" />
                      <h3 className="font-bold text-base leading-tight">{category.name}</h3>
                      <p className="text-[11px] text-gray-300 mt-0.5">{category.desc}</p>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge className="bg-white text-black text-xs">View</Badge>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRENDING ── */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Trending This Week</h2>
                <p className="text-muted-foreground mt-2 text-lg">Most booked professionals across all categories.</p>
              </div>
              <Button variant="ghost" onClick={() => setLocation("/explore")} className="hidden sm:flex">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {trending && trending.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        />
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          {photographer.rating.toFixed(1)}
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg line-clamp-1">{photographer.displayName}</h3>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{photographer.city}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {photographer.specializations?.slice(0, 2).map(spec => (
                            <span key={spec} className="text-[10px] uppercase tracking-wider font-semibold bg-secondary px-2 py-1 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                          <span className="text-sm text-muted-foreground">Starting at</span>
                          <span className="font-bold text-lg">₹{photographer.startingPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-xl mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" className="w-full mt-8 sm:hidden" onClick={() => setLocation("/explore")}>
              View all vendors
            </Button>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">Book the best event professionals in 4 simple steps.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <span className="font-serif text-2xl font-bold text-primary">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" onClick={() => setBookingOpen(true)}>
                Book Your Event Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── AI FEATURES ── */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute bottom-0 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl mix-blend-screen" />
          </div>

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <Badge className="mb-4 border-white/30 bg-white/10 text-white">AI-Powered</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4">Smarter bookings with AI</h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
                Our AI tools help you plan, estimate, and create — all in one place.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {AI_FEATURES.map((f) => (
                <Card key={f.title} className="bg-white/10 border-white/20 text-white">
                  <CardContent className="p-6">
                    <Wand2 className="h-8 w-8 mb-4 opacity-80" />
                    <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-primary-foreground/70 text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" variant="secondary" onClick={() => setLocation("/ai")}>
                Try AI Tools Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 bg-muted/10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">What Customers Say</h2>
              <p className="text-muted-foreground mt-3 text-lg">Real stories from real events.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-5 text-sm">"{t.text}"</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.event}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 bg-background border-t">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to plan your event?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Submit a free booking request and get matched with top vendors in your city within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setBookingOpen(true)}>
                Book Now — Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/explore")}>
                Browse Vendors
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
