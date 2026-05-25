import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Explore from "@/pages/Explore";
import PhotographerProfile from "@/pages/PhotographerProfile";
import BookingFlow from "@/pages/BookingFlow";
import CustomerDashboard from "@/pages/CustomerDashboard";
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
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, role }: { component: any, role?: "customer" | "photographer" | "admin" }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  return (
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
      
      {/* Protected - Customer */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={CustomerDashboard} role="customer" />}
      </Route>
      <Route path="/bookings">
        {() => <ProtectedRoute component={CustomerBookings} role="customer" />}
      </Route>
      <Route path="/book/:photographerId">
        {() => <ProtectedRoute component={BookingFlow} role="customer" />}
      </Route>

      {/* Protected - Photographer */}
      <Route path="/photographer/dashboard">
        {() => <ProtectedRoute component={PhotographerDashboard} role="photographer" />}
      </Route>

      {/* Protected - Admin */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} role="admin" />}
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
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
