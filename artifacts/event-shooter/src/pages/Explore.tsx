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
  CheckCircle, X, ArrowRight,
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

export default function Explore() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const [city, setCity] = useState(searchParams.get("city") || "all");
  const [eventType, setEventType] = useState(searchParams.get("eventType") || "all");
  const [priceIdx, setPriceIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleReset = () => { setCity("all"); setEventType("all"); setPriceIdx(0); setSearchQuery(""); };

  const { data, isLoading } = useListPhotographers(undefined, {
    query: { queryKey: ["photographers", "list"] as any }
  });

  const all = data?.photographers || [];
  const maxPrice = PRICE_RANGES[priceIdx].max;

  const photographers = all.filter(p => {
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
                  {photographers.map(photographer => (
                    <Card
                      key={photographer.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                      onClick={() => setLocation(`/photographers/${photographer.id}`)}
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
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
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-base line-clamp-1">{photographer.displayName}</h3>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />{photographer.city}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {photographer.specializations?.slice(0, 2).map(spec => (
                            <span key={spec} className="text-[10px] uppercase tracking-wider font-semibold bg-muted px-2 py-0.5 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Starting at</p>
                            <p className="font-bold text-sm">₹{photographer.startingPrice.toLocaleString("en-IN")}</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs h-8">
                            View <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
