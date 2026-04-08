import { useState } from "react";
import { useEffect } from "react";
import{getBackendData} from "@/lib/api"
import { Link } from "react-router-dom";
import { Search, MapPin, Home, Users, Shield, Star, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-pg.jpg";
import { useToast } from "@/hooks/use-toast";

interface LandingProps {
  sidebarOpen?: boolean;
}

const Landing = ({ sidebarOpen }: LandingProps) => {
  useEffect(() => {
  getBackendData().then(data => console.log(data));
}, []);
  const [location, setLocation] = useState("");
  const { toast } = useToast();

  const features = [
    {
      icon: Search,
      title: "Easy Search",
      description: "Find your perfect PG with advanced filters and location-based search",
    },
    {
      icon: Shield,
      title: "Verified Properties",
      description: "All properties are verified for safety and quality standards",
    },
    {
      icon: Users,
      title: "Connect Instantly",
      description: "Direct communication between tenants and property owners",
    },
    {
      icon: Star,
      title: "Trusted Reviews",
      description: "Real reviews from verified tenants to help you decide",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/properties?location=${encodeURIComponent(location)}`;
  };

  const handleSearchNearMe = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.location.href = `/properties?lat=${latitude}&lon=${longitude}`;
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast({
            title: "Error",
            description: "Could not get your location. Please ensure you have location services enabled and try again.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar sidebarOpen={sidebarOpen} />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden parallax-section pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-110"
          style={{
            backgroundImage: `url(${heroImage})`,
            transform: `translateY(calc(var(--scroll) * 0.5px))`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 slide-up">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Find Your Perfect
              <span className="block text-gradient">PG Accommodation</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified property owners and discover comfortable living spaces tailored to your needs
            </p>

            <form
              onSubmit={handleSearch}
              className="glass-card rounded-2xl p-2 max-w-2xl mx-auto flex flex-col md:flex-row gap-2 bounce-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter city, locality, or landmark..."
                  className="pl-12 pr-14 h-14 text-lg border-0 bg-transparent focus-visible:ring-0"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSearchNearMe}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10"
                  aria-label="Search near me"
                >
                  <Crosshair className="text-muted-foreground w-5 h-5" />
                </Button>
              </div>
              <Button type="submit" size="lg" className="glass-button h-14 px-8">
                <Search className="w-5 h-5 mr-2" />
                Search Properties
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center bounce-in" style={{ animationDelay: "0.4s" }}>
              <Link to="/signup?role=tenant">
                <Button size="lg" className="glass-button text-lg px-8 py-6">
                  I'm Looking for PG
                </Button>
              </Link>
              <Link to="/signup?role=owner">
                <Button size="lg" variant="outline" className="glass-card text-lg px-8 py-6">
                  List My Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-gradient">PG CONNECT</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience seamless property management with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 hover:scale-105 transition-transform duration-300 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-6">
                  <feature.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10K+", label: "Happy Tenants" },
              { number: "5K+", label: "Verified Properties" },
              { number: "500+", label: "Property Owners" },
            ].map((stat, index) => (
              <div key={index} className="glass-card rounded-2xl p-8">
                <div className="text-5xl font-bold text-gradient mb-2">{stat.number}</div>
                <div className="text-xl text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied tenants and property owners on PG CONNECT today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="glass-button text-lg px-8 py-6">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/properties">
                <Button size="lg" variant="outline" className="glass-card text-lg px-8 py-6">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-gradient">PG CONNECT</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted partner for finding the perfect PG accommodation
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Tenants</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/properties" className="hover:text-primary transition-colors">Search Properties</Link></li>
                <li><Link to="/signup?role=tenant" className="hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Owners</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/signup?role=owner" className="hover:text-primary transition-colors">List Property</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Owner Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PG CONNECT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
