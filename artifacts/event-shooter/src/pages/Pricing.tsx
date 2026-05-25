import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const PLANS = [
  {
    name: "Customer",
    price: "Free",
    badge: null,
    description: "For individuals booking event services.",
    features: [
      { text: "Browse all vendors", included: true },
      { text: "Submit booking requests", included: true },
      { text: "Get 3 quotes per request", included: true },
      { text: "AI cost estimator", included: true },
      { text: "Direct vendor messaging", included: true },
      { text: "Booking history & invoices", included: true },
      { text: "Priority customer support", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    cta: "Start Booking — Free",
    href: "/register",
  },
  {
    name: "Vendor Pro",
    price: "₹999/mo",
    badge: "Most Popular",
    description: "For photographers, DJs, decorators, and all event vendors.",
    features: [
      { text: "Verified vendor profile", included: true },
      { text: "Unlimited booking requests", included: true },
      { text: "Featured in search results", included: true },
      { text: "Portfolio gallery (50 items)", included: true },
      { text: "AI caption generator", included: true },
      { text: "Earnings dashboard", included: true },
      { text: "Priority customer support", included: true },
      { text: "Dedicated account manager", included: false },
    ],
    cta: "Join as Vendor",
    href: "/register?role=photographer",
  },
  {
    name: "Vendor Elite",
    price: "₹2,499/mo",
    badge: "Best Value",
    description: "For top vendors who want maximum visibility and leads.",
    features: [
      { text: "Everything in Vendor Pro", included: true },
      { text: "Top placement in search", included: true },
      { text: "Unlimited portfolio items", included: true },
      { text: "Homepage featured listing", included: true },
      { text: "Social media promotion", included: true },
      { text: "Priority customer support", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom profile URL", included: true },
    ],
    cta: "Go Elite",
    href: "/register?role=photographer&plan=elite",
  },
];

const PLATFORM_FEES = [
  { event: "Wedding / Pre-Wedding", vendor: "12%", customer: "Free" },
  { event: "Corporate Event", vendor: "10%", customer: "Free" },
  { event: "Fashion Show", vendor: "12%", customer: "Free" },
  { event: "Party / Birthday", vendor: "10%", customer: "Free" },
  { event: "Drone Shoot", vendor: "8%", customer: "Free" },
  { event: "Reel / Short Film", vendor: "10%", customer: "Free" },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">Pricing & Fees</h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">Simple, transparent pricing. No hidden fees. Customers always book for free.</p>
          </motion.div>
        </section>

        {/* Plans */}
        <section className="py-16 bg-background">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className={`h-full flex flex-col relative ${plan.badge === "Most Popular" ? "border-2 border-primary shadow-xl" : ""}`}>
                    {plan.badge && <div className="absolute top-4 right-4"><Badge variant={plan.badge === "Most Popular" ? "default" : "secondary"}>{plan.badge}</Badge></div>}
                    <CardContent className="p-6 flex flex-col h-full">
                      <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.price !== "Free" && <span className="text-muted-foreground text-sm ml-1">+ platform fee</span>}
                      </div>
                      <ul className="space-y-2.5 flex-1 mb-6">
                        {plan.features.map(f => (
                          <li key={f.text} className="flex items-center gap-2 text-sm">
                            {f.included ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                            <span className={f.included ? "" : "text-muted-foreground"}>{f.text}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={plan.badge === "Most Popular" ? "default" : "outline"} onClick={() => setLocation(plan.href)}>
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Fees */}
        <section className="py-14 bg-muted/10">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="font-serif text-2xl font-bold text-center mb-2">Platform Transaction Fees</h2>
            <p className="text-muted-foreground text-center mb-8">Charged only when a booking is completed. Customers are never charged.</p>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Event Type</th>
                      <th className="text-center p-4 font-semibold">Vendor Fee</th>
                      <th className="text-center p-4 font-semibold">Customer Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLATFORM_FEES.map((row, i) => (
                      <tr key={row.event} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="p-4">{row.event}</td>
                        <td className="p-4 text-center font-medium">{row.vendor}</td>
                        <td className="p-4 text-center text-green-600 font-semibold">{row.customer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="text-center text-xs text-muted-foreground mt-4">All fees include 18% GST. Payments processed securely via Razorpay.</p>
          </div>
        </section>

        <section className="py-12 bg-primary text-primary-foreground text-center px-4">
          <h2 className="font-serif text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-primary-foreground/80 mb-5">Our team is here to help you choose the right plan.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setLocation("/contact")}>Contact Us</Button>
            <Button variant="outline" className="bg-transparent border-white/30 hover:bg-white/10 text-white" onClick={() => setLocation("/help")}>Help Center <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
