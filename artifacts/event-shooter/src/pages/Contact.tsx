import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">Contact Us</h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">Have a question, feedback, or want to partner with us? We would love to hear from you.</p>
          </motion.div>
        </section>

        <section className="py-16 bg-muted/10">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid md:grid-cols-5 gap-10">
              {/* Contact info */}
              <div className="md:col-span-2 space-y-6">
                <h2 className="font-serif text-2xl font-bold">Get in Touch</h2>
                {[
                  { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
                  { icon: Mail, label: "Email", value: "hello@eventshooter.in", href: "mailto:hello@eventshooter.in" },
                  { icon: MapPin, label: "Office", value: "Level 12, Platina Business Park, Andheri East, Mumbai 400093" },
                  { icon: Clock, label: "Support Hours", value: "Mon–Sat, 9:00 AM – 8:00 PM IST" },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      {href ? <a href={href} className="text-muted-foreground hover:text-primary transition-colors">{value}</a> : <p className="text-muted-foreground text-sm">{value}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="md:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    {!sent ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="cn">Your Name</Label>
                            <Input id="cn" placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} required />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="ce">Email Address</Label>
                            <Input id="ce" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cs">Subject</Label>
                          <Input id="cs" placeholder="What is this about?" value={form.subject} onChange={e => set("subject", e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cm">Message</Label>
                          <Textarea id="cm" placeholder="Your message..." rows={5} value={form.message} onChange={e => set("message", e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : "Send Message"}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-bold mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground">Thanks for reaching out, {form.name}. We will reply to {form.email} within 24 hours.</p>
                        <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>Send Another</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
