import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronUp, BookOpen, CreditCard, User, Camera, MessageSquare, Shield } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORIES = [
  { icon: BookOpen, label: "Getting Started", count: 8 },
  { icon: Camera, label: "For Vendors", count: 12 },
  { icon: User, label: "My Account", count: 6 },
  { icon: CreditCard, label: "Payments & Refunds", count: 9 },
  { icon: MessageSquare, label: "Bookings", count: 11 },
  { icon: Shield, label: "Safety & Trust", count: 7 },
];

const FAQS = [
  { q: "How do I book an event service?", a: "Click on any category or vendor, select a package or fill in the booking form. Our team will contact you within 2 hours with vendor matches. You can also use the Book Now button on any vendor card.", cat: "Getting Started" },
  { q: "Is EventShooter free for customers?", a: "Yes! Browsing, searching, and submitting booking requests are completely free. You only pay the vendor directly after confirming your booking.", cat: "Getting Started" },
  { q: "How are vendors verified?", a: "Every vendor goes through a 3-step verification: ID proof, portfolio review, and a background check. Only vendors who pass all three steps are listed on EventShooter.", cat: "Safety & Trust" },
  { q: "Can I cancel or reschedule a booking?", a: "Yes, cancellations and reschedules can be requested up to 48 hours before the event. Refund policies vary by vendor and are clearly stated on each vendor profile.", cat: "Bookings" },
  { q: "How do I pay vendors?", a: "Payments are processed securely through Razorpay or direct UPI. Typically, a 30% advance is collected at booking and the remaining balance is paid after the event.", cat: "Payments & Refunds" },
  { q: "What if a vendor cancels on me?", a: "If a vendor cancels, we immediately source an alternative vendor at no extra charge. If no alternative is available, a full refund is processed within 3-5 business days.", cat: "Safety & Trust" },
  { q: "How long does it take to get my photos/videos?", a: "Delivery timelines vary by vendor. Standard photography: 3-7 days. Cinematic videos: 7-14 days. Reels/short-form content: 24-48 hours. Timeline is confirmed at booking.", cat: "Bookings" },
  { q: "How do I join as a vendor?", a: "Click Register and select Photographer/Vendor. Complete your profile, upload your portfolio, and submit for verification. Approval takes 2-3 business days.", cat: "For Vendors" },
  { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and EMI options for bookings above ₹20,000.", cat: "Payments & Refunds" },
  { q: "Can I get a refund?", a: "Refunds depend on the cancellation policy agreed at the time of booking. Full refunds are available if cancelled 7+ days before the event. Within 7 days, partial refunds may apply.", cat: "Payments & Refunds" },
];

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-4xl font-bold mb-4">How can we help you?</h1>
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help topics..."
                  className="pl-12 h-12 text-foreground bg-background"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        {!search && (
          <section className="py-12 bg-background border-b">
            <div className="container mx-auto max-w-5xl px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORIES.map(({ icon: Icon, label, count }) => (
                  <Card key={label} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSearch(label)}>
                    <CardContent className="p-5 text-center">
                      <Icon className="h-7 w-7 mx-auto mb-3 text-primary" />
                      <p className="font-medium text-sm">{label}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{count} articles</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        <section className="py-14 bg-muted/10">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="font-serif text-2xl font-bold mb-6 text-center">{search ? `Results for "${search}"` : "Frequently Asked Questions"}</h2>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No results found for "{search}"</p>
                <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>
              </div>
            )}
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <Card key={i} className="overflow-hidden">
                  <button className="w-full p-5 text-left flex justify-between items-start gap-4" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">{faq.cat}</Badge>
                      <p className="font-semibold">{faq.q}</p>
                    </div>
                    {openFaq === i ? <ChevronUp className="h-5 w-5 flex-shrink-0 mt-1" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 mt-1" />}
                  </button>
                  {openFaq === i && <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>}
                </Card>
              ))}
            </div>

            <Card className="mt-10 p-6 text-center bg-muted/30">
              <p className="font-semibold mb-1">Still need help?</p>
              <p className="text-muted-foreground text-sm mb-4">Our support team responds within 2 hours during business hours.</p>
              <Button onClick={() => setLocation("/contact")}>Contact Support</Button>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
