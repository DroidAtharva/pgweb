import { useState, useEffect } from "react";
import { Home, Building2, Users, DollarSign, Bell, Settings, LogOut, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const OwnerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-gradient">PG CONNECT</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="glass-button" onClick={() => navigate('/owner/list-property')}>
                <Plus className="w-4 h-4 mr-2" />
                List Property
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="sm" className="glass-card" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 slide-up">
          <h1 className="text-4xl font-bold mb-2">Dashboard Overview 📊</h1>
          <p className="text-muted-foreground text-lg">Manage your properties and tenants</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Building2, title: "Total Properties", value: "8", change: "+2 this month", color: "text-primary" },
            { icon: Users, title: "Active Tenants", value: "45", change: "95% occupancy", color: "text-secondary" },
            { icon: DollarSign, title: "Monthly Revenue", value: "₹5.4L", change: "+12% from last month", color: "text-accent" },
            { icon: TrendingUp, title: "Growth", value: "+18%", change: "Year over year", color: "text-primary" },
          ].map((stat, index) => (
            <Card
              key={index}
              className="glass-card bounce-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-sm text-green-600 font-semibold">{stat.change}</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Properties List */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Properties</CardTitle>
              <Button variant="outline" className="glass-card">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Sunshine Residency", location: "Downtown", rooms: 12, occupied: 10, revenue: "₹1.2L" },
                { name: "Green Valley PG", location: "Sector 15", rooms: 8, occupied: 8, revenue: "₹96K" },
                { name: "Royal Apartments", location: "City Center", rooms: 15, occupied: 13, revenue: "₹1.5L" },
              ].map((property, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 group-hover:scale-105 transition-transform" />
                  <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{property.location}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{property.occupied}/{property.rooms} Occupied</span>
                    <span className="font-semibold text-primary">{property.revenue}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tenant: "Rahul Sharma", property: "Sunshine Residency", room: "204", date: "Today" },
                  { tenant: "Priya Patel", property: "Green Valley PG", room: "102", date: "Yesterday" },
                  { tenant: "Amit Kumar", property: "Royal Apartments", room: "301", date: "2 days ago" },
                ].map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/40 dark:bg-white/5">
                    <div>
                      <p className="font-semibold">{booking.tenant}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.property} - Room {booking.room}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">{booking.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tenant: "Neha Singh", amount: "₹12,000", status: "Paid", date: "Jan 1" },
                  { tenant: "Vikas Reddy", amount: "₹15,000", status: "Pending", date: "Due Jan 5" },
                  { tenant: "Anjali Gupta", amount: "₹10,000", status: "Overdue", date: "Dec 31" },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/40 dark:bg-white/5">
                    <div>
                      <p className="font-semibold">{payment.tenant}</p>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{payment.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === "Paid" ? "bg-green-500/20 text-green-600" :
                        payment.status === "Pending" ? "bg-yellow-500/20 text-yellow-600" :
                        "bg-red-500/20 text-red-600"
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
