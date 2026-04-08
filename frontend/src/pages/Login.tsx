import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, getUserRole } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  
  // Get return URL from query params
  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get('returnTo');

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      getUserRole(user.id).then((role) => {
        if (returnTo) {
          navigate(returnTo);
        } else if (role === 'tenant') {
          navigate('/tenant/dashboard');
        } else if (role === 'owner') {
          navigate('/owner/dashboard');
        }
      });
    }
  }, [user, navigate, getUserRole, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

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
        const role = await getUserRole(data.user.id);
        
        if (!role) {
          toast({
            title: "Database Setup Required",
            description: "Please run the database_migration.sql script first. Check SETUP_INSTRUCTIONS.md for details.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });

        // Navigate based on return URL or role
        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo);
          } else {
            navigate(role === 'tenant' ? '/tenant/dashboard' : '/owner/dashboard');
          }
        }, 500);
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
            <CardTitle className="text-3xl font-bold text-gradient">Welcome Back</CardTitle>
            <CardDescription>Sign in to your PG CONNECT account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
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
              </div>

              <Button type="submit" className="w-full glass-button h-12 text-lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
