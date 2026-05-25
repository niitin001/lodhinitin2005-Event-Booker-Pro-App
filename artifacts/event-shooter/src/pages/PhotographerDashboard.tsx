import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetPhotographerDashboard,
  getGetPhotographerDashboardQueryKey,
  useListBookings,
  useAcceptBooking,
  useRejectBooking,
  useUpdatePhotographer,
  useGetPhotographer,
  getGetPhotographerQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  IndianRupee, Star, CalendarCheck, Clock, CheckCircle, XCircle,
  User, MapPin, Camera, TrendingUp, Loader2, Bell, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const SPECIALIZATION_OPTIONS = [
  "Wedding", "Pre-Wedding", "Corporate", "Fashion", "Party", "Birthday",
  "Drone Aerial", "Reel / Short Film", "Engagement", "Maternity", "Commercial",
];

export default function PhotographerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboard, isLoading: dashLoading } = useGetPhotographerDashboard(user?.id || 0, {
    query: { enabled: !!user?.id, queryKey: getGetPhotographerDashboardQueryKey(user?.id || 0) }
  });

  const { data: photographer, isLoading: profLoading } = useGetPhotographer(user?.id || 0, {
    query: { enabled: !!user?.id, queryKey: getGetPhotographerQueryKey(user?.id || 0) }
  });

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useListBookings(
    { role: "photographer" } as any,
    { query: { enabled: !!user } }
  );

  const acceptMutation = useAcceptBooking();
  const rejectMutation = useRejectBooking();
  const updateMutation = useUpdatePhotographer();

  // Profile edit state
  const [profile, setProfile] = useState({
    displayName: "", bio: "", city: "", startingPrice: "", specializations: [] as string[],
  });
  const [profileInitialized, setProfileInitialized] = useState(false);

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

  const handleAccept = (id: number) => {
    acceptMutation.mutate({ id }, {
      onSuccess: () => { toast.success("Booking accepted!"); refetchBookings(); },
      onError: () => toast.error("Failed to accept booking."),
    });
  };

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) { toast.error("Please provide a reason for rejection."); return; }
    rejectMutation.mutate({ id, data: { reason: rejectReason } }, {
      onSuccess: () => { toast.success("Booking rejected."); setRejectId(null); setRejectReason(""); refetchBookings(); },
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
        toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: getGetPhotographerQueryKey(user.id) });
      },
      onError: () => toast.error("Failed to update profile."),
    });
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };

  const pendingBookings = bookings?.filter(b => b.status === "pending") || [];
  const activeBookings = bookings?.filter(b => ["confirmed", "pending"].includes(b.status)) || [];
  const allBookings = bookings || [];

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                  {photographer?.displayName ? `Welcome, ${photographer.displayName.split(" ")[0]}` : "Photographer Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-1">Manage your bookings, portfolio, and earnings.</p>
              </div>
              {pendingBookings.length > 0 && (
                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-2 text-sm text-yellow-800 dark:text-yellow-300">
                  <Bell className="h-4 w-4" />
                  <span className="font-medium">{pendingBookings.length} pending booking request{pendingBookings.length > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8 w-full sm:w-auto flex overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings" className="relative">
                  Bookings
                  {pendingBookings.length > 0 && (
                    <span className="ml-1.5 bg-yellow-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{pendingBookings.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              </TabsList>

              {/* ── OVERVIEW ── */}
              <TabsContent value="overview">
                {dashLoading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[
                        { icon: Clock, label: "Pending Requests", value: dashboard?.pendingBookings || 0, color: "text-yellow-600" },
                        { icon: CalendarCheck, label: "Upcoming Events", value: dashboard?.confirmedBookings || 0, color: "text-green-600" },
                        { icon: IndianRupee, label: "Total Earnings", value: `₹${(dashboard?.totalEarnings || 0).toLocaleString("en-IN")}`, color: "text-blue-600" },
                        { icon: Star, label: "Avg. Rating", value: dashboard?.rating ? dashboard.rating.toFixed(1) : "N/A", color: "text-orange-500" },
                      ].map(({ icon: Icon, label, value, color }) => (
                        <Card key={label}>
                          <CardContent className="p-5">
                            <Icon className={`h-5 w-5 mb-3 ${color}`} />
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{label}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Recent Bookings */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                          <CardTitle>Recent Booking Requests</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab("bookings")}>View all</Button>
                        </CardHeader>
                        <CardContent>
                          {dashboard?.recentBookings && dashboard.recentBookings.length > 0 ? (
                            <div className="space-y-4">
                              {dashboard.recentBookings.slice(0, 5).map((b) => (
                                <div key={b.id} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{b.eventType}</p>
                                    <p className="text-sm text-muted-foreground">{b.city} · {new Date(b.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColor[b.status] || ""}`}>{b.status}</span>
                                    <p className="font-semibold mt-1 text-sm">₹{b.totalAmount?.toLocaleString("en-IN")}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p>No bookings yet. Keep your profile updated to attract customers!</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2.5">
                          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("profile")}>
                            <User className="h-4 w-4" /> Edit Profile
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("bookings")}>
                            <CalendarCheck className="h-4 w-4" /> View Bookings
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2" asChild>
                            <a href={`/photographers/${user?.id}`} target="_blank" rel="noopener noreferrer">
                              <Camera className="h-4 w-4" /> View My Profile
                            </a>
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => refetchBookings()}>
                            <RefreshCw className="h-4 w-4" /> Refresh Data
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Profile Summary */}
                    {photographer && (
                      <Card className="mt-6">
                        <CardHeader><CardTitle>Your Profile Summary</CardTitle></CardHeader>
                        <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Display Name</p>
                            <p className="font-medium">{photographer.displayName || <span className="text-muted-foreground italic">Not set</span>}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">City</p>
                            <p className="font-medium flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{photographer.city || <span className="text-muted-foreground italic">Not set</span>}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Starting Price</p>
                            <p className="font-medium">₹{photographer.startingPrice?.toLocaleString("en-IN") || <span className="text-muted-foreground italic">Not set</span>}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rating</p>
                            <p className="font-medium flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />{photographer.rating?.toFixed(1)} ({photographer.totalReviews} reviews)</p>
                          </div>
                          {photographer.specializations && photographer.specializations.length > 0 && (
                            <div className="sm:col-span-2 md:col-span-4">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Specializations</p>
                              <div className="flex flex-wrap gap-1.5">
                                {photographer.specializations.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                              </div>
                            </div>
                          )}
                          {!photographer.city || !photographer.bio || !photographer.startingPrice ? (
                            <div className="sm:col-span-2 md:col-span-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 flex-shrink-0" />
                              Your profile is incomplete. <Button variant="link" className="p-0 h-auto text-yellow-700 dark:text-yellow-300 font-medium" onClick={() => setActiveTab("profile")}>Complete it now</Button> to get more bookings.
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ── BOOKINGS ── */}
              <TabsContent value="bookings">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold">Booking Requests</h2>
                  <Button variant="outline" size="sm" onClick={() => refetchBookings()}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                  </Button>
                </div>

                {bookingsLoading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : allBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                      <h3 className="font-semibold text-lg mb-1">No bookings yet</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">Complete your profile and keep it updated. Customers discover photographers through the Explore page.</p>
                      <Button className="mt-4" onClick={() => setActiveTab("profile")}>Complete Profile</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {allBookings.map((b) => (
                      <Card key={b.id} className={b.status === "pending" ? "border-yellow-300 dark:border-yellow-700" : ""}>
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold">{b.eventType}</h3>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[b.status] || ""}`}>{b.status}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(b.eventDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {b.city}
                              </p>
                              {b.notes && <p className="text-sm text-muted-foreground italic">"{b.notes}"</p>}
                              {b.customer && (
                                <p className="text-sm mt-2 font-medium">Customer: {b.customer.name} {b.customer.phone ? `· ${b.customer.phone}` : ""}</p>
                              )}
                              {b.rejectionReason && <p className="text-xs text-red-600 mt-1">Rejection reason: {b.rejectionReason}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                              <p className="font-bold text-lg">₹{b.totalAmount?.toLocaleString("en-IN") || "TBD"}</p>
                              {b.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAccept(b.id)}
                                    disabled={acceptMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {acceptMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setRejectId(b.id)}
                                    disabled={rejectMutation.isPending}
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reject reason input */}
                          {rejectId === b.id && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                              <Label htmlFor="rejectReason" className="text-sm font-medium">Reason for rejection (required)</Label>
                              <Textarea
                                id="rejectReason"
                                placeholder="e.g. Already booked on this date, outside service area..."
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" variant="destructive" onClick={() => handleReject(b.id)} disabled={rejectMutation.isPending}>
                                  {rejectMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                                  Confirm Rejection
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>Cancel</Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── PROFILE SETTINGS ── */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Edit Your Profile</CardTitle>
                    <p className="text-sm text-muted-foreground">A complete profile gets 3x more bookings. Fill in all details.</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profLoading ? (
                      <div className="flex items-center justify-center h-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" placeholder="Arjun Kapoor Studios" value={profile.displayName} onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="Mumbai" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="startingPrice">Starting Price (₹)</Label>
                          <Input id="startingPrice" type="number" placeholder="25000" value={profile.startingPrice} onChange={e => setProfile(p => ({ ...p, startingPrice: e.target.value }))} />
                          <p className="text-xs text-muted-foreground">This appears on your profile card in search results.</p>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="bio">Bio / About You</Label>
                          <Textarea id="bio" placeholder="Describe your style, experience, and what makes you unique..." rows={4} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                        </div>

                        <div className="space-y-2">
                          <Label>Specializations (select all that apply)</Label>
                          <div className="flex flex-wrap gap-2">
                            {SPECIALIZATION_OPTIONS.map(spec => (
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

                        <div className="pt-2">
                          <Button onClick={handleProfileSave} disabled={updateMutation.isPending} size="lg">
                            {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Profile"}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
