import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Camera, Star, ArrowRight, Video, Aperture, Plane } from "lucide-react";
import { useGetTrendingPhotographers } from "@workspace/api-client-react";

const CATEGORIES = [
  { name: "Wedding", icon: Aperture, image: "/images/category-wedding.png" },
  { name: "Corporate", icon: Camera, image: "/images/category-corporate.png" },
  { name: "Fashion", icon: Star, image: "/images/category-fashion.png" },
  { name: "Drone", icon: Plane, image: "/images/category-drone.png" },
  { name: "Party", icon: Camera, image: "/images/category-party.png" },
  { name: "Reel", icon: Video, image: "/images/category-reel.png" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: trending } = useGetTrendingPhotographers();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const city = formData.get("city");
    const type = formData.get("type");
    setLocation(`/explore?city=${city}&eventType=${type}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero-wedding.png" 
              alt="Cinematic wedding photography" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              Cinematic Memories,<br />Booked Instantly.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto"
            >
              Hire elite photographers, videographers, and drone operators for your next big moment.
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
                  placeholder="Where is your event?" 
                  className="pl-10 bg-background/90 text-foreground border-0 h-12 text-base rounded-lg"
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  name="type" 
                  placeholder="Event type (e.g. Wedding)" 
                  className="pl-10 bg-background/90 text-foreground border-0 h-12 text-base rounded-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 text-base">
                Search
              </Button>
            </motion.form>
          </div>
        </section>

        {/* Categories */}
        <section className="py-24 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-3xl font-bold tracking-tight">Shoot by Category</h2>
                <p className="text-muted-foreground mt-2">Find the right specialist for your specific needs.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((category, i) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/explore?eventType=${category.name.toLowerCase()}`} className="group block relative overflow-hidden rounded-xl aspect-[3/4]">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <category.icon className="h-6 w-6 mb-2" />
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-3xl font-bold tracking-tight">Trending Shooters</h2>
                <p className="text-muted-foreground mt-2">The most booked creatives this week.</p>
              </div>
              <Button variant="ghost" onClick={() => setLocation("/explore")} className="hidden sm:flex">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending?.map((photographer, i) => (
                <motion.div
                  key={photographer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all group cursor-pointer" onClick={() => setLocation(`/photographers/${photographer.id}`)}>
                    <div className="aspect-square overflow-hidden relative">
                      <img 
                        src={photographer.coverImageUrl || "/images/photographer-1.png"} 
                        alt={photographer.displayName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                        {photographer.rating.toFixed(1)}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg line-clamp-1">{photographer.displayName}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{photographer.city}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {photographer.specializations?.slice(0, 2).map(spec => (
                          <span key={spec} className="text-xs bg-secondary px-2 py-1 rounded-md">
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
                </motion.div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-8 sm:hidden" onClick={() => setLocation("/explore")}>
              View all photographers
            </Button>
          </div>
        </section>

        {/* AI Features Callout */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute bottom-0 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl mix-blend-screen" />
          </div>
          
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-4xl font-bold tracking-tight mb-6">Smarter bookings powered by AI</h2>
                <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
                  Not sure what package you need? Use our AI tools to estimate costs, recommend packages based on your mood board, or even generate the perfect Instagram captions for your deliverables.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary" onClick={() => setLocation("/ai")}>
                    Try AI Estimator
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground">
                    Learn more
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img src="/images/hero-wedding.png" alt="AI Features" className="w-full h-full object-cover" />
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-6 -left-6 bg-background text-foreground p-6 rounded-xl shadow-xl max-w-xs"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">AI Recommended</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Based on your "Moody Urban" reference, we recommend a 4-hour evening package with 2 flash units.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
