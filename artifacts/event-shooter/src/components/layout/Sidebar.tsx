import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  CreditCard, 
  Heart, 
  User, 
  Settings,
  Image as ImageIcon,
  Package,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Bell,
  Users,
  Camera,
  Star,
  Tag,
  BarChart3
} from "lucide-react";

export function DashboardSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case "customer":
        return [
          { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
          { href: "/bookings", label: "My Bookings", icon: CalendarCheck },
          { href: "/payments", label: "Payments", icon: CreditCard },
          { href: "/wishlist", label: "Wishlist", icon: Heart },
          { href: "/messages", label: "Messages", icon: MessageSquare },
          { href: "/notifications", label: "Notifications", icon: Bell },
          { href: "/profile", label: "Profile", icon: User },
        ];
      case "photographer":
        return [
          { href: "/photographer/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/photographer/bookings", label: "Bookings", icon: CalendarCheck },
          { href: "/photographer/portfolio", label: "Portfolio", icon: ImageIcon },
          { href: "/photographer/packages", label: "Packages", icon: Package },
          { href: "/photographer/availability", label: "Availability", icon: CalendarDays },
          { href: "/photographer/earnings", label: "Earnings", icon: DollarSign },
          { href: "/messages", label: "Messages", icon: MessageSquare },
          { href: "/notifications", label: "Notifications", icon: Bell },
          { href: "/photographer/profile", label: "Profile Settings", icon: Settings },
        ];
      case "admin":
        return [
          { href: "/admin", label: "Overview", icon: LayoutDashboard },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/photographers", label: "Photographers", icon: Camera },
          { href: "/admin/reviews", label: "Reviews", icon: Star },
          { href: "/admin/coupons", label: "Coupons", icon: Tag },
          { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 border-r bg-muted/10 h-[calc(100vh-4rem)] sticky top-16 hidden md:block overflow-y-auto">
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const isActive = location === link.href || location.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
