import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, Heart, ArrowRight, Camera,
  Clock, CheckCircle, Star, MapPin, Search,
} from "lucide-react";
import { useListBookings } from "@workspace/api-client-react";

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: bookings, isLoading } = useListBookings(undefined, {
    query: { queryKey: ["bookings", "customer-dashboard"] as any }
  });

  const pendingCount   = bookings?.filter(b => b.status === "pending").length   || 0;
  const confirmedCount = bookings?.filter(b => b.status === "confirmed").length || 0;
  const completedCount = bookings?.filter(b => b.status === "completed").length || 0;
  const recent         = bookings?.slice(0, 5) || [];

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                  Welcome, {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-muted-foreground mt-1">Manage your event bookings and payments.</p>
              </div>
              <Button onClick={() => setLocation("/explore")} className="sm:flex-shrink-0">
                <Search className="h-4 w-4 mr-2" /> Find Vendors
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Clock, label: "Pending", value: pendingCount, color: "text-yellow-600" },
                { icon: CalendarCheck, label: "Upcoming", value: confirmedCount, color: "text-green-600" },
                { icon: CheckCircle, label: "Completed", value: completedCount, color: "text-blue-600" },
                { icon: Heart, label: "Saved", value: 0, color: "text-red-500" },
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

            {/* Recent Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/bookings")}>
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {isLoading ? (
                  <div className="space-y-3 px-5 pb-5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : recent.length === 0 ? (
                  <div className="text-center py-10 px-5">
                    <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground mb-4">No bookings yet. Explore photographers to get started!</p>
                    <Button onClick={() => setLocation("/explore")}>
                      Explore Photographers
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recent.map(booking => (
                      <div
                        key={booking.id}
                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/photographers/${booking.photographerId}`)}
                      >
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {booking.photographer?.avatarUrl || booking.photographer?.coverImageUrl ? (
                            <img
                              src={booking.photographer.coverImageUrl || booking.photographer.avatarUrl || ""}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {booking.photographer?.displayName || "Photographer"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {booking.eventType} · {booking.city}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(booking.eventDate).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Search, label: "Find Photographers", desc: "Browse 2,400+ verified professionals", href: "/explore", primary: true },
                { icon: CalendarCheck, label: "My Bookings", desc: "Track all your booking requests", href: "/bookings", primary: false },
                { icon: Star, label: "AI Tools", desc: "Estimate cost, get recommendations", href: "/ai", primary: false },
              ].map(({ icon: Icon, label, desc, href, primary }) => (
                <Card
                  key={label}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => setLocation(href)}
                >
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
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
