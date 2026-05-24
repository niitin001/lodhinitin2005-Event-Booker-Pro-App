import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPhotographerDashboard, getGetPhotographerDashboardQueryKey } from "@workspace/api-client-react";
import { Button } from "react-day-picker";

export default function PhotographerDashboard() {
  const { user } = useAuth();
  
  const { data: dashboard, isLoading } = useGetPhotographerDashboard(user?.id || 0, {
    query: {
      enabled: !!user?.id,
      queryKey: getGetPhotographerDashboardQueryKey(user?.id || 0),
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">Studio Overview</h1>
              <p className="text-muted-foreground mt-1">Manage your bookings, portfolio, and earnings.</p>
            </div>

            {isLoading ? (
              <div>Loading stats...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboard?.pendingBookings || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboard?.confirmedBookings || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${dashboard?.totalEarnings?.toLocaleString() || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboard?.rating?.toFixed(1) || "N/A"}</div>
                    <p className="text-xs text-muted-foreground">{dashboard?.totalReviews || 0} reviews</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.recentBookings && dashboard.recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {dashboard.recentBookings.map((b) => (
                        <div key={b.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{b.eventType} ({b.city})</p>
                            <p className="text-sm text-muted-foreground">{new Date(b.eventDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-muted uppercase">{b.status}</span>
                            <p className="font-semibold mt-1">${b.totalAmount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No recent bookings.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">Update Portfolio</Button>
                  <Button variant="outline" className="w-full justify-start">Manage Availability</Button>
                  <Button variant="outline" className="w-full justify-start">Edit Packages</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
