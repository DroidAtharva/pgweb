import { useState, useEffect } from "react";
import { CreditCard, MessageSquare, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import TenantLayout from "@/components/TenantLayout";

const TenantDashboard = () => {
  const { user } = useAuth();
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

  const firstName = profile?.full_name?.split(' ')[0] || 'Tenant';
  
  return (
    <TenantLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 slide-up">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {firstName}! 👋</h1>
          <p className="text-muted-foreground text-lg">Here's your rental overview</p>
        </div>

        {/* Current Property Card */}
        <Card className="glass-card mb-8 bounce-in">
          <CardHeader>
            <CardTitle>Current Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg" />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Sunshine Residency - Room 204</h3>
                  <p className="text-muted-foreground">123 Main Street, Downtown Area</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="text-xl font-bold text-primary">₹12,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Due</p>
                    <p className="text-xl font-bold">5 Days</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="glass-button">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Rent
                  </Button>
                  <Button variant="outline" className="glass-card">
                    <FileText className="w-4 h-4 mr-2" />
                    View Lease
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: CreditCard, title: "Payment History", desc: "View all transactions", color: "text-primary" },
            { icon: MessageSquare, title: "Message Owner", desc: "Contact landlord", color: "text-secondary" },
            { icon: FileText, title: "Maintenance", desc: "Submit requests", color: "text-accent" },
            { icon: Bell, title: "Notifications", desc: "3 new alerts", color: "text-primary" },
          ].map((action, index) => (
            <Card
              key={index}
              className="glass-card hover:scale-105 transition-transform duration-300 cursor-pointer group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <action.icon className={`w-10 h-10 ${action.color} group-hover:scale-110 transition-transform`} />
                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "Jan 1, 2024", amount: "₹12,000", status: "Paid" },
                  { date: "Dec 1, 2023", amount: "₹12,000", status: "Paid" },
                  { date: "Nov 1, 2023", amount: "₹12,000", status: "Paid" },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/40 dark:bg-white/5">
                    <div>
                      <p className="font-semibold">{payment.date}</p>
                      <p className="text-sm text-muted-foreground">{payment.amount}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { issue: "AC Repair", status: "In Progress", date: "2 days ago" },
                  { issue: "Water Leakage", status: "Completed", date: "1 week ago" },
                  { issue: "Light Fixture", status: "Submitted", date: "3 days ago" },
                ].map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/40 dark:bg-white/5">
                    <div>
                      <p className="font-semibold">{request.issue}</p>
                      <p className="text-sm text-muted-foreground">{request.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      request.status === "Completed" ? "bg-green-500/20 text-green-600" :
                      request.status === "In Progress" ? "bg-yellow-500/20 text-yellow-600" :
                      "bg-blue-500/20 text-blue-600"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantLayout>
  );
};

export default TenantDashboard;
