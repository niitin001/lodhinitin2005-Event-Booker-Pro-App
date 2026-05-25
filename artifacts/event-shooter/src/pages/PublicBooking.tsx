import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, Calendar, MapPin, Phone, Mail, User, IndianRupee, MessageSquare } from "lucide-react";

const EVENT_TYPES = ["Wedding", "Corporate Event", "Fashion Show", "Birthday Party", "Anniversary", "Drone Shoot", "Instagram Reel", "Short Film", "Pre-Wedding Shoot", "Product Launch", "Other"];
const BUDGET_RANGES = [
  { label: "Under ₹25,000", value: "under-25k" },
  { label: "₹25,000 – ₹50,000", value: "25k-50k" },
  { label: "₹50,000 – ₹1,00,000", value: "50k-1l" },
  { label: "₹1,00,000 – ₹3,00,000", value: "1l-3l" },
  { label: "₹3,00,000 – ₹5,00,000", value: "3l-5l" },
  { label: "₹5,00,000+", value: "5l-plus" },
];

export default function PublicBooking() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", eventType: "", date: "",
    location: "", budget: "", guestCount: "", message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim() || !/^\+?[0-9]{10,13}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Valid phone number required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.eventType) e.eventType = "Please select an event type";
    if (!form.date) e.date = "Event date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setStep("success");
  };

  const refId = `EVT-${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          {step === "form" ? (
            <div className="grid lg:grid-cols-5 gap-10">
              {/* Left info panel */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <h1 className="font-serif text-3xl font-bold tracking-tight mb-2">Book Your Event</h1>
                  <p className="text-muted-foreground leading-relaxed">Fill in the form and our team will reach you within 2 hours with the best vendor matches for your event.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle, title: "Free Service", desc: "No booking fees. You pay only when you confirm a vendor." },
                    { icon: CheckCircle, title: "Verified Vendors", desc: "All vendors are background-checked and portfolio-verified." },
                    { icon: CheckCircle, title: "Quick Response", desc: "Get 3 vendor quotes within 2 hours of submitting your request." },
                    { icon: CheckCircle, title: "Flexible Budgets", desc: "We work with all budgets, from intimate events to grand celebrations." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-3">
                      <Icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{title}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Need immediate help?</p>
                    <p>Call us: <a href="tel:+919876543210" className="text-primary font-medium">+91 98765 43210</a></p>
                    <p>Email: <a href="mailto:hello@eventshooter.in" className="text-primary font-medium">hello@eventshooter.in</a></p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Form */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name *</Label>
                          <Input id="name" placeholder="Rahul Sharma" value={form.name} onChange={e => set("name", e.target.value)} className={errors.name ? "border-destructive" : ""} />
                          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number *</Label>
                          <Input id="phone" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} className={errors.phone ? "border-destructive" : ""} />
                          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address *</Label>
                        <Input id="email" type="email" placeholder="rahul@example.com" value={form.email} onChange={e => set("email", e.target.value)} className={errors.email ? "border-destructive" : ""} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Event Type *</Label>
                          <Select value={form.eventType} onValueChange={v => set("eventType", v)}>
                            <SelectTrigger className={errors.eventType ? "border-destructive" : ""}><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                          {errors.eventType && <p className="text-xs text-destructive">{errors.eventType}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="date" className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Event Date *</Label>
                          <Input id="date" type="date" value={form.date} onChange={e => set("date", e.target.value)} min={new Date().toISOString().split("T")[0]} className={errors.date ? "border-destructive" : ""} />
                          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="location" className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> City / Venue</Label>
                          <Input id="location" placeholder="Mumbai, Maharashtra" value={form.location} onChange={e => set("location", e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> Budget Range</Label>
                          <Select value={form.budget} onValueChange={v => set("budget", v)}>
                            <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                            <SelectContent>{BUDGET_RANGES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="guestCount">Approximate Guest Count</Label>
                        <Input id="guestCount" type="number" placeholder="e.g. 150" value={form.guestCount} onChange={e => set("guestCount", e.target.value)} min="1" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="message" className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Message / Requirements</Label>
                        <Textarea id="message" placeholder="Tell us more — venue name, specific styles, special requirements, any reference photos or inspiration..." rows={4} value={form.message} onChange={e => set("message", e.target.value)} />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting your request...</> : "Submit Booking Request — It is Free"}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">By submitting, you agree to our <span className="text-primary cursor-pointer" onClick={() => setLocation("/terms")}>Terms of Service</span> and <span className="text-primary cursor-pointer" onClick={() => setLocation("/privacy")}>Privacy Policy</span>.</p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center py-16"
            >
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-11 w-11 text-green-600" />
                </div>
              </div>
              <h2 className="font-serif text-3xl font-bold mb-3">Booking Confirmed!</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Thank you, <strong>{form.name}</strong>! Your request has been received successfully.
              </p>
              <Card className="text-left mb-6">
                <CardContent className="p-5 space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2 mb-2">
                    <span className="text-muted-foreground">Reference ID</span>
                    <span className="font-bold text-primary">{refId}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{form.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{form.phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Event Type</span><span className="font-medium">{form.eventType}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Event Date</span><span className="font-medium">{new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                  {form.location && <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{form.location}</span></div>}
                </CardContent>
              </Card>
              <p className="text-muted-foreground text-sm mb-8">Our team will call you at <strong>{form.phone}</strong> within 2 hours with top vendor matches. You will also receive a confirmation email at <strong>{form.email}</strong>.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" onClick={() => setLocation("/")}>Back to Home</Button>
                <Button variant="outline" className="flex-1" onClick={() => { setStep("form"); setForm({ name: "", phone: "", email: "", eventType: "", date: "", location: "", budget: "", guestCount: "", message: "" }); }}>
                  Submit Another
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
