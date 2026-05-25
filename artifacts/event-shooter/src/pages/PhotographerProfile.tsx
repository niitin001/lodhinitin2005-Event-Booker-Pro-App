import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Camera, CheckCircle2, MessageSquare, Heart, Calendar, Share2, ArrowLeft } from "lucide-react";
import {
  useGetPhotographer,
  getGetPhotographerQueryKey,
  useGetPortfolio,
  getGetPortfolioQueryKey,
  useGetPhotographerPackages,
  getGetPhotographerPackagesQueryKey,
  useGetPhotographerReviews,
  getGetPhotographerReviewsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { BookingDialog } from "@/components/BookingDialog";
import { toast } from "sonner";

export default function PhotographerProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const id = Number(params.id);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: photographer, isLoading } = useGetPhotographer(id, {
    query: { enabled: !!id, queryKey: getGetPhotographerQueryKey(id) }
  });

  const { data: portfolio } = useGetPortfolio(id, {
    query: { enabled: !!id, queryKey: getGetPortfolioQueryKey(id) }
  });

  const { data: packages } = useGetPhotographerPackages(id, {
    query: { enabled: !!id, queryKey: getGetPhotographerPackagesQueryKey(id) }
  });

  const { data: reviews } = useGetPhotographerReviews(id, {
    query: { enabled: !!id, queryKey: getGetPhotographerReviewsQueryKey(id) }
  });

  const handleBookNow = () => {
    if (user && user.role === "customer") {
      setLocation(`/book/${id}`);
    } else {
      setBookingOpen(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: photographer?.displayName || "Photographer", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h2 className="text-2xl font-bold mb-2">Photographer not found</h2>
            <p className="text-muted-foreground mb-6">This profile may have been removed or the link is incorrect.</p>
            <Button onClick={() => setLocation("/explore")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Browse Photographers
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Cover */}
      <div className="h-56 md:h-80 relative w-full bg-muted">
        {photographer.coverImageUrl ? (
          <img src={photographer.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Back button */}
        <button
          onClick={() => setLocation("/explore")}
          className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">
            {/* Identity */}
            <div className="flex items-end gap-5 mb-6">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl border-4 border-background overflow-hidden bg-muted shrink-0 shadow-xl">
                {photographer.avatarUrl ? (
                  <img src={photographer.avatarUrl} alt={photographer.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <Camera className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="pb-2 text-white">
                <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight drop-shadow-md">{photographer.displayName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-white/90">
                  <span className="flex items-center text-sm"><MapPin className="h-3.5 w-3.5 mr-1" />{photographer.city}</span>
                  <span className="flex items-center text-sm">
                    <Star className="h-3.5 w-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                    {photographer.rating.toFixed(1)} <span className="text-white/60 ml-1">({photographer.totalReviews} reviews)</span>
                  </span>
                  {photographer.isVerified && (
                    <span className="flex items-center text-sm text-blue-300"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verified Pro</span>
                  )}
                  {photographer.yearsOfExperience && (
                    <span className="text-sm text-white/80">{photographer.yearsOfExperience}+ yrs experience</span>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {photographer.bio || "This photographer has not added a bio yet."}
                </p>
                {photographer.specializations && photographer.specializations.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {photographer.specializations.map(spec => (
                      <Badge key={spec} variant="secondary" className="px-3 py-1">{spec}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="portfolio">
              <TabsList className="w-full mb-6 bg-muted/30">
                <TabsTrigger value="portfolio" className="flex-1">Portfolio {portfolio?.length ? `(${portfolio.length})` : ""}</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews {reviews?.length ? `(${reviews.length})` : ""}</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio">
                {portfolio && portfolio.length > 0 ? (
                  <div className="columns-2 md:columns-3 gap-3 space-y-3">
                    {portfolio.map((item) => (
                      <div key={item.id} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in shadow-sm">
                        <img
                          src={item.mediaUrl}
                          alt={item.title || "Portfolio item"}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white">
                          {item.title && <span className="text-sm font-medium">{item.title}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
                    <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground font-medium">No portfolio items yet</p>
                    <p className="text-sm text-muted-foreground mt-1">This photographer is building their portfolio.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                              {(review.customer?.name || "C")[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="font-medium">{review.customer?.name || "Customer"}</p>
                                <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                              </div>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.comment && <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
                    <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground font-medium">No reviews yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Be the first to book and leave a review!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:w-96 shrink-0">
            <div className="sticky top-24 space-y-5">
              {/* Action buttons */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm text-muted-foreground">Starting at</p>
                      <p className="text-2xl font-bold">₹{photographer.startingPrice?.toLocaleString("en-IN") || "—"}</p>
                    </div>
                    {photographer.isAvailable !== false && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">Available</Badge>
                    )}
                  </div>
                  <Button className="w-full h-11 text-base" onClick={handleBookNow}>
                    <Calendar className="h-4 w-4 mr-2" /> Book Now
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setBookingOpen(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Send Message
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0 hover:text-red-500" onClick={() => toast.success("Added to wishlist!")}>
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Packages */}
              {packages && packages.length > 0 && (
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-3">Packages</h3>
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <Card key={pkg.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handleBookNow}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{pkg.name}</h4>
                            <span className="font-bold text-lg">₹{pkg.price?.toLocaleString("en-IN")}</span>
                          </div>
                          {pkg.description && <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>}
                          <div className="text-sm text-muted-foreground mb-3">
                            Duration: {pkg.duration} hours
                          </div>
                          {pkg.includes && pkg.includes.length > 0 && (
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {pkg.includes.slice(0, 3).map((inc, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                                  {inc}
                                </li>
                              ))}
                              {pkg.includes.length > 3 && <li className="text-xs text-muted-foreground pl-5">+{pkg.includes.length - 3} more included</li>}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick info */}
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free booking inquiry</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Response within 2 hours</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Secure advance payment</p>
                  {photographer.isVerified && <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Verified photographer</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        prefillService={photographer.displayName}
        prefillCategory={photographer.specializations?.[0] || "Photography"}
      />
    </div>
  );
}
