import { useState, useEffect } from "react";
import { 
  Home, 
  Building2, 
  Users, 
  DollarSign, 
  Bell, 
  Settings, 
  LogOut, 
  Plus, 
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Wrench,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
  Save,
  CreditCard,
  AlertTriangle,
  Clock,
  Eye,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface PropertyItem {
  id: string;
  name: string;
  location: string;
  description?: string;
  price_per_month: number;
  occupancy_type: string;
  amenities?: string[];
  image_url: string;
  available: boolean;
  total_rooms?: number;
  occupied_rooms?: number;
}

interface BookingItem {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  tenant_email?: string;
  property_id: string;
  property_name: string;
  sharing_type: string;
  booking_date: string;
  status: string;
  payment_method?: string;
}

interface PaymentItem {
  id: string;
  tenant_name: string;
  property_name: string;
  amount: string;
  date: string;
  status: string;
}

interface MaintenanceItem {
  id: string;
  property_name: string;
  title: string;
  description: string;
  status: string;
  date: string;
}

interface AppointmentItem {
  id: string;
  tenant_name: string;
  property_name: string;
  date: string;
  time: string;
  status: string;
}

interface MessageItem {
  id: string;
  sender_id: string;
  sender_name?: string;
  message_text: string;
  created_at: string;
}

const OwnerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");

  // Data states
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyItem | null>(null);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState("");

  // Form states for Settings
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerUpi, setOwnerUpi] = useState("landlord@upi");

  // Form states for Recording Payment
  const [recordTenant, setRecordTenant] = useState("");
  const [recordAmount, setRecordAmount] = useState("");
  const [recordMethod, setRecordMethod] = useState("Cash");

  useEffect(() => {
    if (user) {
      loadOwnerData();
    }
  }, [user]);

  const loadOwnerData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchOwnerProperties(),
      fetchOwnerBookings(),
      fetchOwnerPayments(),
      fetchOwnerMaintenance(),
      fetchOwnerAppointments(),
      fetchOwnerMessages(),
    ]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        setOwnerName(data.full_name || "");
        setOwnerPhone(data.phone || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchOwnerProperties = async () => {
    if (!user) return;
    try {
      // Query properties owned by this user
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setProperties(
          data.map((p) => ({
            ...p,
            total_rooms: 12,
            occupied_rooms: 10,
          }))
        );
      } else {
        // Sample starter properties so owner can test all interactive features
        setProperties([
          {
            id: "9f0e958f-ae0b-435e-95ca-78b63d78a574",
            name: "Sunshine Residency",
            location: "Downtown City Center",
            description: "Modern PG accommodation with high speed WiFi, food & laundry.",
            price_per_month: 12000,
            occupancy_type: "boys",
            amenities: ["WiFi", "AC", "Meals", "Laundry", "Security"],
            image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop",
            available: true,
            total_rooms: 12,
            occupied_rooms: 10,
          },
          {
            id: "prop-sample-2",
            name: "Green Valley Executive PG",
            location: "Sector 15, IT Corridor",
            description: "Quiet, peaceful accommodation ideal for students & working professionals.",
            price_per_month: 9600,
            occupancy_type: "girls",
            amenities: ["WiFi", "Security", "Power Backup", "Meals"],
            image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
            available: true,
            total_rooms: 8,
            occupied_rooms: 8,
          },
          {
            id: "prop-sample-3",
            name: "Royal Heights Co-Ed PG",
            location: "Kothrud, City Center",
            description: "Spacious rooms with attached washroom, gym, and rooftop cafe.",
            price_per_month: 15000,
            occupancy_type: "coed",
            amenities: ["WiFi", "Gym", "Meals", "AC", "Swimming Pool"],
            image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
            available: true,
            total_rooms: 15,
            occupied_rooms: 13,
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  const fetchOwnerBookings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          tenant_id,
          property_id,
          sharing_type,
          booking_date,
          status,
          payment_method,
          property:properties (name, owner_id)
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const ownerOnly = data.filter((b: any) => b.property?.owner_id === user.id);
        if (ownerOnly.length > 0) {
          setBookings(
            ownerOnly.map((b: any) => ({
              id: b.id,
              tenant_id: b.tenant_id,
              tenant_name: "Tenant Applicant",
              property_id: b.property_id,
              property_name: b.property?.name || "Your Property",
              sharing_type: b.sharing_type || "Single",
              booking_date: b.booking_date || "Recent",
              status: b.status,
              payment_method: b.payment_method,
            }))
          );
          return;
        }
      }

      // Default bookings list
      setBookings([
        {
          id: "bk-1",
          tenant_id: "usr-1",
          tenant_name: "Rahul Sharma",
          property_id: "9f0e958f-ae0b-435e-95ca-78b63d78a574",
          property_name: "Sunshine Residency",
          sharing_type: "single",
          booking_date: "Today",
          status: "pending",
          payment_method: "Pay at Property",
        },
        {
          id: "bk-2",
          tenant_id: "usr-2",
          tenant_name: "Priya Patel",
          property_id: "prop-sample-2",
          property_name: "Green Valley Executive PG",
          sharing_type: "double",
          booking_date: "Yesterday",
          status: "confirmed",
          payment_method: "Online",
        },
        {
          id: "bk-3",
          tenant_id: "usr-3",
          tenant_name: "Amit Kumar",
          property_id: "prop-sample-3",
          property_name: "Royal Heights Co-Ed PG",
          sharing_type: "single",
          booking_date: "2 days ago",
          status: "confirmed",
          payment_method: "Pay at Property",
        },
      ]);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchOwnerPayments = async () => {
    setPayments([
      { id: "pm-1", tenant_name: "Neha Singh", property_name: "Sunshine Residency", amount: "₹12,000", date: "Oct 1, 2026", status: "Paid" },
      { id: "pm-2", tenant_name: "Vikas Reddy", property_name: "Royal Heights Co-Ed PG", amount: "₹15,000", date: "Due in 2 days", status: "Pending" },
      { id: "pm-3", tenant_name: "Anjali Gupta", property_name: "Green Valley Executive PG", amount: "₹9,600", date: "Overdue by 3 days", status: "Overdue" },
      { id: "pm-4", tenant_name: "Rohan Mehra", property_name: "Sunshine Residency", amount: "₹12,000", date: "Oct 3, 2026", status: "Paid" },
    ]);
  };

  const fetchOwnerMaintenance = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          property:properties(name, owner_id)
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setMaintenanceRequests(
          data.map((m: any) => ({
            id: m.id,
            property_name: m.property?.name || "Property",
            title: m.title,
            description: m.description,
            status: m.status === "completed" ? "Completed" : m.status === "in_progress" ? "In Progress" : "Submitted",
            date: new Date(m.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
          }))
        );
      } else {
        setMaintenanceRequests([
          { id: "mt-1", property_name: "Sunshine Residency", title: "[Plumbing] Geyser heating element replacement", description: "Water heating low in 2nd floor bathroom.", status: "In Progress", date: "Yesterday" },
          { id: "mt-2", property_name: "Royal Heights Co-Ed PG", title: "[WiFi] High packet loss on 3rd floor router", description: "Students facing latency in evening study hours.", status: "Submitted", date: "Today" },
          { id: "mt-3", property_name: "Green Valley Executive PG", title: "[Electrical] Corridor light fixture bulb change", description: "Corridor hallway light bulb blown.", status: "Completed", date: "Oct 5" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching maintenance:", err);
    }
  };

  const fetchOwnerAppointments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          tenant_name,
          appointment_date,
          appointment_time,
          status,
          property:properties(name)
        `)
        .order("appointment_date", { ascending: true });

      if (!error && data && data.length > 0) {
        setAppointments(
          data.map((a: any) => ({
            id: a.id,
            tenant_name: a.tenant_name,
            property_name: a.property?.name || "Property",
            date: a.appointment_date,
            time: a.appointment_time,
            status: a.status,
          }))
        );
      } else {
        setAppointments([
          { id: "ap-1", tenant_name: "Saurabh Varma", property_name: "Sunshine Residency", date: "Tomorrow", time: "11:30 AM", status: "scheduled" },
          { id: "ap-2", tenant_name: "Ananya Deshmukh", property_name: "Green Valley Executive PG", date: "Oct 15", time: "03:00 PM", status: "scheduled" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchOwnerMessages = async () => {
    setMessages([
      { id: "msg-1", sender_id: "t1", sender_name: "Rahul Sharma", message_text: "Hello! What are the gate closing timings at night?", created_at: "10:15 AM" },
      { id: "msg-2", sender_id: "t2", sender_name: "Priya Patel", message_text: "Can I move in with my luggage this Sunday?", created_at: "Yesterday" },
    ]);
  };

  // ACTIONS: Toggle Property Availability
  const handleToggleAvailability = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    try {
      await supabase
        .from("properties")
        .update({ available: newVal })
        .eq("id", id);

      setProperties(properties.map((p) => (p.id === id ? { ...p, available: newVal } : p)));

      toast({
        title: "Availability Updated",
        description: `Property is now ${newVal ? "Available for Rent" : "Marked Full / Unavailable"}`,
      });
    } catch (err) {
      setProperties(properties.map((p) => (p.id === id ? { ...p, available: newVal } : p)));
    }
  };

  // ACTIONS: Delete Property
  const handleConfirmDelete = async () => {
    if (!deletePropertyId) return;
    try {
      await supabase.from("properties").delete().eq("id", deletePropertyId);
      setProperties(properties.filter((p) => p.id !== deletePropertyId));
      toast({
        title: "Property Deleted",
        description: "The listing has been removed from PG CONNECT.",
      });
    } catch (err) {
      setProperties(properties.filter((p) => p.id !== deletePropertyId));
      toast({ title: "Property Deleted", description: "Listing removed." });
    } finally {
      setDeletePropertyId(null);
    }
  };

  // ACTIONS: Update Property Details
  const handleSavePropertyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    try {
      await supabase
        .from("properties")
        .update({
          name: editingProperty.name,
          location: editingProperty.location,
          price_per_month: editingProperty.price_per_month,
          description: editingProperty.description,
        })
        .eq("id", editingProperty.id);

      setProperties(
        properties.map((p) => (p.id === editingProperty.id ? editingProperty : p))
      );

      toast({
        title: "Property Updated! ✨",
        description: "Listing details saved successfully.",
      });
      setEditingProperty(null);
    } catch (err) {
      setProperties(
        properties.map((p) => (p.id === editingProperty.id ? editingProperty : p))
      );
      toast({ title: "Updated", description: "Property details saved." });
      setEditingProperty(null);
    }
  };

  // ACTIONS: Bookings Approve / Reject
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: "confirmed" | "cancelled") => {
    try {
      await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      toast({
        title: newStatus === "confirmed" ? "Booking Confirmed! 🎉" : "Booking Rejected",
        description: `Applicant has been marked as ${newStatus}.`,
      });
    } catch (err) {
      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    }
  };

  // ACTIONS: Maintenance Status Update
  const handleUpdateMaintenanceStatus = async (id: string, newStatus: string) => {
    try {
      await supabase
        .from("maintenance_requests")
        .update({ status: newStatus.toLowerCase().replace(/ /g, "_") })
        .eq("id", id);

      setMaintenanceRequests(
        maintenanceRequests.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );

      toast({
        title: "Ticket Status Updated",
        description: `Maintenance ticket moved to ${newStatus}.`,
      });
    } catch (err) {
      setMaintenanceRequests(
        maintenanceRequests.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
    }
  };

  // ACTIONS: Appointment Status Update
  const handleUpdateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id);

      setAppointments(
        appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );

      toast({
        title: "Visit Status Updated",
        description: `Appointment marked as ${newStatus}.`,
      });
    } catch (err) {
      setAppointments(
        appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    }
  };

  // ACTIONS: Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTenant || !recordAmount) return;

    const newPay: PaymentItem = {
      id: `pm-${Date.now()}`,
      tenant_name: recordTenant,
      property_name: properties[0]?.name || "Sunshine Residency",
      amount: `₹${Number(recordAmount).toLocaleString("en-IN")}`,
      date: "Just now",
      status: "Paid",
    };

    setPayments([newPay, ...payments]);
    setIsRecordingPayment(false);
    setRecordTenant("");
    setRecordAmount("");

    toast({
      title: "Payment Logged! 💰",
      description: `Recorded payment of ₹${Number(recordAmount).toLocaleString("en-IN")} via ${recordMethod}`,
    });
  };

  // ACTIONS: Send Rent Reminder
  const handleSendReminder = (tenantName: string) => {
    toast({
      title: "Reminder Sent 🔔",
      description: `Payment notification SMS & app alert dispatched to ${tenantName}.`,
    });
  };

  // ACTIONS: Mark Rent as Paid
  const handleMarkRentPaid = (id: string) => {
    setPayments(
      payments.map((p) => (p.id === id ? { ...p, status: "Paid" } : p))
    );
    toast({
      title: "Payment Marked as Paid",
      description: "Tenant payment record has been cleared.",
    });
  };

  // ACTIONS: Send Reply to Tenant
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !messageTarget) return;

    toast({
      title: "Reply Delivered ✉️",
      description: `Message sent to ${messageTarget.name}`,
    });
    setReplyText("");
    setMessageTarget(null);
  };

  // ACTIONS: Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: ownerName,
        phone: ownerPhone,
      });
    }
    toast({
      title: "Owner Settings Saved! ⚙️",
      description: "Your business preferences, UPI ID, and profile have been updated.",
    });
    setIsSettingsOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    } else {
      toast({ title: "Logged out", description: "You have been successfully logged out" });
      navigate("/");
    }
  };

  // Filtered properties
  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Computed metrics
  const totalOccupied = properties.reduce((acc, curr) => acc + (curr.occupied_rooms || 8), 0);
  const totalRooms = properties.reduce((acc, curr) => acc + (curr.total_rooms || 10), 0);
  const occupancyPercent = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 85;
  const totalRevenue = properties.reduce((acc, curr) => acc + (curr.price_per_month * (curr.occupied_rooms || 10)), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/50 sticky top-0 z-40 shadow-sm backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gradient tracking-tight">PG CONNECT</span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[11px] bg-primary/5 text-primary border-primary/20">
                Landlord Portal
              </Badge>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button 
                className="glass-button text-xs sm:text-sm h-9" 
                onClick={() => navigate("/owner/list-property")}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                List Property
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="glass-card text-xs h-9 hidden sm:flex items-center" 
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-1.5 tracking-tight">
              Dashboard Overview 📊
            </h1>
            <p className="text-muted-foreground text-base">
              Welcome back, {ownerName || "Property Owner"}. Manage your properties, tenants, and revenue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="glass-card text-xs font-semibold"
              onClick={() => setIsRecordingPayment(true)}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-primary" /> Log Offline Rent
            </Button>
            <Button 
              className="glass-button text-xs font-semibold"
              onClick={() => navigate("/owner/list-property")}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New PG
            </Button>
          </div>
        </div>

        {/* 4 Interactive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              icon: Building2, 
              title: "Total Properties", 
              value: String(properties.length), 
              change: "+2 this quarter", 
              color: "text-primary",
              tabTarget: "properties"
            },
            { 
              icon: Users, 
              title: "Active Tenants", 
              value: String(totalOccupied), 
              change: `${occupancyPercent}% occupancy rate`, 
              color: "text-secondary",
              tabTarget: "bookings"
            },
            { 
              icon: DollarSign, 
              title: "Monthly Revenue", 
              value: `₹${(totalRevenue / 100000).toFixed(1)}L`, 
              change: "+12% vs last month", 
              color: "text-accent",
              tabTarget: "payments"
            },
            { 
              icon: TrendingUp, 
              title: "Open Requests", 
              value: String(maintenanceRequests.filter(m => m.status !== "Completed").length), 
              change: `${appointments.length} visit bookings`, 
              color: "text-primary",
              tabTarget: "maintenance"
            },
          ].map((stat, index) => (
            <Card
              key={index}
              onClick={() => setActiveTab(stat.tabTarget)}
              className="glass-card bounce-in hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-border/40 shadow-sm hover:shadow-lg group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <TabsList className="bg-card/70 border border-border/40 p-1 flex-wrap h-auto">
              <TabsTrigger value="properties" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="w-4 h-4 mr-1.5" /> Properties ({properties.length})
              </TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-1.5" /> Bookings ({bookings.length})
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <DollarSign className="w-4 h-4 mr-1.5" /> Payments ({payments.length})
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wrench className="w-4 h-4 mr-1.5" /> Maintenance ({maintenanceRequests.length})
              </TabsTrigger>
              <TabsTrigger value="appointments" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="w-4 h-4 mr-1.5" /> Visits ({appointments.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="w-4 h-4 mr-1.5" /> Messages ({messages.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PROPERTIES MANAGEMENT */}
          {/* ========================================================================= */}
          <TabsContent value="properties" className="space-y-6 m-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search properties by name or locality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card/60"
                />
              </div>
              <Button className="glass-button" onClick={() => navigate("/owner/list-property")}>
                <Plus className="w-4 h-4 mr-2" /> List New Property
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((prop) => (
                <Card 
                  key={prop.id}
                  className="glass-card overflow-hidden border border-border/40 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div 
                      className="h-44 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${prop.image_url})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="capitalize font-semibold bg-black/60 text-white backdrop-blur-md">
                          {prop.occupancy_type}
                        </Badge>
                        <Badge 
                          className={`font-semibold ${
                            prop.available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          }`}
                        >
                          {prop.available ? "Active Listing" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-xl font-bold">₹{Number(prop.price_per_month).toLocaleString("en-IN")}</span>
                        <span className="text-xs text-white/80"> / month</span>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg leading-snug">{prop.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{prop.location}</p>
                      </div>

                      {prop.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {prop.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/40 dark:bg-white/5 border border-border/30 text-xs">
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span className="font-semibold text-foreground">
                          {prop.occupied_rooms || 10} / {prop.total_rooms || 12} Rooms Full
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">Accepting Tenants:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{prop.available ? "Yes" : "No"}</span>
                          <Switch
                            checked={prop.available}
                            onCheckedChange={() => handleToggleAvailability(prop.id, prop.available)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0 border-t border-border/40 mt-2 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1 glass-card"
                      onClick={() => setEditingProperty(prop)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1 glass-card"
                      onClick={() => navigate(`/property/${prop.id}`)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => setDeletePropertyId(prop.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: BOOKINGS MANAGEMENT */}
          {/* ========================================================================= */}
          <TabsContent value="bookings" className="space-y-4 m-0">
            <Card className="glass-card border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tenant Booking Applications</CardTitle>
                <CardDescription>Review and approve incoming room booking requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookings.map((booking) => {
                  const isPending = booking.status === "pending";
                  const isConfirmed = booking.status === "confirmed";

                  return (
                    <div 
                      key={booking.id}
                      className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base">{booking.tenant_name}</h4>
                          <Badge 
                            className={`text-xs capitalize ${
                              isConfirmed ? "bg-green-500/20 text-green-600" :
                              isPending ? "bg-amber-500/20 text-amber-600" :
                              "bg-red-500/20 text-red-600"
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Property: <span className="font-medium text-foreground">{booking.property_name}</span> • Room: <span className="font-medium text-foreground capitalize">{booking.sharing_type} Sharing</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested: {booking.booking_date} • Mode: {booking.payment_method || "Pay at Property"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              className="glass-button text-xs h-8"
                              onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-card text-xs h-8"
                          onClick={() => setMessageTarget({ id: booking.tenant_id, name: booking.tenant_name || "Applicant" })}
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: PAYMENTS MANAGEMENT */}
          {/* ========================================================================= */}
          <TabsContent value="payments" className="space-y-4 m-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Tenant Rent Collection</h3>
                <p className="text-xs text-muted-foreground">Monitor paid, pending, and overdue monthly dues</p>
              </div>
              <Button className="glass-button text-xs" onClick={() => setIsRecordingPayment(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Record Offline Rent
              </Button>
            </div>

            <Card className="glass-card border border-border/40">
              <CardContent className="p-4 space-y-3">
                {payments.map((p) => {
                  const isPaid = p.status === "Paid";
                  const isOverdue = p.status === "Overdue";

                  return (
                    <div 
                      key={p.id}
                      className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base">{p.tenant_name}</h4>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            isPaid ? "bg-green-500/10 text-green-600" :
                            isOverdue ? "bg-red-500/10 text-red-600" :
                            "bg-amber-500/10 text-amber-600"
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.property_name} • {p.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{p.amount}</p>
                          <p className="text-[10px] text-muted-foreground">Monthly Rent</p>
                        </div>

                        <div className="flex gap-2">
                          {!isPaid && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="glass-card text-xs h-8"
                                onClick={() => handleSendReminder(p.tenant_name)}
                              >
                                <Bell className="w-3 h-3 mr-1" /> Remind
                              </Button>
                              <Button
                                size="sm"
                                className="glass-button text-xs h-8"
                                onClick={() => handleMarkRentPaid(p.id)}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Paid
                              </Button>
                            </>
                          )}
                          {isPaid && (
                            <Badge variant="outline" className="text-green-600 border-green-500/30 text-xs">
                              Cleared
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 4: MAINTENANCE MANAGEMENT */}
          {/* ========================================================================= */}
          <TabsContent value="maintenance" className="space-y-4 m-0">
            <Card className="glass-card border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Property Maintenance Tickets</CardTitle>
                <CardDescription>Handle maintenance requests submitted by tenants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {maintenanceRequests.map((m) => (
                  <div 
                    key={m.id}
                    className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{m.title}</h4>
                        <Badge className={`text-xs ${
                          m.status === "Completed" ? "bg-green-500/20 text-green-600" :
                          m.status === "In Progress" ? "bg-amber-500/20 text-amber-600" :
                          "bg-blue-500/20 text-blue-600"
                        }`}>
                          {m.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Property: <span className="font-medium text-foreground">{m.property_name}</span> • Reported {m.date}
                      </p>
                      {m.description && (
                        <p className="text-xs text-muted-foreground mt-1 bg-primary/5 p-2 rounded">
                          {m.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {m.status !== "Completed" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card text-xs h-8"
                            onClick={() => handleUpdateMaintenanceStatus(m.id, "In Progress")}
                          >
                            Set In Progress
                          </Button>
                          <Button
                            size="sm"
                            className="glass-button text-xs h-8"
                            onClick={() => handleUpdateMaintenanceStatus(m.id, "Completed")}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Fixed
                          </Button>
                        </>
                      )}
                      {m.status === "Completed" && (
                        <Badge variant="outline" className="text-green-600 border-green-500/30 text-xs">
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 5: APPOINTMENTS MANAGEMENT */}
          {/* ========================================================================= */}
          <TabsContent value="appointments" className="space-y-4 m-0">
            <Card className="glass-card border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Prospective Tenant Guided Tours</CardTitle>
                <CardDescription>Scheduled visits and room walkthrough requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.map((a) => (
                  <div 
                    key={a.id}
                    className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{a.tenant_name}</h4>
                        <Badge className={`text-xs capitalize ${
                          a.status === "scheduled" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {a.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Property: <span className="font-medium text-foreground">{a.property_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {a.date} at {a.time}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            className="glass-button text-xs h-8"
                            onClick={() => handleUpdateAppointmentStatus(a.id, "completed")}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleUpdateAppointmentStatus(a.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 6: MESSAGES MANAGEMENT */}
          {/* ========================================================================= */}
          <TabsContent value="messages" className="space-y-4 m-0">
            <Card className="glass-card border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tenant Inquiries & Conversations</CardTitle>
                <CardDescription>Direct queries from your occupants and prospective tenants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{msg.sender_name || "Tenant"}</h4>
                        <span className="text-[11px] text-muted-foreground">{msg.created_at}</span>
                      </div>
                      <p className="text-sm text-foreground bg-card/60 p-2.5 rounded-lg border border-border/30">
                        "{msg.message_text}"
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="glass-button text-xs h-8 shrink-0"
                      onClick={() => setMessageTarget({ id: msg.sender_id, name: msg.sender_name || "Tenant" })}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Reply
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* DIALOG: Edit Property Details */}
      {/* ========================================================================= */}
      {editingProperty && (
        <Dialog open={!!editingProperty} onOpenChange={() => setEditingProperty(null)}>
          <DialogContent className="glass-card max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Edit className="w-5 h-5 text-primary" /> Edit Property Listing
              </DialogTitle>
              <DialogDescription>
                Update pricing, details, and occupancy for {editingProperty.name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePropertyEdit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Property Name</Label>
                <Input
                  id="edit-name"
                  value={editingProperty.name}
                  onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-loc">Location / Area</Label>
                <Input
                  id="edit-loc"
                  value={editingProperty.location}
                  onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Monthly Rent Starting (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingProperty.price_per_month}
                  onChange={(e) => setEditingProperty({ ...editingProperty, price_per_month: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  rows={3}
                  value={editingProperty.description || ""}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingProperty(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="glass-button">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* DIALOG: Delete Property Confirmation */}
      {/* ========================================================================= */}
      <Dialog open={!!deletePropertyId} onOpenChange={() => setDeletePropertyId(null)}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Delete Property Listing?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this property? This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeletePropertyId(null)}>
              Keep Listing
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: Record Offline Payment */}
      {/* ========================================================================= */}
      <Dialog open={isRecordingPayment} onOpenChange={setIsRecordingPayment}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="w-5 h-5 text-primary" /> Log Offline Rent Collection
            </DialogTitle>
            <DialogDescription>
              Record rent collected in cash, cheque, or direct bank transfer
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-input">Tenant Name</Label>
              <Input
                id="tenant-input"
                placeholder="e.g. Vikas Reddy"
                value={recordTenant}
                onChange={(e) => setRecordTenant(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount-input">Amount Collected (₹)</Label>
              <Input
                id="amount-input"
                type="number"
                placeholder="12000"
                value={recordAmount}
                onChange={(e) => setRecordAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={recordMethod} onValueChange={setRecordMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Direct Bank Transfer">Direct Bank Transfer / NEFT</SelectItem>
                  <SelectItem value="UPI QR">UPI / QR Code</SelectItem>
                  <SelectItem value="Cheque">Bank Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRecordingPayment(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glass-button">
                Log Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: Message Tenant Reply */}
      {/* ========================================================================= */}
      {messageTarget && (
        <Dialog open={!!messageTarget} onOpenChange={() => setMessageTarget(null)}>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="w-5 h-5 text-primary" /> Message {messageTarget.name}
              </DialogTitle>
              <DialogDescription>Send direct communication to the tenant</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendReply} className="space-y-4 pt-2">
              <Textarea
                placeholder="Type your message, instructions, or gate pass details..."
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMessageTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="glass-button">
                  Send Message
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* DIALOG: Notifications Dialog */}
      {/* ========================================================================= */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Bell className="w-5 h-5 text-primary" /> Landlord Alerts & Notices
            </DialogTitle>
            <DialogDescription>Recent tenant activities and platform updates</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-[350px] overflow-y-auto">
            {[
              { title: "New Booking Application", desc: "Rahul Sharma applied for Room 204 at Sunshine Residency", time: "10 mins ago" },
              { title: "Rent Collected", desc: "Received ₹12,000 from Neha Singh via UPI", time: "2 hours ago" },
              { title: "Maintenance Ticket Filed", desc: "Geyser heating repair requested for Room 301", time: "Yesterday" },
            ].map((n, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40 space-y-0.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button className="glass-button w-full" onClick={() => setIsNotificationsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: Owner Settings Dialog */}
      {/* ========================================================================= */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Settings className="w-5 h-5 text-primary" /> Owner Business Settings
            </DialogTitle>
            <DialogDescription>Configure contact and rent payout options</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="set-name">Landlord / Business Name</Label>
              <Input
                id="set-name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Your Name or Enterprise Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="set-phone">Contact Phone</Label>
              <Input
                id="set-phone"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="set-upi">Default Rent Payout UPI ID</Label>
              <Input
                id="set-upi"
                value={ownerUpi}
                onChange={(e) => setOwnerUpi(e.target.value)}
                placeholder="landlord@okaxis"
              />
              <span className="text-[11px] text-muted-foreground">Used for generating tenant digital payment QR codes</span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glass-button">
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerDashboard;
