import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2, Calendar, PartyPopper } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  prefillService?: string;
  prefillCategory?: string;
}

export function BookingDialog({ open, onClose, prefillService, prefillCategory }: BookingDialogProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [refId] = useState(() => `EVT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    eventType: prefillCategory || "",
    date: "", location: "", budget: "", message: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isValid = form.name.trim() && form.phone.trim() && form.email.trim() && form.eventType && form.date;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
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
      <DialogContent className="w-[95vw] max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl p-0">
        {step === "form" ? (
          <div className="p-5 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-serif text-xl sm:text-2xl flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Book Your Event
              </DialogTitle>
              <DialogDescription className="text-sm">
                {prefillService
                  ? `Requesting: ${prefillService}`
                  : "Fill in your details and we'll connect you with the best professionals within 2 hours."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Phone - stacked on mobile, side-by-side on sm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dlg-name">Full Name *</Label>
                  <Input
                    id="dlg-name"
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dlg-phone">Phone *</Label>
                  <Input
                    id="dlg-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dlg-email">Email *</Label>
                <Input
                  id="dlg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                />
              </div>

              {/* Event Type + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Event Type *</Label>
                  <Select value={form.eventType} onValueChange={v => set("eventType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {["Wedding", "Pre-Wedding", "Engagement", "Corporate", "Fashion Event", "Party / Birthday", "Drone Shoot", "Reel / Short Film", "Maternity", "Other"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dlg-date">Event Date *</Label>
                  <Input
                    id="dlg-date"
                    type="date"
                    value={form.date}
                    onChange={e => set("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              {/* City + Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dlg-location">City</Label>
                  <Input
                    id="dlg-location"
                    placeholder="Mumbai, Delhi..."
                    value={form.location}
                    onChange={e => set("location", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Budget Range</Label>
                  <Select value={form.budget} onValueChange={v => set("budget", v)}>
                    <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-25k">Under ₹25,000</SelectItem>
                      <SelectItem value="25k-50k">₹25,000 – ₹50,000</SelectItem>
                      <SelectItem value="50k-1l">₹50,000 – ₹1,00,000</SelectItem>
                      <SelectItem value="1l-3l">₹1,00,000 – ₹3,00,000</SelectItem>
                      <SelectItem value="3l-plus">Above ₹3,00,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dlg-message">Message / Requirements</Label>
                <Textarea
                  id="dlg-message"
                  placeholder="Tell us about your event, venue, guest count, special requirements..."
                  rows={3}
                  value={form.message}
                  onChange={e => set("message", e.target.value)}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={loading || !isValid}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                  : "Submit Booking Request"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="flex justify-center mb-5">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <PartyPopper className="h-9 w-9 text-green-600" />
              </div>
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2">Request Sent!</h2>
            <p className="text-muted-foreground mb-1 max-w-sm mx-auto text-sm">
              Hi <strong>{form.name}</strong>! Your booking request for <strong>{form.eventType}</strong> on{" "}
              <strong>{new Date(form.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong> is confirmed.
            </p>
            <p className="text-muted-foreground text-sm mb-5">
              Our team will call you at <strong>{form.phone}</strong> within 2 hours.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 text-left mb-5 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference ID</span>
                <span className="font-bold text-primary">{refId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event</span>
                <span className="font-medium">{form.eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{form.date}</span>
              </div>
              {form.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium">{form.location}</span>
                </div>
              )}
              {form.budget && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{form.budget.replace("under-25k", "Under ₹25K").replace("25k-50k", "₹25K–₹50K").replace("50k-1l", "₹50K–₹1L").replace("1l-3l", "₹1L–₹3L").replace("3l-plus", "₹3L+")}</span>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
