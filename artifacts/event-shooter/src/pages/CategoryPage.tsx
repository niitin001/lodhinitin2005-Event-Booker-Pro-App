import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Calendar } from "lucide-react";
import { CATEGORY_DATA } from "@/data/categoryData";
import { BookingDialog } from "@/components/BookingDialog";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [bookingVendor, setBookingVendor] = useState<{ name: string; role: string } | null>(null);

  const slug = params?.slug || "";
  const cat = CATEGORY_DATA[slug];

  if (!cat) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
            <Button onClick={() => setLocation("/")}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[360px] flex items-end overflow-hidden">
        <img src={cat.heroImage} alt={cat.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur">
              {cat.services.length} Services Available
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tight mb-3">{cat.title}</h1>
            <p className="text-lg text-gray-200 max-w-2xl">{cat.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Services Strip */}
      <section className="bg-background border-b py-4">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {cat.services.map((s) => (
              <Badge key={s} variant="secondary" className="whitespace-nowrap text-sm px-3 py-1.5 cursor-default">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 bg-muted/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="vendors">
            <TabsList className="mb-8">
              <TabsTrigger value="vendors">Our Vendors</TabsTrigger>
              <TabsTrigger value="packages">Packages & Pricing</TabsTrigger>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
            </TabsList>

            {/* VENDORS TAB */}
            <TabsContent value="vendors">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold">Top {cat.title} Professionals</h2>
                <p className="text-muted-foreground mt-1">Handpicked and verified specialists for {cat.slug} events.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.vendors.map((vendor, i) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-all group">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          {vendor.rating} ({vendor.reviews})
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg">{vendor.name}</h3>
                        <p className="text-sm font-medium text-muted-foreground">{vendor.role}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-3">
                          <MapPin className="h-3.5 w-3.5" />
                          {vendor.city}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{vendor.about}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {vendor.tags.map((tag) => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold bg-secondary px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Starting at</p>
                            <p className="font-bold text-lg">₹{vendor.startingPrice.toLocaleString("en-IN")}</p>
                          </div>
                          <Button size="sm" onClick={() => setBookingVendor({ name: vendor.name, role: vendor.role })}>
                            <Calendar className="h-4 w-4 mr-1" /> Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button size="lg" variant="outline" onClick={() => setLocation("/book")}>
                  View All Vendors & Book <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* PACKAGES TAB */}
            <TabsContent value="packages">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold">Packages & Pricing</h2>
                <p className="text-muted-foreground mt-1">Choose a package or customise to fit your exact needs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cat.packages.map((pkg, i) => (
                  <motion.div
                    key={pkg.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`h-full flex flex-col relative overflow-hidden ${pkg.popular ? "border-2 border-primary shadow-lg" : ""}`}>
                      {pkg.popular && (
                        <div className="absolute top-4 right-4">
                          <Badge>Most Popular</Badge>
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="font-bold text-xl mb-1">{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{pkg.duration}</p>
                        <div className="mb-6">
                          <span className="text-4xl font-bold">₹{pkg.price.toLocaleString("en-IN")}</span>
                          <span className="text-muted-foreground text-sm ml-1">/ package</span>
                        </div>
                        <ul className="space-y-2.5 flex-1 mb-6">
                          {pkg.includes.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full mt-auto"
                          variant={pkg.popular ? "default" : "outline"}
                          onClick={() => setBookingVendor({ name: pkg.name, role: cat.title })}
                        >
                          Book This Package
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <Card className="mt-8 p-6 bg-muted/30 border-dashed">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">Need a custom package?</h4>
                    <p className="text-muted-foreground text-sm">Tell us your requirements and we will build a bespoke package for you.</p>
                  </div>
                  <Button onClick={() => setLocation("/book")} size="lg">Get Custom Quote</Button>
                </div>
              </Card>
            </TabsContent>

            {/* FAQ TAB */}
            <TabsContent value="faq">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold">Frequently Asked Questions</h2>
              </div>
              <div className="max-w-3xl space-y-3">
                {cat.faqs.map((faq, i) => (
                  <Card key={i} className="overflow-hidden">
                    <button
                      className="w-full p-5 text-left flex justify-between items-center gap-4"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-semibold">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* CTA Band */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-3">Ready to plan your {cat.slug} event?</h2>
          <p className="text-primary-foreground/80 mb-6 text-lg">Fill in our quick booking form and we will connect you with the best professionals within 2 hours.</p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/book")}>
            Book Now — It is Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />

      {bookingVendor && (
        <BookingDialog
          open={!!bookingVendor}
          onClose={() => setBookingVendor(null)}
          prefillService={bookingVendor.role}
          prefillCategory={cat.title}
        />
      )}
    </div>
  );
}
