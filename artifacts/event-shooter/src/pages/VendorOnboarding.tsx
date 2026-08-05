import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { useUpdatePhotographer, getGetPhotographerQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh", "Lucknow", "Goa", "Udaipur", "Kochi", "Indore", "Bhopal", "Nagpur", "Surat"];
const SPECIALIZATIONS = ["Wedding", "Pre-Wedding", "Corporate", "Fashion", "Party", "Birthday", "Drone Aerial", "Reel/Short Film", "Engagement", "Maternity", "Commercial", "Bridal Makeup", "HD Makeup", "Party Makeup", "Airbrush Makeup", "DJ", "Decoration", "Catering"];

export default function VendorOnboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const updateMutation = useUpdatePhotographer();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    city: "",
    startingPrice: "",
    specializations: [] as string[],
    whatsappNumber: "",
    yearsOfExperience: "",
  });

  const toggleSpec = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    updateMutation.mutate({
      id: user.id,
      data: {
        displayName: formData.displayName || undefined,
        bio: formData.bio || undefined,
        city: formData.city || undefined,
        startingPrice: formData.startingPrice ? Number(formData.startingPrice) : undefined,
        specializations: formData.specializations.length > 0 ? formData.specializations : undefined,
        whatsappNumber: formData.whatsappNumber || undefined,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
      } as any
    }, {
      onSuccess: () => {
        toast.success("Profile completed successfully!");
        queryClient.invalidateQueries({ queryKey: getGetPhotographerQueryKey(user.id) });
        setLocation("/dashboard");
      },
      onError: () => toast.error("Failed to save profile. Please try again.")
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-3">Complete Your Vendor Profile</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Tell us about your services so customers can find and book you for their next event.</p>
          </div>

          <Card className="shadow-lg border-border/50">
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 sm:p-8 space-y-8">
                {/* Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Studio / Display Name <span className="text-destructive">*</span></Label>
                      <Input id="displayName" required value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} placeholder="e.g. Lenscraft Studios" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                      <Select required value={formData.city} onValueChange={v => setFormData({...formData, city: v})}>
                        <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                        <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About You <span className="text-destructive">*</span></Label>
                    <Textarea id="bio" required rows={4} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Describe your style, experience, and what makes your service unique..." />
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Professional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startingPrice">Starting Price (₹) <span className="text-destructive">*</span></Label>
                      <Input id="startingPrice" type="number" required min={0} value={formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: e.target.value})} placeholder="e.g. 15000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <Input id="yearsOfExperience" type="number" min={0} value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} placeholder="e.g. 5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input id="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} placeholder="e.g. 9876543210" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Specializations <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATIONS.map(spec => {
                        const active = formData.specializations.includes(spec);
                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => toggleSpec(spec)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all border flex items-center gap-1.5 ${
                              active 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-background text-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {active && <Check className="h-3 w-3" />} {spec}
                          </button>
                        );
                      })}
                    </div>
                    {formData.specializations.length === 0 && (
                      <p className="text-xs text-destructive">Please select at least one specialization.</p>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" disabled={updateMutation.isPending || formData.specializations.length === 0}>
                    {updateMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Complete Profile"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
