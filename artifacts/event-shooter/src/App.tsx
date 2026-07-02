import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";

import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/layout/BottomNav";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Explore from "@/pages/Explore";
import PhotographerProfile from "@/pages/PhotographerProfile";
import BookingFlow from "@/pages/BookingFlow";
import UnifiedDashboard from "@/pages/UnifiedDashboard";
import CustomerBookings from "@/pages/CustomerBookings";
import PhotographerDashboard from "@/pages/PhotographerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AIHub from "@/pages/AIHub";
import CategoryPage from "@/pages/CategoryPage";
import PublicBooking from "@/pages/PublicBooking";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import HelpCenter from "@/pages/HelpCenter";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function RequireAuth({ component: Component, role }: { component: any; role?: "customer" | "photographer" | "admin" }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Redirect to="/login" />;
  if (role && user.role !== role) {
    // Redirect to the right dashboard instead of blocking entirely
    if (user.role === "photographer") return <Redirect to="/photographer/dashboard" />;
    if (user.role === "admin") return <Redirect to="/admin" />;
    return <Redirect to="/dashboard" />;
  }
  return <Component />;
}

function RequireAnyAuth({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <>
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/photographers/:id" component={PhotographerProfile} />
      <Route path="/ai" component={AIHub} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/book" component={PublicBooking} />

      {/* Info Pages */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* Auth */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Dashboard — all authenticated users */}
      <Route path="/dashboard">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>
      <Route path="/bookings">{() => <RequireAnyAuth component={CustomerBookings} />}</Route>

      {/* Booking flow — any logged-in user */}
      <Route path="/book/:photographerId">{() => <RequireAnyAuth component={BookingFlow} />}</Route>

      {/* Photographer legacy routes — redirect to unified dashboard */}
      <Route path="/photographer/dashboard">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>
      <Route path="/photographer/bookings">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>
      <Route path="/photographer/portfolio">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>
      <Route path="/photographer/packages">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>
      <Route path="/photographer/availability">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>
      <Route path="/photographer/earnings">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>
      <Route path="/photographer/profile">{() => <RequireAnyAuth component={UnifiedDashboard} />}</Route>

      {/* Admin */}
      <Route path="/admin">{() => <RequireAuth component={AdminDashboard} role="admin" />}</Route>

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
    <BottomNav />
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
