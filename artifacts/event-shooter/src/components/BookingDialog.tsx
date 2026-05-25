import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  prefillService?: string;
  prefillCategory?: string;
}

export function BookingDialog({ open, onClose, prefillService, prefillCategory }: BookingDialogProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    eventType: prefillCategory || "", date: "", location: "",
    budget: "", message: "",
  });

  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.eventType || !form.date) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("form");
    setForm({ name: "", phone: "", email: "", eventType: prefillCategory || "", date: "", location: "", budget: "", message: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Book Your Event Service</DialogTitle>
              <DialogDescription>
                {prefillService ? `Booking: ${prefillService}` : "Fill in your details and we will connect you with the best professionals."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="Your full name" value={form.name} onChange={e => handleChange("name", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="+91 98765 43210" value={form.phone} onChange={e => handleChange("phone", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => handleChange("email", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Event Type *</Label>
                  <Select value={form.eventType} onValueChange={v => handleChange("eventType", v)} required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Fashion Event">Fashion Event</SelectItem>
                      <SelectItem value="Party">Party / Birthday</SelectItem>
                      <SelectItem value="Drone Shoot">Drone Shoot</SelectItem>
                      <SelectItem value="Reel / Short Film">Reel / Short Film</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Event Date *</Label>
                  <Input id="date" type="date" value={form.date} onChange={e => handleChange("date", e.target.value)} required min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location">City / Location</Label>
                  <Input id="location" placeholder="Mumbai, Delhi..." value={form.location} onChange={e => handleChange("location", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Budget Range</Label>
                  <Select value={form.budget} onValueChange={v => handleChange("budget", v)}>
                    <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-25k">Under ₹25,000</SelectItem>
                      <SelectItem value="25k-50k">₹25,000 – ₹50,000</SelectItem>
                      <SelectItem value="50k-1l">₹50,000 – ₹1,00,000</SelectItem>
                      <SelectItem value="1l-3l">₹1,00,000 – ₹3,00,000</SelectItem>
                      <SelectItem value="3l-plus">₹3,00,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message / Special Requirements</Label>
                <Textarea id="message" placeholder="Tell us about your event, venue, guest count, specific requirements..." rows={3} value={form.message} onChange={e => handleChange("message", e.target.value)} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Booking Request"}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-2 max-w-sm mx-auto">
              Thank you, <strong>{form.name}</strong>! Your booking request for <strong>{form.eventType}</strong> on <strong>{new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong> has been received.
            </p>
            <p className="text-muted-foreground text-sm mb-6">Our team will contact you at <strong>{form.phone}</strong> within 2 hours to confirm vendor availability and details.</p>
            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6 text-sm space-y-1.5">
              <p><span className="font-medium">Reference ID:</span> EVT-{Date.now().toString().slice(-6)}</p>
              <p><span className="font-medium">Event Type:</span> {form.eventType}</p>
              <p><span className="font-medium">Date:</span> {form.date}</p>
              {form.location && <p><span className="font-medium">Location:</span> {form.location}</p>}
              {form.budget && <p><span className="font-medium">Budget:</span> {form.budget.replace(/-/g, " – ").replace("k", ",000").replace("l", " Lakh").replace("plus", "+")}</p>}
            </div>
            <Button className="w-full" onClick={handleClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
