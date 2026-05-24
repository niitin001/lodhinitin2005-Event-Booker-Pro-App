import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { Users, Camera, DollarSign, CalendarCheck } from "lucide-react";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">Platform Admin</h1>
              <p className="text-muted-foreground mt-1">Overview of platform metrics and activities.</p>
            </div>

            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{dashboard?.totalUsers || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Photographers</CardTitle>
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{dashboard?.totalPhotographers || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{dashboard?.totalBookings || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Platform Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">${dashboard?.totalRevenue?.toLocaleString() || 0}</div>
                    </CardContent>
                  </Card>
                </div>

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
                      <CardTitle>Top Photographers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboard?.topPhotographers && dashboard.topPhotographers.length > 0 ? (
                        <div className="space-y-4">
                          {dashboard.topPhotographers.map((p) => (
                            <div key={p.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-full overflow-hidden">
                                  {p.avatarUrl && <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                  <p className="font-medium">{p.displayName}</p>
                                  <p className="text-sm text-muted-foreground">{p.city}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold">★ {p.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No photographers found.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
