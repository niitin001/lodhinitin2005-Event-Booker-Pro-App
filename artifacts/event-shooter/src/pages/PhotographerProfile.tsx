import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Camera, CheckCircle2, MessageSquare, Heart } from "lucide-react";
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

export default function PhotographerProfile() {
  const params = useParams();
  const id = Number(params.id);

  const { data: photographer, isLoading: isPhotographerLoading } = useGetPhotographer(id, {
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

  if (isPhotographerLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (!photographer) {
    return <div className="min-h-screen flex items-center justify-center">Photographer not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Cover Hero */}
      <div className="h-64 md:h-96 relative w-full bg-muted">
        {photographer.coverImageUrl ? (
          <img src={photographer.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Camera className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            <div className="flex items-end gap-6">
              <div className="h-32 w-32 rounded-xl border-4 border-background overflow-hidden bg-muted shrink-0">
                {photographer.avatarUrl ? (
                  <img src={photographer.avatarUrl} alt={photographer.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <Camera className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="pb-2 text-white">
                <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight drop-shadow-md">{photographer.displayName}</h1>
                <div className="flex items-center gap-4 mt-2 text-white/90 drop-shadow">
                  <span className="flex items-center text-sm font-medium"><MapPin className="h-4 w-4 mr-1" /> {photographer.city}</span>
                  <span className="flex items-center text-sm font-medium"><Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" /> {photographer.rating.toFixed(1)} ({photographer.totalReviews} reviews)</span>
                  {photographer.isVerified && <span className="flex items-center text-sm font-medium text-blue-300"><CheckCircle2 className="h-4 w-4 mr-1" /> Verified Pro</span>}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border mt-4">
              <h2 className="font-semibold text-xl mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {photographer.bio || "No bio provided."}
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {photographer.specializations?.map(spec => (
                  <Badge key={spec} variant="secondary" className="px-3 py-1 text-sm font-medium">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
                <TabsTrigger value="portfolio" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-medium">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-medium">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio" className="space-y-6">
                {portfolio && portfolio.length > 0 ? (
                  <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {portfolio.map((item) => (
                      <div key={item.id} className="break-inside-avoid relative group rounded-lg overflow-hidden cursor-zoom-in">
                        <img src={item.mediaUrl} alt={item.title || "Portfolio item"} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-4 text-center backdrop-blur-sm">
                          {item.title && <span className="font-medium">{item.title}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No portfolio items uploaded yet.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium">{review.customer?.name || "Customer"}</div>
                          <div className="flex items-center text-yellow-500 text-sm">
                            <Star className="h-3 w-3 fill-current mr-1" />
                            {review.rating.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No reviews yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking & Pricing */}
          <div className="lg:w-96 shrink-0 mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              <div className="flex gap-3">
                <Button className="flex-1 text-base h-12" asChild>
                  <Link href={`/book/${photographer.id}`}>Book Now</Link>
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 text-muted-foreground hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold">Packages</h3>
                {packages && packages.length > 0 ? (
                  packages.map((pkg) => (
                    <Card key={pkg.id} className="border-border/50 hover:border-border transition-colors">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{pkg.name}</h4>
                          <span className="font-bold text-lg">${pkg.price}</span>
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                        )}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <span className="font-medium mr-2">Duration:</span> {pkg.duration} hours
                          </div>
                        </div>
                        {pkg.includes && pkg.includes.length > 0 && (
                          <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                            {pkg.includes.map((inc, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                {inc}
                              </li>
                            ))}
                          </ul>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/book/${photographer.id}?package=${pkg.id}`}>Select Package</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                      Custom pricing available. Contact photographer to negotiate.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
