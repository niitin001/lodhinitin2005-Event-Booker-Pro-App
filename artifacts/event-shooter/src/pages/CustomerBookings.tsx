import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListBookings } from "@workspace/api-client-react";
import {
  CalendarCheck, MapPin, Camera, Loader2,
  Clock, CheckCircle, XCircle, ArrowRight, Star,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending:   { label: "Pending",   class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  confirmed: { label: "Confirmed", class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",   icon: CheckCircle },
  rejected:  { label: "Rejected",  class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",           icon: XCircle },
  cancelled: { label: "Cancelled", class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",          icon: XCircle },
  completed: { label: "Completed", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",       icon: CheckCircle },
};

const TABS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function CustomerBookings() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("All");

  const { data: bookings, isLoading } = useListBookings(undefined, {
    query: { queryKey: ["bookings", "customer"] as any }
  });

  const filtered = (bookings || []).filter(b => {
    if (activeTab === "All") return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">My Bookings</h1>
              <p className="text-muted-foreground mt-1">Track all your event bookings and their status.</p>
            </div>

            {/* Tab Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tab}
                  {tab !== "All" && bookings && (
                    <span className="ml-1.5 opacity-70">
                      ({bookings.filter(b => b.status.toLowerCase() === tab.toLowerCase()).length})
                    </span>
                  )}
                  {tab === "All" && bookings && (
                    <span className="ml-1.5 opacity-70">({bookings.length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-card border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-dashed">
                <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <h3 className="font-semibold text-lg mb-1">
                  {activeTab === "All" ? "No bookings yet" : `No ${activeTab.toLowerCase()} bookings`}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-5">
                  {activeTab === "All"
                    ? "Book a photographer for your event and it will appear here."
                    : `You have no ${activeTab.toLowerCase()} bookings at the moment.`}
                </p>
                {activeTab === "All" && (
                  <Button onClick={() => setLocation("/explore")}>
                    Find Photographers <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(booking => {
                  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  return (
                    <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Photographer Image */}
                          <div className="h-32 sm:h-auto sm:w-28 bg-muted flex-shrink-0 overflow-hidden">
                            {booking.photographer?.coverImageUrl || booking.photographer?.avatarUrl ? (
                              <img
                                src={booking.photographer.coverImageUrl || booking.photographer.avatarUrl || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="h-8 w-8 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <h3 className="font-semibold text-base">
                                  {booking.photographer?.displayName || "Photographer"}
                                </h3>
                                <p className="text-sm text-muted-foreground capitalize font-medium">
                                  {booking.eventType}
                                </p>
                              </div>
                              <Badge className={`${status.class} border-0 flex items-center gap-1 text-xs`}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarCheck className="h-3.5 w-3.5" />
                                {new Date(booking.eventDate).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "long", year: "numeric"
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {booking.venue ? `${booking.venue}, ` : ""}{booking.city}
                              </span>
                            </div>

                            {booking.rejectionReason && (
                              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded px-2 py-1">
                                Reason: {booking.rejectionReason}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-2 border-t gap-2 flex-wrap">
                              <div>
                                <span className="text-xs text-muted-foreground">Amount</span>
                                <p className="font-bold">₹{booking.totalAmount?.toLocaleString("en-IN") || "—"}</p>
                              </div>
                              <div className="flex gap-2">
                                {booking.status === "completed" && (
                                  <Button size="sm" variant="outline" className="gap-1">
                                    <Star className="h-3.5 w-3.5" /> Rate
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setLocation(`/photographers/${booking.photographerId}`)}
                                >
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Book More CTA */}
            {!isLoading && filtered.length > 0 && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={() => setLocation("/explore")}>
                  Book Another Event <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
