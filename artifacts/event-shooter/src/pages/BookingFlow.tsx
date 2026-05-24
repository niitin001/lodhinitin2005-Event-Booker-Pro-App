import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  useGetPhotographer, 
  getGetPhotographerQueryKey,
  useGetPhotographerPackages,
  getGetPhotographerPackagesQueryKey,
  useCreateBooking
} from "@workspace/api-client-react";

export default function BookingFlow() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = Number(params.photographerId);
  const searchParams = new URLSearchParams(window.location.search);
  const initialPackage = searchParams.get("package");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    eventType: "",
    date: undefined as Date | undefined,
    city: "",
    venue: "",
    packageId: initialPackage ? Number(initialPackage) : undefined,
    notes: ""
  });

  const { data: photographer } = useGetPhotographer(id, {
    query: { enabled: !!id, queryKey: getGetPhotographerQueryKey(id) }
  });

  const { data: packages } = useGetPhotographerPackages(id, {
    query: { enabled: !!id, queryKey: getGetPhotographerPackagesQueryKey(id) }
  });

  const createBooking = useCreateBooking();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (!formData.packageId || !formData.date || !formData.eventType || !formData.city) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createBooking.mutate({
      data: {
        photographerId: id,
        packageId: formData.packageId,
        eventType: formData.eventType,
        eventDate: formData.date.toISOString(),
        city: formData.city,
        venue: formData.venue,
        notes: formData.notes
      }
    }, {
      onSuccess: () => {
        toast.success("Booking request sent!");
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to submit booking request");
      }
    });
  };

  const selectedPackageData = packages?.find(p => p.id === formData.packageId);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Book {photographer?.displayName}</h1>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-muted-foreground">
            <span className={cn("px-3 py-1 rounded-full", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted")}>1. Details</span>
            <div className="h-px w-8 bg-border"></div>
            <span className={cn("px-3 py-1 rounded-full", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted")}>2. Package</span>
            <div className="h-px w-8 bg-border"></div>
            <span className={cn("px-3 py-1 rounded-full", step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted")}>3. Confirm</span>
          </div>
        </div>

        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          {step === 1 && (
            <div className="p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Type</label>
                  <Select value={formData.eventType} onValueChange={(v) => setFormData({...formData, eventType: v})}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="party">Party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({...formData, date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    placeholder="E.g. New York" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Venue (Optional)</label>
                  <Input 
                    placeholder="E.g. The Plaza Hotel" 
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Notes / Vision</label>
                  <Textarea 
                    placeholder="Tell the photographer about your vision, mood, and specific requirements..." 
                    className="min-h-[100px]"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleNext} disabled={!formData.eventType || !formData.date || !formData.city}>
                  Continue to Packages <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Select a Package</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages?.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className={cn(
                      "border rounded-xl p-5 cursor-pointer transition-all hover:border-primary/50",
                      formData.packageId === pkg.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
                    )}
                    onClick={() => setFormData({...formData, packageId: pkg.id})}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{pkg.name}</h4>
                      <span className="font-bold text-lg">${pkg.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                    <ul className="text-sm space-y-2 mb-4">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> {pkg.duration} hours coverage</li>
                    </ul>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!formData.packageId}>
                  Review Booking <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Review & Confirm</h2>
              <div className="bg-muted/30 rounded-xl p-6 mb-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Booking Summary</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Photographer</dt><dd className="font-medium">{photographer?.displayName}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Event Type</dt><dd className="font-medium capitalize">{formData.eventType}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{formData.date ? format(formData.date, "PPP") : ""}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{formData.venue ? `${formData.venue}, ` : ""}{formData.city}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Package</dt><dd className="font-medium">{selectedPackageData?.name}</dd></div>
                </dl>
                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-lg font-bold">
                  <span>Total Total</span>
                  <span>${selectedPackageData?.price || 0}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={createBooking.isPending} size="lg">
                  {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
