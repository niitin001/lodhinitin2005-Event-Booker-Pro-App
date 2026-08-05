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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  useListBookings,
  useAcceptBooking,
  useRejectBooking,
  useGetPhotographer,
  useUpdatePhotographer,
  getGetPhotographerQueryKey,
  useGetWishlist,
  getGetWishlistQueryKey,
  useGetPortfolio,
  getGetPortfolioQueryKey,
  useAddPortfolioItem,
  useCreateReview
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck, Clock, CheckCircle, Camera, Search, MapPin,
  Star, IndianRupee, User, Loader2, ArrowRight, XCircle, Heart, Plus, FileVideo
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

  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<number>>(new Set());
  const createReviewMutation = useCreateReview();

  const [portfolioMediaUrl, setPortfolioMediaUrl] = useState("");
  const [portfolioMediaType, setPortfolioMediaType] = useState("photo");
  const [portfolioCaption, setPortfolioCaption] = useState("");
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const addPortfolioMutation = useAddPortfolioItem();

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

  const { data: wishlist } = useGetWishlist(user?.id || 0, {
    query: { enabled: !!user?.id, queryKey: getGetWishlistQueryKey(user?.id || 0) }
  });

  const { data: portfolio } = useGetPortfolio(photographer?.id || 0, {
    query: { enabled: !!photographer?.id, queryKey: getGetPortfolioQueryKey(photographer?.id || 0) }
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

  const handleReviewSubmit = () => {
    if (!reviewBooking) return;
    createReviewMutation.mutate({
      data: {
        photographerId: reviewBooking.photographerId,
        bookingId: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment
      } as any
    }, {
      onSuccess: () => {
        toast.success("Review submitted!");
        setReviewedBookingIds(prev => new Set(prev).add(reviewBooking.id));
        setReviewBooking(null);
        setReviewComment("");
        setReviewRating(5);
      },
      onError: () => toast.error("Failed to submit review.")
    });
  };

  const handlePortfolioSubmit = () => {
    if (!photographer?.id || !portfolioMediaUrl.trim()) return;
    addPortfolioMutation.mutate({
      id: photographer.id,
      data: {
        mediaUrl: portfolioMediaUrl,
        mediaType: portfolioMediaType,
        caption: portfolioCaption
      } as any
    }, {
      onSuccess: () => {
        toast.success("Portfolio item added!");
        queryClient.invalidateQueries({ queryKey: getGetPortfolioQueryKey(photographer.id) });
        setIsPortfolioDialogOpen(false);
        setPortfolioMediaUrl("");
        setPortfolioCaption("");
      },
      onError: () => toast.error("Failed to add portfolio item.")
    });
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

          {user?.role === "photographer" && photographer && (!photographer.displayName || !photographer.city) && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-primary">Complete your vendor profile</h3>
                <p className="text-sm text-muted-foreground mt-1">You need to complete your profile before you can be discovered by customers.</p>
              </div>
              <Button onClick={() => setLocation("/onboarding")} className="shrink-0">Complete Profile</Button>
            </div>
          )}

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
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4">
              <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Requests
                {incomingPending > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {incomingPending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
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
                            {booking.status === "completed" && !reviewedBookingIds.has(booking.id) && (
                              <Button size="sm" variant="outline" className="h-7 text-xs px-2 mt-1" onClick={(e) => { e.stopPropagation(); setReviewBooking(booking); }}>
                                Leave Review
                              </Button>
                            )}
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

            {/* SAVED TAB */}
            <TabsContent value="saved">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Saved Vendors</CardTitle>
                  <p className="text-sm text-muted-foreground">Vendors you have added to your wishlist.</p>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {!wishlist?.length ? (
                    <div className="text-center py-12 px-5">
                      <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
                      <Button onClick={() => setLocation("/explore")}>Explore Vendors</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                      {wishlist.map((photographer: any) => (
                        <div
                          key={photographer.id}
                          className="border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
                          onClick={() => setLocation(`/photographers/${photographer.id}`)}
                        >
                          <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                            <img src={photographer.coverImageUrl || "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                            <div className="absolute top-2 right-2 bg-background/90 text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" /> {photographer.rating?.toFixed(1) || "New"}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm truncate">{photographer.displayName}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {photographer.city}
                            </p>
                            <p className="text-xs font-bold mt-2">Starts at ₹{photographer.startingPrice?.toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MY PROFILE */}
            <TabsContent value="profile" className="space-y-4">
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

              {user?.role === "photographer" && (
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">My Portfolio</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Showcase your best work to potential clients.</p>
                    </div>
                    <Button size="sm" onClick={() => setIsPortfolioDialogOpen(true)} className="shrink-0"><Plus className="h-4 w-4 mr-1"/> Add Item</Button>
                  </CardHeader>
                  <CardContent>
                    {!portfolio?.length ? (
                      <div className="text-center py-10 border border-dashed rounded-lg">
                        <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">No portfolio items added yet.</p>
                        <Button variant="outline" size="sm" onClick={() => setIsPortfolioDialogOpen(true)}>Add your first photo/video</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {portfolio.map((item: any) => (
                          <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted border">
                            <img src={item.mediaUrl} alt={item.caption} className="w-full h-full object-cover" />
                            {item.mediaType === "video" && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <FileVideo className="h-8 w-8 text-white opacity-80" />
                              </div>
                            )}
                            {item.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                                <p className="text-[10px] text-white font-medium truncate">{item.caption}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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

      {/* Leave Review Dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={(o) => !o && setReviewBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium">How was your experience?</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                    <Star className={`h-8 w-8 transition-colors ${reviewRating >= star ? "fill-yellow-500 text-yellow-500" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Your Comment</Label>
              <Textarea 
                placeholder="Share details about the service, quality, and your overall experience..."
                rows={4}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewBooking(null)}>Cancel</Button>
            <Button onClick={handleReviewSubmit} disabled={createReviewMutation.isPending || !reviewComment.trim()}>
              {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Portfolio Dialog */}
      <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Portfolio Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Media URL</Label>
              <Input 
                placeholder="https://example.com/image.jpg"
                value={portfolioMediaUrl}
                onChange={e => setPortfolioMediaUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Media Type</Label>
              <Select value={portfolioMediaType} onValueChange={setPortfolioMediaType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Caption (Optional)</Label>
              <Input 
                placeholder="e.g. Traditional Wedding Ceremony"
                value={portfolioCaption}
                onChange={e => setPortfolioCaption(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPortfolioDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePortfolioSubmit} disabled={addPortfolioMutation.isPending || !portfolioMediaUrl.trim()}>
              {addPortfolioMutation.isPending ? "Adding..." : "Add to Portfolio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
