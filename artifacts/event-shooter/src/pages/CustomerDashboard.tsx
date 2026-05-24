import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, CreditCard, Heart, ArrowRight } from "lucide-react";
import { useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function CustomerDashboard() {
  const { user } = useAuth();
  
  const { data: bookings } = useListBookings({
    query: {
      queryKey: getListBookingsQueryKey({ role: "customer" }),
    }
  });

  const pendingCount = bookings?.filter(b => b.status === "pending").length || 0;
  const confirmedCount = bookings?.filter(b => b.status === "confirmed").length || 0;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome back, {user?.name}</h1>
              <p className="text-muted-foreground mt-1">Manage your event bookings and payments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{confirmedCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saved Creatives</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Bookings</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bookings">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              
              <div className="bg-card rounded-xl border shadow-sm">
                {bookings && bookings.length > 0 ? (
                  <div className="divide-y">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-muted rounded-full overflow-hidden">
                            {booking.photographer?.avatarUrl && <img src={booking.photographer.avatarUrl} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium">{booking.photographer?.displayName || 'Photographer'}</p>
                            <p className="text-sm text-muted-foreground capitalize">{booking.eventType} • {new Date(booking.eventDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                            'bg-muted text-muted-foreground'
                          }`}>
                            {booking.status}
                          </span>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/bookings/${booking.id}`}>Details</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No bookings found. <Link href="/explore" className="text-primary hover:underline">Explore photographers</Link> to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
