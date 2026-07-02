import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useListBookings,
  useAcceptBooking,
  useRejectBooking,
  useGetPhotographer,
  useUpdatePhotographer,
  getGetPhotographerQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck, Clock, CheckCircle, Camera, Search, MapPin,
  Star, IndianRupee, User, Loader2, ArrowRight, XCircle,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh", "Lucknow", "Goa", "Other"];
const SPECIALIZATIONS = ["Wedding", "Pre-Wedding", "Corporate", "Fashion", "Party", "Birthday", "Drone Aerial", "Reel / Short Film", "Engagement", "Maternity", "Commercial", "Bridal Makeup", "HD Makeup", "Party Makeup", "Airbrush Makeup"];

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [profile, setProfile] = useState({
    displayName: "", bio: "", city: "", startingPrice: "", specializations: [] as string[],
  });

  const { data: myBookings, isLoading: myBookingsLoading } = useListBookings(
    undefined,
    { query: { queryKey: ["bookings", "as-customer"] as any, enabled: !!user } }
  );

  const { data: receivedBookings, isLoading: receivedLoading, refetch: refetchReceived } = useListBookings(
    { as: "photographer" } as any,
    { query: { queryKey: ["bookings", "as-vendor"] as any, enabled: !!user } }
  );

  const { data: photographer } = useGetPhotographer(user?.id || 0, {
    query: { enabled: !!user?.id, queryKey: getGetPhotographerQueryKey(user?.id || 0) }
  });

  if (photographer && !profileInitialized) {
    setProfile({
      displayName: photographer.displayName || "",
      bio: photographer.bio || "",
      city: photographer.city || "",
      startingPrice: photographer.startingPrice?.toString() || "",
      specializations: photographer.specializations || [],
    });
    setProfileInitialized(true);
  }

  const acceptMutation = useAcceptBooking();
  const rejectMutation = useRejectBooking();
  const updateMutation = useUpdatePhotographer();

  const pendingCount   = myBookings?.filter(b => b.status === "pending").length ?? 0;
  const confirmedCount = myBookings?.filter(b => b.status === "confirmed").length ?? 0;
  const completedCount = myBookings?.filter(b => b.status === "completed").length ?? 0;
  const incomingPending = receivedBookings?.filter(b => b.status === "pending").length ?? 0;

  const handleAccept = (id: number) => {
    acceptMutation.mutate({ id }, {
      onSuccess: () => { toast.success("Booking accepted!"); refetchReceived(); },
      onError: () => toast.error("Failed to accept booking."),
    });
  };

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) { toast.error("Please provide a reason."); return; }
    rejectMutation.mutate({ id, data: { reason: rejectReason } }, {
      onSuccess: () => { toast.success("Booking rejected."); setRejectId(null); setRejectReason(""); refetchReceived(); },
      onError: () => toast.error("Failed to reject booking."),
    });
  };

  const toggleSpec = (spec: string) => {
    setProfile(p => ({
      ...p,
      specializations: p.specializations.includes(spec)
        ? p.specializations.filter(s => s !== spec)
        : [...p.specializations, spec],
    }));
  };

  const handleProfileSave = () => {
    if (!user?.id) return;
    updateMutation.mutate({
      id: user.id,
      data: {
        displayName: profile.displayName || undefined,
        bio: profile.bio || undefined,
        city: profile.city || undefined,
        startingPrice: profile.startingPrice ? Number(profile.startingPrice) : undefined,
        specializations: profile.specializations.length > 0 ? profile.specializations : undefined,
      }
    }, {
      onSuccess: () => {
        toast.success("Profile saved!");
        queryClient.invalidateQueries({ queryKey: getGetPhotographerQueryKey(user.id) });
      },
      onError: () => toast.error("Failed to save profile."),
    });
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                Welcome, {firstName}
              </h1>
              <p className="text-muted-foreground mt-1">Your bookings, requests, and profile — all in one place.</p>
            </div>
            <Button onClick={() => setLocation("/explore")} className="sm:flex-shrink-0">
              <Search className="h-4 w-4 mr-2" /> Find Vendors
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Clock,         label: "My Pending",    value: pendingCount,   color: "text-yellow-600" },
              { icon: CalendarCheck, label: "My Upcoming",   value: confirmedCount, color: "text-green-600" },
              { icon: CheckCircle,   label: "Completed",     value: completedCount, color: "text-blue-600" },
              { icon: Star,          label: "Requests In",   value: incomingPending, color: "text-amber-500" },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-4 sm:p-5">
                  <Icon className={`h-5 w-5 mb-2 ${color}`} />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main tabs */}
          <Tabs defaultValue="my-bookings">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 mb-4">
              <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Requests
                {incomingPending > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {incomingPending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="quick" className="hidden sm:block">Quick Actions</TabsTrigger>
            </TabsList>

            {/* MY BOOKINGS */}
            <TabsContent value="my-bookings">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Bookings I Made</CardTitle>
                  <p className="text-sm text-muted-foreground">Events you have booked with vendors.</p>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {myBookingsLoading ? (
                    <div className="space-y-3 px-5 pb-5">
                      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                    </div>
                  ) : !myBookings?.length ? (
                    <div className="text-center py-12 px-5">
                      <Camera className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No bookings yet. Explore vendors to get started!</p>
                      <Button onClick={() => setLocation("/explore")}>Explore Vendors</Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {myBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-muted/30 cursor-pointer"
                          onClick={() => setLocation(`/photographers/${booking.photographerId}`)}
                        >
                          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {booking.photographer?.coverImageUrl || booking.photographer?.avatarUrl ? (
                              <img src={booking.photographer.coverImageUrl || booking.photographer.avatarUrl || ""} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="h-4 w-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{booking.photographer?.displayName || "Vendor"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 flex-shrink-0" />{booking.eventType} · {booking.city}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(booking.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <Badge className={`${STATUS_COLOR[booking.status] || ""} border-0 capitalize text-xs`}>
                              {booking.status}
                            </Badge>
                            <p className="text-sm font-bold">₹{booking.totalAmount?.toLocaleString("en-IN") || "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* REQUESTS RECEIVED */}
            <TabsContent value="requests">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Booking Requests for Me</CardTitle>
                  <p className="text-sm text-muted-foreground">Customers who want to book your services.</p>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {receivedLoading ? (
                    <div className="space-y-3 px-5 pb-5">
                      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                    </div>
                  ) : !receivedBookings?.length ? (
                    <div className="text-center py-12 px-5">
                      <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-2">No booking requests yet.</p>
                      <p className="text-sm text-muted-foreground mb-4">Complete your profile and get discovered by customers!</p>
                      <Button variant="outline" onClick={() => document.querySelector('[data-value="profile"]')?.dispatchEvent(new MouseEvent("click"))}>
                        Set Up My Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {receivedBookings.map(booking => (
                        <div key={booking.id} className="px-4 sm:px-5 py-4">
                          {rejectId === booking.id ? (
                            <div className="space-y-3">
                              <p className="text-sm font-medium">Reason for rejection</p>
                              <Input
                                placeholder="Enter reason..."
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" variant="destructive" onClick={() => handleReject(booking.id)} disabled={rejectMutation.isPending}>
                                  Confirm Reject
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{booking.customer?.name || "Customer"}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" />{booking.eventType} · {booking.city}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(booking.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                                {booking.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">"{booking.notes}"</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Badge className={`${STATUS_COLOR[booking.status] || ""} border-0 capitalize text-xs`}>
                                  {booking.status}
                                </Badge>
                                <p className="text-sm font-bold">₹{booking.totalAmount?.toLocaleString("en-IN") || "—"}</p>
                                {booking.status === "pending" && (
                                  <div className="flex gap-1.5">
                                    <Button
                                      size="sm"
                                      className="h-7 px-2.5 text-xs"
                                      onClick={() => handleAccept(booking.id)}
                                      disabled={acceptMutation.isPending}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2.5 text-xs text-destructive border-destructive/30"
                                      onClick={() => setRejectId(booking.id)}
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MY PROFILE */}
            <TabsContent value="profile">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">My Vendor Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Set up your profile to be discoverable and receive bookings.
                    {photographer && !photographer.isApproved && (
                      <span className="ml-2 text-amber-600 font-medium">(Pending admin approval)</span>
                    )}
                    {photographer?.isApproved && (
                      <span className="ml-2 text-green-600 font-medium">(Approved — visible in search)</span>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Display Name / Studio Name</Label>
                      <Input
                        placeholder={user?.name || "Your Studio Name"}
                        value={profile.displayName}
                        onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Select value={profile.city} onValueChange={v => setProfile(p => ({ ...p, city: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                        <SelectContent>
                          {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Starting Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 15000"
                      value={profile.startingPrice}
                      onChange={e => setProfile(p => ({ ...p, startingPrice: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>About / Bio</Label>
                    <Textarea
                      placeholder="Tell customers about your services, experience, and style..."
                      rows={3}
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Services / Specializations</Label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATIONS.map(spec => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpec(spec)}
                          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                            profile.specializations.includes(spec)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleProfileSave} disabled={updateMutation.isPending} className="mt-2">
                    {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Profile"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    After saving, your profile will be reviewed by our team before appearing in search results.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* QUICK ACTIONS */}
            <TabsContent value="quick">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Search, label: "Explore Vendors", desc: "Browse 2,400+ verified professionals", href: "/explore", primary: true },
                  { icon: CalendarCheck, label: "All Bookings", desc: "Track all your booking requests", href: "/bookings", primary: false },
                  { icon: IndianRupee, label: "AI Cost Estimator", desc: "Estimate your event budget", href: "/ai", primary: false },
                ].map(({ icon: Icon, label, desc, href, primary }) => (
                  <Card key={label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(href)}>
                    <CardContent className="p-5 flex gap-4 items-start">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${primary ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
      <Footer />
    </div>
  );
}
