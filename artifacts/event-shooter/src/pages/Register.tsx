import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, Loader2, CheckCircle } from "lucide-react";
import { useRegister, useUpdatePhotographer, RegisterInputRole } from "@workspace/api-client-react";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh", "Lucknow", "Goa", "Other"];
const SPECIALIZATIONS = ["Wedding", "Pre-Wedding", "Corporate", "Fashion", "Party", "Birthday", "Drone Aerial", "Reel / Short Film", "Engagement", "Maternity", "Commercial"];

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState<RegisterInputRole>("customer");
  const [step, setStep] = useState<"basic" | "photographer" | "done">("basic");
  const [registeredUser, setRegisteredUser] = useState<{ id: number; token: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Basic form
  const [basic, setBasic] = useState({ name: "", email: "", password: "", phone: "" });
  const [basicErrors, setBasicErrors] = useState<Record<string, string>>({});

  // Photographer extra fields
  const [photo, setPhoto] = useState({
    displayName: "", city: "", startingPrice: "", yearsOfExperience: "", bio: "", specializations: [] as string[],
  });

  const registerMutation = useRegister();
  const updatePhotographerMutation = useUpdatePhotographer();

  const validateBasic = () => {
    const e: Record<string, string> = {};
    if (!basic.name.trim() || basic.name.length < 2) e.name = "Name must be at least 2 characters";
    if (!basic.email || !/\S+@\S+\.\S+/.test(basic.email)) e.email = "Valid email required";
    if (!basic.password || basic.password.length < 6) e.password = "Password must be at least 6 characters";
    setBasicErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBasic()) return;
    setLoading(true);
    registerMutation.mutate(
      { data: { name: basic.name, email: basic.email, password: basic.password, phone: basic.phone || undefined, role } },
      {
        onSuccess: (data) => {
          setLoading(false);
          if (role === "photographer") {
            setRegisteredUser({ id: data.user.id, token: data.token });
            login(data.token, data.user);
            setStep("photographer");
          } else {
            login(data.token, data.user);
            toast.success("Account created! Welcome to EventShooter.");
            setLocation("/dashboard");
          }
        },
        onError: (error: any) => {
          setLoading(false);
          toast.error(error?.message || "Registration failed. That email may already be in use.");
        },
      }
    );
  };

  const toggleSpec = (s: string) => {
    setPhoto(p => ({
      ...p,
      specializations: p.specializations.includes(s) ? p.specializations.filter(x => x !== s) : [...p.specializations, s],
    }));
  };

  const handlePhotographerSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredUser) return;
    setLoading(true);
    updatePhotographerMutation.mutate({
      id: registeredUser.id,
      data: {
        displayName: photo.displayName || basic.name,
        bio: photo.bio || undefined,
        city: photo.city || undefined,
        startingPrice: photo.startingPrice ? Number(photo.startingPrice) : undefined,
        specializations: photo.specializations.length > 0 ? photo.specializations : undefined,
      }
    }, {
      onSuccess: () => {
        setLoading(false);
        toast.success("Profile setup complete! Welcome to EventShooter.");
        setLocation("/photographer/dashboard");
      },
      onError: () => {
        setLoading(false);
        toast.error("Profile setup failed, but your account was created. Update your profile from the dashboard.");
        setLocation("/photographer/dashboard");
      },
    });
  };

  const handleSkipSetup = () => {
    toast.success("Account created! Complete your profile from the dashboard to start receiving bookings.");
    setLocation("/photographer/dashboard");
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">You are all set!</h2>
            <p className="text-muted-foreground mb-6">Your account has been created successfully.</p>
            <Button onClick={() => setLocation("/photographer/dashboard")}>Go to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <Card className="w-full max-w-lg shadow-lg border-muted">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            {step === "basic" ? (
              <>
                <CardTitle className="text-2xl font-serif">Create an account</CardTitle>
                <CardDescription>Join EventShooter to book or offer premium event services</CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-serif">Set up your photographer profile</CardTitle>
                <CardDescription>Help customers find you. You can update this anytime from your dashboard.</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {step === "basic" ? (
              <>
                {/* Role Selector */}
                <Tabs value={role} onValueChange={(v) => setRole(v as RegisterInputRole)} className="mb-5">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer">I am a Customer</TabsTrigger>
                    <TabsTrigger value="photographer">I am a Photographer</TabsTrigger>
                  </TabsList>
                </Tabs>

                {role === "photographer" && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-5 text-sm text-muted-foreground">
                    Register your account first, then set up your photographer profile in the next step.
                  </div>
                )}

                <form onSubmit={handleBasicSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" placeholder="Arjun Kapoor" value={basic.name} onChange={e => { setBasic(b => ({ ...b, name: e.target.value })); setBasicErrors(x => ({ ...x, name: "" })); }} className={basicErrors.name ? "border-destructive" : ""} />
                    {basicErrors.name && <p className="text-xs text-destructive">{basicErrors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="arjun@example.com" value={basic.email} onChange={e => { setBasic(b => ({ ...b, email: e.target.value })); setBasicErrors(x => ({ ...x, email: "" })); }} className={basicErrors.email ? "border-destructive" : ""} />
                    {basicErrors.email && <p className="text-xs text-destructive">{basicErrors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" placeholder="At least 6 characters" value={basic.password} onChange={e => { setBasic(b => ({ ...b, password: e.target.value })); setBasicErrors(x => ({ ...x, password: "" })); }} className={basicErrors.password ? "border-destructive" : ""} />
                    {basicErrors.password && <p className="text-xs text-destructive">{basicErrors.password}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+91 98765 43210" value={basic.phone} onChange={e => setBasic(b => ({ ...b, phone: e.target.value }))} />
                  </div>
                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...</> : role === "photographer" ? "Create Account & Set Up Profile" : "Create Account"}
                  </Button>
                </form>

                <div className="mt-5 text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
                </div>
              </>
            ) : (
              /* Photographer Profile Setup */
              <form onSubmit={handlePhotographerSetup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Studio / Display Name</Label>
                  <Input id="displayName" placeholder={`${basic.name} Photography`} value={photo.displayName} onChange={e => setPhoto(p => ({ ...p, displayName: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">This is how customers will see you.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Select value={photo.city} onValueChange={v => setPhoto(p => ({ ...p, city: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="startingPrice">Starting Price (₹)</Label>
                    <Input id="startingPrice" type="number" placeholder="25000" value={photo.startingPrice} onChange={e => setPhoto(p => ({ ...p, startingPrice: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio / About You</Label>
                  <Textarea id="bio" placeholder="Tell customers about your style, experience, and what you specialise in..." rows={3} value={photo.bio} onChange={e => setPhoto(p => ({ ...p, bio: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Specializations (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpec(spec)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${photo.specializations.includes(spec) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Complete Setup"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSkipSetup} disabled={loading}>
                    Skip for now
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">You can complete your profile anytime from the dashboard.</p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
