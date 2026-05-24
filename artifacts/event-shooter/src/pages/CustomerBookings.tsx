import { Navbar } from "@/components/layout/Navbar";
import { DashboardSidebar } from "@/components/layout/Sidebar";
import { useListBookings } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomerBookings() {
  const { data: bookings, isLoading } = useListBookings({
    query: {
      queryKey: ["bookings", "customer"] as any,
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-serif font-bold tracking-tight">My Bookings</h1>
            
            {isLoading ? (
              <div>Loading...</div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-card rounded-xl p-6 shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{booking.eventType} at {booking.venue || booking.city}</h3>
                      <p className="text-muted-foreground mb-2">{new Date(booking.eventDate).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-sm font-medium">Total: ${booking.totalAmount}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/bookings/${booking.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-dashed">
                <p className="text-muted-foreground">You have no bookings yet.</p>
                <Button className="mt-4" asChild><Link href="/explore">Explore Photographers</Link></Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
