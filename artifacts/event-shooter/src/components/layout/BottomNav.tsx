import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Search, CalendarPlus, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);

  const dashboardHref = user?.role === "photographer"
    ? "/photographer/dashboard"
    : user?.role === "admin"
    ? "/admin"
    : user
    ? "/dashboard"
    : "/login";

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/wishlist", label: "Saved", icon: Heart },
    { href: dashboardHref, label: user ? "Profile" : "Login", icon: User },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border/50 safe-area-pb">
        <div className="grid grid-cols-5 h-16">
          {links.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href} className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}

          {/* Center Book Button */}
          <div className="flex items-center justify-center -mt-5">
            <button
              onClick={() => setBookingOpen(true)}
              className="h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/40 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 border-4 border-background"
            >
              <CalendarPlus className="h-5 w-5" />
              <span className="text-[9px] font-bold">BOOK</span>
            </button>
          </div>

          {links.slice(2).map(({ href, label, icon: Icon }) => {
            const isActive = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* Bottom padding so content doesn't hide behind nav on mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}
