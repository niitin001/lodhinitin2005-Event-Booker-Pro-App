import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { useLogin, useRegister } from "@workspace/api-client-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ open, onClose, defaultTab = "login" }: AuthModalProps) {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [tab, setTab] = useState<string>(defaultTab);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const [regData, setRegData] = useState({ name: "", email: "", password: "", phone: "" });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!loginData.email) errs.email = "Email required";
    if (!loginData.password || loginData.password.length < 6) errs.password = "At least 6 characters";
    setLoginErrors(errs);
    if (Object.keys(errs).length > 0) return;

    loginMutation.mutate(
      { data: { email: loginData.email, password: loginData.password } },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast.success("Logged in successfully");
          onClose();
          if (data.user.role === "admin") {
            setLocation("/admin");
          } else {
            setLocation("/dashboard");
          }
        },
        onError: (error: any) => {
          toast.error(error?.message || "Invalid email or password");
        },
      }
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!regData.name || regData.name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!regData.email || !/\S+@\S+\.\S+/.test(regData.email)) errs.email = "Valid email required";
    if (!regData.password || regData.password.length < 6) errs.password = "At least 6 characters";
    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;

    registerMutation.mutate(
      { data: { name: regData.name, email: regData.email, password: regData.password, phone: regData.phone || undefined, role: "customer" } },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast.success(`Welcome to EventShooter, ${data.user.name.split(" ")[0]}!`);
          onClose();
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Registration failed. That email may already be in use.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Sign in to EventShooter</DialogTitle>
        <div className="flex flex-col items-center mb-1">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">EventShooter</h2>
          <p className="text-muted-foreground text-sm mt-1">Book or offer premium event services</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="register">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={loginData.email}
                  onChange={e => { setLoginData(d => ({ ...d, email: e.target.value })); setLoginErrors(x => ({ ...x, email: "" })); }}
                  className={loginErrors.email ? "border-destructive" : ""}
                />
                {loginErrors.email && <p className="text-xs text-destructive">{loginErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => { setLoginData(d => ({ ...d, password: e.target.value })); setLoginErrors(x => ({ ...x, password: "" })); }}
                  className={loginErrors.password ? "border-destructive" : ""}
                />
                {loginErrors.password && <p className="text-xs text-destructive">{loginErrors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Logging in...</> : "Log in"}
              </Button>
            </form>
            <p className="text-xs text-center text-muted-foreground mt-4">
              No account?{" "}
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => setTab("register")}>
                Sign up free
              </button>
            </p>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  placeholder="Arjun Kapoor"
                  value={regData.name}
                  onChange={e => { setRegData(d => ({ ...d, name: e.target.value })); setRegErrors(x => ({ ...x, name: "" })); }}
                  className={regErrors.name ? "border-destructive" : ""}
                />
                {regErrors.name && <p className="text-xs text-destructive">{regErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="arjun@example.com"
                  value={regData.email}
                  onChange={e => { setRegData(d => ({ ...d, email: e.target.value })); setRegErrors(x => ({ ...x, email: "" })); }}
                  className={regErrors.email ? "border-destructive" : ""}
                />
                {regErrors.email && <p className="text-xs text-destructive">{regErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={regData.password}
                  onChange={e => { setRegData(d => ({ ...d, password: e.target.value })); setRegErrors(x => ({ ...x, password: "" })); }}
                  className={regErrors.password ? "border-destructive" : ""}
                />
                {regErrors.password && <p className="text-xs text-destructive">{regErrors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="reg-phone"
                  placeholder="+91 98765 43210"
                  value={regData.phone}
                  onChange={e => setRegData(d => ({ ...d, phone: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</> : "Create Account"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By signing up you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline">Terms</a>
                {" & "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </form>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Already have an account?{" "}
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => setTab("login")}>
                Log in
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
