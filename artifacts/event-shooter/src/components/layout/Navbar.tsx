import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Camera, Moon, Sun, Menu, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AuthModal } from "@/components/AuthModal";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const openLogin = () => { setAuthTab("login"); setAuthOpen(true); };
  const openRegister = () => { setAuthTab("register"); setAuthOpen(true); };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Camera className="h-6 w-6" />
              <span className="font-serif text-xl font-bold tracking-tight">EventShooter</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/explore" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Explore</Link>
              <Link href="/ai" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">AI Tools</Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation(dashboardPath)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{user.role === "admin" ? "Admin Dashboard" : "My Dashboard"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="hidden md:inline-flex" onClick={openLogin}>
                Sign in
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/explore" className="text-lg font-medium">Explore</Link>
                  <Link href="/ai" className="text-lg font-medium">AI Tools</Link>
                  <Link href="/pricing" className="text-lg font-medium">Pricing</Link>
                  <Link href="/about" className="text-lg font-medium">About</Link>
                  <Link href="/help" className="text-lg font-medium">Help Center</Link>
                  {!user ? (
                    <>
                      <hr className="my-2" />
                      <button className="text-lg font-medium text-left" onClick={openLogin}>Log in</button>
                      <button className="text-lg font-medium text-left text-primary" onClick={openRegister}>Sign up</button>
                    </>
                  ) : (
                    <>
                      <hr className="my-2" />
                      <Link href={dashboardPath} className="text-lg font-medium">My Dashboard</Link>
                      <button className="text-lg font-medium text-left text-destructive" onClick={handleLogout}>Log out</button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  );
}
