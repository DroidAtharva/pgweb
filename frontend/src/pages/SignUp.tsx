import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Home, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user, getUserRole } = useAuth();
  const returnTo = searchParams.get('returnTo');
  const [role, setRole] = useState<'tenant' | 'owner'>((searchParams.get("role") as 'tenant' | 'owner') || "tenant");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      getUserRole(user.id).then((userRole) => {
        if (returnTo) {
          navigate(returnTo);
        } else if (userRole === 'tenant') {
          navigate('/tenant/dashboard');
        } else if (userRole === 'owner') {
          navigate('/owner/dashboard');
        }
      });
    }
  }, [user, navigate, getUserRole, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        role
      );

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Account created!",
          description: `Welcome to PG CONNECT as a ${role}. You can now log in.`,
        });

        // Navigate to login with returnTo parameter if present
        setTimeout(() => {
          if (returnTo) {
            navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          } else {
            navigate("/login");
          }
        }, 1500);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <Card className="glass-card bounce-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Home className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-gradient">Create Account</CardTitle>
            <CardDescription>Join PG CONNECT and find your perfect space</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I am a</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'tenant' | 'owner')} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="tenant" id="tenant" className="peer sr-only" />
                    <Label
                      htmlFor="tenant"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-white/40 dark:bg-white/5 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                    >
                      <span className="font-semibold">Tenant</span>
                      <span className="text-xs text-muted-foreground">Looking for PG</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="owner" id="owner" className="peer sr-only" />
                    <Label
                      htmlFor="owner"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-white/40 dark:bg-white/5 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                    >
                      <span className="font-semibold">Owner</span>
                      <span className="text-xs text-muted-foreground">List property</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/60 dark:bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/60 dark:bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/60 dark:bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/60 dark:bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-white/60 dark:bg-white/5"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full glass-button h-12 text-lg" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
