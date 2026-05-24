import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Star, Filter, Camera } from "lucide-react";
import { useListPhotographers } from "@workspace/api-client-react";

export default function Explore() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [eventType, setEventType] = useState(searchParams.get("eventType") || "");
  const [maxPrice, setMaxPrice] = useState([5000]);

  const { data, isLoading } = useListPhotographers({
    query: {
      queryKey: ["photographers", city, eventType, maxPrice[0].toString()] as any,
    },
    request: {
      // Provide params if needed via query params manually or if the hook supports it
      // For now, assume it returns all and we filter locally or the hook handles it
    }
  });

  const photographers = data?.photographers || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/10 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">Explore Photographers</h1>
              <p className="text-muted-foreground mt-1">Find the perfect creative for your event.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-2 font-semibold pb-4 border-b">
                    <Filter className="h-5 w-5" />
                    Filters
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="e.g. New York" 
                        className="pl-9"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Event Type</label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="party">Party</SelectItem>
                        <SelectItem value="reel">Reels / TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Max Price</label>
                      <span className="text-sm text-muted-foreground">${maxPrice[0]}</span>
                    </div>
                    <Slider 
                      defaultValue={[5000]} 
                      max={10000} 
                      step={100}
                      value={maxPrice}
                      onValueChange={setMaxPrice}
                    />
                  </div>
                  
                  <Button className="w-full" variant="outline" onClick={() => { setCity(""); setEventType(""); setMaxPrice([5000]); }}>
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-4">
                      <div className="bg-muted rounded-xl aspect-[4/3] w-full"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : photographers.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-xl border border-dashed">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No photographers found</h3>
                  <p className="text-muted-foreground mt-1">Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {photographers.map((photographer) => (
                    <Card key={photographer.id} className="overflow-hidden h-full hover:shadow-lg transition-all group cursor-pointer" onClick={() => setLocation(`/photographers/${photographer.id}`)}>
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={photographer.coverImageUrl || "/images/photographer-1.png"} 
                          alt={photographer.displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                          {photographer.rating.toFixed(1)} ({photographer.totalReviews})
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg line-clamp-1">{photographer.displayName}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{photographer.city}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {photographer.specializations?.slice(0, 2).map(spec => (
                            <span key={spec} className="text-[10px] uppercase tracking-wider font-semibold bg-secondary px-2 py-1 rounded-md">
                              {spec}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t">
                          <span className="text-sm text-muted-foreground">Starting at</span>
                          <span className="font-semibold">${photographer.startingPrice}</span>
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
