import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Search, MapPin, Star, Filter, Camera, SlidersHorizontal,
  CheckCircle, X, ArrowRight, ExternalLink,
} from "lucide-react";
import { useListPhotographers } from "@workspace/api-client-react";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Goa"];
const EVENT_TYPES = ["Wedding", "Pre-Wedding", "Corporate", "Fashion", "Party", "Drone", "Reel", "Maternity", "Engagement"];
const PRICE_RANGES = [
  { label: "All", max: 999999 },
  { label: "Under ₹25,000", max: 25000 },
  { label: "₹25K – ₹50K", max: 50000 },
  { label: "₹50K – ₹1L", max: 100000 },
  { label: "Above ₹1L", max: 999999 },
];

function FilterPanel({
  city, setCity, eventType, setEventType, priceIdx, setPriceIdx, onReset,
}: {
  city: string; setCity: (v: string) => void;
  eventType: string; setEventType: (v: string) => void;
  priceIdx: number; setPriceIdx: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold">City</label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue placeholder="All cities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Event Type</label>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger><SelectValue placeholder="All events" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Price Range</label>
        <div className="space-y-2">
          {PRICE_RANGES.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPriceIdx(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${priceIdx === i ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onReset}>
        <X className="h-4 w-4 mr-2" /> Reset Filters
      </Button>
    </div>
  );
}

const VENDOR_CATEGORY_TABS = [
  { value: "all", label: "All Vendors" },
  { value: "photographer", label: "Photographer" },
  { value: "makeup", label: "Makeup Artist" },
];

export default function Explore() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const [city, setCity] = useState(searchParams.get("city") || "all");
  const [eventType, setEventType] = useState(searchParams.get("eventType") || "all");
  const [priceIdx, setPriceIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorCategory, setVendorCategory] = useState(searchParams.get("category") || "all");

  const handleReset = () => { setCity("all"); setEventType("all"); setPriceIdx(0); setSearchQuery(""); setVendorCategory("all"); };

  const { data, isLoading } = useListPhotographers(undefined, {
    query: { queryKey: ["photographers", "list"] as any }
  });

  const all = data?.photographers || [];
  const maxPrice = PRICE_RANGES[priceIdx].max;

  const isMakeupArtist = (p: typeof all[0]) =>
    p.specializations?.some(s => s.toLowerCase().includes("makeup")) ?? false;

  const photographers = all.filter(p => {
    if (vendorCategory === "photographer" && isMakeupArtist(p)) return false;
    if (vendorCategory === "makeup" && !isMakeupArtist(p)) return false;
    if (city && city !== "all" && p.city.toLowerCase() !== city.toLowerCase()) return false;
    if (eventType && eventType !== "all") {
      const hasSpec = p.specializations?.some(s => s.toLowerCase().includes(eventType.toLowerCase()));
      if (!hasSpec) return false;
    }
    if (p.startingPrice > maxPrice) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.displayName.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const activeFilterCount = [
    city !== "all" ? 1 : 0,
    eventType !== "all" ? 1 : 0,
    priceIdx !== 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/10 py-6 sm:py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">Explore Vendors</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `${photographers.length} verified professionals found`}
            </p>
          </div>

          {/* Vendor Category Tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {VENDOR_CATEGORY_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setVendorCategory(tab.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  vendorCategory === tab.value
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Mobile Filter Toggle */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-11"
                placeholder="Search by name or city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 px-3 lg:hidden relative flex-shrink-0">
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <SheetHeader className="mb-5">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                  </SheetTitle>
                </SheetHeader>
                <FilterPanel
                  city={city} setCity={setCity}
                  eventType={eventType} setEventType={setEventType}
                  priceIdx={priceIdx} setPriceIdx={setPriceIdx}
                  onReset={handleReset}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {city !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setCity("all")}>
                  <MapPin className="h-3 w-3" />{city} <X className="h-3 w-3" />
                </Badge>
              )}
              {eventType !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setEventType("all")}>
                  {eventType} <X className="h-3 w-3" />
                </Badge>
              )}
              {priceIdx !== 0 && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPriceIdx(0)}>
                  {PRICE_RANGES[priceIdx].label} <X className="h-3 w-3" />
                </Badge>
              )}
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground underline">
                Clear all
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 font-semibold pb-4 mb-2 border-b">
                    <Filter className="h-4 w-4" /> Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-auto text-xs">{activeFilterCount} active</Badge>
                    )}
                  </div>
                  <FilterPanel
                    city={city} setCity={setCity}
                    eventType={eventType} setEventType={setEventType}
                    priceIdx={priceIdx} setPriceIdx={setPriceIdx}
                    onReset={handleReset}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="animate-pulse flex flex-col gap-3">
                      <div className="bg-muted rounded-xl aspect-[4/3] w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : photographers.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="font-semibold text-lg mb-2">No vendors found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting or clearing your filters.</p>
                  <Button variant="outline" onClick={handleReset}>Clear Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {photographers.map(photographer => {
                    const waNumber = (photographer as any).whatsappNumber as string | null;
                    const igHandle = (photographer as any).instagramHandle as string | null;
                    return (
                    <Card
                      key={photographer.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
                    >
                      {/* Cover image — clickable */}
                      <div
                        className="aspect-[4/3] overflow-hidden relative cursor-pointer"
                        onClick={() => setLocation(`/photographers/${photographer.id}`)}
                      >
                        <img
                          src={photographer.coverImageUrl || "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80"}
                          alt={photographer.displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {photographer.rating.toFixed(1)}
                        </div>
                        {photographer.isVerified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-blue-600 text-white border-0 text-[10px] flex items-center gap-0.5 px-1.5">
                              <CheckCircle className="h-2.5 w-2.5" /> Verified
                            </Badge>
                          </div>
                        )}
                        {/* Instagram handle on cover */}
                        {igHandle && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                            <span className="text-white text-[11px] font-medium">@{igHandle.replace(/^@/, "")}</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 flex flex-col flex-1">
                        <div
                          className="cursor-pointer"
                          onClick={() => setLocation(`/photographers/${photographer.id}`)}
                        >
                          <h3 className="font-semibold text-base line-clamp-1">{photographer.displayName}</h3>
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />{photographer.city}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {photographer.specializations?.slice(0, 3).map(spec => (
                              <span key={spec} className="text-[10px] uppercase tracking-wider font-semibold bg-muted px-2 py-0.5 rounded">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-t space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Starting at</p>
                              <p className="font-bold text-sm">₹{photographer.startingPrice.toLocaleString("en-IN")}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={() => setLocation(`/photographers/${photographer.id}`)}
                            >
                              View <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>

                          {/* Quick contact row */}
                          {(waNumber || igHandle) && (
                            <div className="flex gap-2">
                              {waNumber && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
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
                                  onClick={e => {
                                    e.stopPropagation();
                                    window.open(`https://instagram.com/${igHandle.replace(/^@/, "")}`, "_blank");
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                                  style={{ color: "#E1306C" }}
                                >
                                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current flex-shrink-0">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                  Instagram
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );})}

                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
