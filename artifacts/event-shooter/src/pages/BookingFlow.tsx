import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  CalendarIcon, ArrowRight, ArrowLeft, CheckCircle2,
  MapPin, Star, Camera, Loader2, PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useGetPhotographer,
  getGetPhotographerQueryKey,
  useGetPhotographerPackages,
  getGetPhotographerPackagesQueryKey,
  useCreateBooking
} from "@workspace/api-client-react";

const EVENT_TYPES = [
  { value: "Wedding", label: "Wedding" },
  { value: "Pre-Wedding", label: "Pre-Wedding Shoot" },
  { value: "Engagement", label: "Engagement Ceremony" },
  { value: "Corporate", label: "Corporate Event" },
  { value: "Fashion", label: "Fashion / Editorial" },
  { value: "Party", label: "Birthday / Party" },
  { value: "Drone", label: "Drone Aerial Shoot" },
  { value: "Reel", label: "Reel / Short Film" },
  { value: "Maternity", label: "Maternity Shoot" },
  { value: "Product", label: "Product Photography" },
  { value: "Other", label: "Other" },
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune",
  "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh", "Lucknow", "Goa",
  "Surat", "Indore", "Bhopal", "Nagpur", "Udaipur", "Kochi",
];

const TOTAL_STEPS = 3;

function StepIndicator({ current }: { current: number }) {
  const steps = ["Event Details", "Choose Package", "Confirm & Pay"];
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = current > stepNum;
        const active = current === stepNum;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0",
                done ? "bg-green-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
              </div>
              <span className={cn(
                "text-xs mt-1 text-center hidden sm:block",
                active ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 flex-1 mx-2 transition-colors duration-300", current > stepNum ? "bg-green-500" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BookingFlow() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const id = Number(params.photographerId);
  const searchParams = new URLSearchParams(window.location.search);
  const initialPackage = searchParams.get("package");

  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [formData, setFormData] = useState({
    eventType: "",
    date: undefined as Date | undefined,
    city: "",
    venue: "",
    packageId: initialPackage ? Number(initialPackage) : undefined as number | undefined,
    notes: "",
    guestCount: "",
  });
  const [cityInput, setCityInput] = useState("");
  const [showCitySugg, setShowCitySugg] = useState(false);

  const { data: photographer, isLoading: photoLoading } = useGetPhotographer(id, {
    query: { enabled: !!id, queryKey: getGetPhotographerQueryKey(id) }
  });

  const { data: packages } = useGetPhotographerPackages(id, {
    query: { enabled: !!id, queryKey: getGetPhotographerPackagesQueryKey(id) }
  });

  const createBooking = useCreateBooking();
  const selectedPackageData = packages?.find(p => p.id === formData.packageId);
  const filteredCities = CITIES.filter(c => c.toLowerCase().startsWith(cityInput.toLowerCase()) && cityInput.length > 0);

  const handleNext = () => {
    if (step === 1 && (!formData.eventType || !formData.date || !formData.city)) {
      toast.error("Please fill in Event Type, Date, and City.");
      return;
    }
    if (step === 2 && !formData.packageId) {
      toast.error("Please select a package to continue.");
      return;
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleSubmit = () => {
    if (!formData.packageId || !formData.date || !formData.eventType || !formData.city) {
      toast.error("Missing required fields. Please go back and complete the form.");
      return;
    }
    createBooking.mutate({
      data: {
        photographerId: id,
        packageId: formData.packageId,
        eventType: formData.eventType,
        eventDate: formData.date.toISOString(),
        city: formData.city,
        venue: formData.venue || undefined,
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: (data) => {
        setBookingRef(`EVT-${data.id || Date.now().toString().slice(-6)}`);
        setConfirmed(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to submit booking. Please try again.");
      }
    });
  };

  const handleGoToDashboard = () => {
    if (user?.role === "photographer") setLocation("/photographer/dashboard");
    else setLocation("/dashboard");
  };

  if (photoLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──
  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <PartyPopper className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="font-serif text-3xl font-bold mb-3">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Your booking request has been sent to <strong>{photographer?.displayName}</strong>. They will respond within 2 hours.
            </p>

            <Card className="text-left mb-6">
              <CardContent className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference ID</span>
                  <span className="font-bold text-primary">{bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photographer</span>
                  <span className="font-medium">{photographer?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{formData.eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formData.date ? format(formData.date, "d MMMM yyyy") : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium">{formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package</span>
                  <span className="font-medium">{selectedPackageData?.name}</span>
                </div>
                <div className="pt-3 border-t flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{selectedPackageData?.price?.toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={handleGoToDashboard}>
                View My Bookings
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setLocation("/explore")}>
                Explore More
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-8">
        {/* Photographer mini-card */}
        {photographer && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-card border rounded-xl shadow-sm">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {photographer.coverImageUrl
                ? <img src={photographer.coverImageUrl} alt="" className="w-full h-full object-cover" />
                : <Camera className="h-5 w-5 m-auto mt-3.5 text-muted-foreground/50" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{photographer.displayName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{photographer.city}
                <span className="ml-2 flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  {photographer.rating.toFixed(1)}
                </span>
              </p>
            </div>
            {photographer.isVerified && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs hidden sm:flex">Verified</Badge>
            )}
          </div>
        )}

        <StepIndicator current={step} />

        <Card className="shadow-sm">
          {/* ── STEP 1: Event Details ── */}
          {step === 1 && (
            <CardContent className="p-5 sm:p-8 space-y-5">
              <h2 className="font-serif text-xl font-bold">Tell us about your event</h2>

              <div className="space-y-1.5">
                <Label>Event Type *</Label>
                <Select value={formData.eventType} onValueChange={v => setFormData(d => ({ ...d, eventType: v }))}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select your event type" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11", !formData.date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {formData.date ? format(formData.date, "d MMMM yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={date => setFormData(d => ({ ...d, date: date || undefined }))}
                      disabled={date => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* City with autocomplete */}
              <div className="space-y-1.5">
                <Label>City *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    className="pl-9 h-11"
                    placeholder="Mumbai, Delhi, Bangalore..."
                    value={cityInput}
                    onChange={e => { setCityInput(e.target.value); setFormData(d => ({ ...d, city: e.target.value })); setShowCitySugg(true); }}
                    onFocus={() => setShowCitySugg(true)}
                    onBlur={() => setTimeout(() => setShowCitySugg(false), 150)}
                  />
                  {showCitySugg && filteredCities.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-xl z-50 overflow-hidden max-h-44 overflow-y-auto">
                      {filteredCities.map(c => (
                        <button key={c} type="button" className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted"
                          onMouseDown={() => { setCityInput(c); setFormData(d => ({ ...d, city: c })); setShowCitySugg(false); }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Venue / Location <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input className="h-11" placeholder="Hotel name, banquet hall, outdoor location..." value={formData.venue} onChange={e => setFormData(d => ({ ...d, venue: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  placeholder="Share your vision, mood, style preferences, or any specific requirements..."
                  className="min-h-[90px] resize-none"
                  value={formData.notes}
                  onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleNext} size="lg" className="w-full sm:w-auto">
                  Continue to Packages <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          )}

          {/* ── STEP 2: Select Package ── */}
          {step === 2 && (
            <CardContent className="p-5 sm:p-8 space-y-5">
              <h2 className="font-serif text-xl font-bold">Choose a Package</h2>
              <p className="text-muted-foreground text-sm">Select the package that best fits your event.</p>

              {!packages || packages.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-muted-foreground">No packages listed. Contact the photographer directly to discuss pricing.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map(pkg => (
                    <div
                      key={pkg.id}
                      className={cn(
                        "border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200",
                        formData.packageId === pkg.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/40 hover:bg-muted/30"
                      )}
                      onClick={() => setFormData(d => ({ ...d, packageId: pkg.id }))}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors", formData.packageId === pkg.id ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                            <h4 className="font-bold text-base">{pkg.name}</h4>
                          </div>
                          {pkg.description && <p className="text-sm text-muted-foreground mb-2 ml-6">{pkg.description}</p>}
                          <div className="ml-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {pkg.duration} hours</span>
                          </div>
                          {pkg.includes && pkg.includes.length > 0 && (
                            <ul className="ml-6 mt-2 space-y-1">
                              {pkg.includes.map((inc, i) => (
                                <li key={i} className="text-sm flex items-start gap-1.5 text-muted-foreground">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" /> {inc}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-xl text-primary">₹{pkg.price?.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!formData.packageId} className="flex-1 sm:flex-none sm:ml-auto">
                  Review Booking <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <CardContent className="p-5 sm:p-8 space-y-5">
              <h2 className="font-serif text-xl font-bold">Review & Confirm</h2>

              {/* Summary Card */}
              <div className="bg-muted/30 rounded-xl p-5 space-y-3 text-sm">
                <h3 className="font-semibold text-base mb-3">Booking Summary</h3>
                {[
                  { label: "Photographer", value: photographer?.displayName },
                  { label: "Event Type", value: formData.eventType },
                  { label: "Date", value: formData.date ? format(formData.date, "d MMMM yyyy") : "" },
                  { label: "City", value: formData.city },
                  ...(formData.venue ? [{ label: "Venue", value: formData.venue }] : []),
                  { label: "Package", value: selectedPackageData?.name },
                  { label: "Duration", value: selectedPackageData ? `${selectedPackageData.duration} hours` : "" },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground flex-shrink-0">{label}</span>
                    <span className="font-medium text-right">{value}</span>
                  </div>
                ) : null)}
                {formData.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm italic text-muted-foreground">"{formData.notes}"</p>
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-bold text-base">Total Amount</span>
                  <span className="font-bold text-xl text-primary">₹{selectedPackageData?.price?.toLocaleString("en-IN") || "—"}</span>
                </div>
              </div>

              {/* Note */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
                After confirming, the photographer will review your request and respond within 2 hours. Payment is collected after confirmation.
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} disabled={createBooking.isPending} className="flex-1 sm:flex-none">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={createBooking.isPending} size="lg" className="flex-1 sm:flex-none sm:ml-auto">
                  {createBooking.isPending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirming...</>
                    : "Confirm Booking"
                  }
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
