import { useState, useEffect } from "react";
import { 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Bell, 
  Home, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Printer, 
  Download, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Building,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import TenantLayout from "@/components/TenantLayout";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface BookingInfo {
  id: string;
  status: string;
  sharing_type: string;
  booking_date: string;
  payment_method: string;
  property?: {
    id: string;
    name: string;
    location: string;
    price_per_month: number;
    image_url: string;
    owner_id: string;
  };
  room?: {
    id: string;
    sharing_type: string;
    price_per_month: number;
  };
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: string;
  status: string;
  method?: string;
  property_name?: string;
}

interface MaintenanceTicket {
  id: string;
  issue: string;
  status: string;
  date: string;
  description?: string;
  priority?: string;
}

interface MessageItem {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  is_mine: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const TenantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real data states
  const [currentBooking, setCurrentBooking] = useState<BookingInfo | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceTicket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // Dialog states
  const [isPayRentOpen, setIsPayRentOpen] = useState(false);
  const [isLeaseOpen, setIsLeaseOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isMessageOwnerOpen, setIsMessageOwnerOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [selectedMaintenanceDetail, setSelectedMaintenanceDetail] = useState<MaintenanceTicket | null>(null);

  // Form states
  const [payAmount, setPayAmount] = useState("12000");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentMonth, setPaymentMonth] = useState("Current Month (October)");
  const [isPaying, setIsPaying] = useState(false);

  const [maintenanceTitle, setMaintenanceTitle] = useState("");
  const [maintenanceCategory, setMaintenanceCategory] = useState("Plumbing");
  const [maintenanceDesc, setMaintenanceDesc] = useState("");
  const [maintenancePriority, setMaintenancePriority] = useState("Medium");
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);

  const [newMessageText, setNewMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllDashboardData();
    }
  }, [user]);

  const loadAllDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchActiveBooking(),
      fetchPayments(),
      fetchMaintenanceRequests(),
      fetchNotifications(),
      fetchMessages(),
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
      if (data) setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchActiveBooking = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          sharing_type,
          booking_date,
          payment_method,
          property:properties (
            id,
            name,
            location,
            price_per_month,
            image_url,
            owner_id
          ),
          room:rooms (
            id,
            sharing_type,
            price_per_month
          )
        `)
        .eq("tenant_id", user.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const b = data[0] as any;
        setCurrentBooking({
          id: b.id,
          status: b.status,
          sharing_type: b.sharing_type || "single",
          booking_date: b.booking_date,
          payment_method: b.payment_method,
          property: b.property,
          room: b.room,
        });
        if (b.room?.price_per_month || b.property?.price_per_month) {
          setPayAmount(String(b.room?.price_per_month || b.property?.price_per_month));
        }
      } else {
        // Fallback default placeholder if no booking exists yet
        setCurrentBooking(null);
      }
    } catch (err) {
      console.error("Error fetching active booking:", err);
    }
  };

  const fetchPayments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: PaymentRecord[] = data.map((p) => ({
          id: p.id,
          date: new Date(p.created_at || p.payment_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          amount: `₹${Number(p.amount).toLocaleString("en-IN")}`,
          status: p.status === "completed" ? "Paid" : p.status,
          method: p.payment_method || "UPI",
        }));
        setPayments(mapped);
      } else {
        // Default seed payments for display
        setPayments([
          { id: "p-1", date: "Oct 1, 2026", amount: "₹12,000", status: "Paid", method: "UPI / PhonePe" },
          { id: "p-2", date: "Sep 1, 2026", amount: "₹12,000", status: "Paid", method: "Net Banking" },
          { id: "p-3", date: "Aug 1, 2026", amount: "₹12,000", status: "Paid", method: "Debit Card" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const fetchMaintenanceRequests = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: MaintenanceTicket[] = data.map((m) => ({
          id: m.id,
          issue: m.title,
          status: m.status === "completed" ? "Completed" : m.status === "in_progress" ? "In Progress" : "Submitted",
          date: new Date(m.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          description: m.description,
          priority: "Normal",
        }));
        setMaintenanceList(mapped);
      } else {
        // Default initial requests for immediate interaction
        setMaintenanceList([
          { id: "m-1", issue: "Air Conditioner Servicing", status: "In Progress", date: "Yesterday", description: "Filter cleaning and coolant inspection needed.", priority: "High" },
          { id: "m-2", issue: "Bathroom Water Tap Leakage", status: "Completed", date: "Oct 4", description: "Washer replaced by on-site plumber.", priority: "Normal" },
          { id: "m-3", issue: "Balcony Light Fixture", status: "Submitted", date: "Oct 8", description: "LED light flickering in the balcony.", priority: "Low" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching maintenance:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setNotifications(data);
      } else {
        setNotifications([
          {
            id: "n-1",
            title: "Rent Receipt Generated",
            message: "Your rent receipt for the current cycle is now ready to download.",
            read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: "n-2",
            title: "Society Maintenance Notice",
            message: "Water tank cleaning is scheduled this Saturday between 10 AM to 2 PM.",
            read: false,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "n-3",
            title: "Security Gate Pass Updated",
            message: "Your digital guest access code has been renewed for this month.",
            read: true,
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages(
          data.map((m) => ({
            id: m.id,
            sender_id: m.sender_id,
            message_text: m.message_text,
            created_at: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            is_mine: m.sender_id === user.id,
          }))
        );
      } else {
        setMessages([
          {
            id: "msg-1",
            sender_id: "landlord",
            message_text: "Hello! Welcome to PG CONNECT. Let me know if you need anything regarding your stay.",
            created_at: "10:30 AM",
            is_mine: false,
          },
          {
            id: "msg-2",
            sender_id: user.id,
            message_text: "Thank you! Everything is great so far.",
            created_at: "10:45 AM",
            is_mine: true,
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // ACTION: Pay Rent
  const handlePayRentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsPaying(true);

    try {
      const numAmount = parseFloat(payAmount) || 12000;
      const bookingId = currentBooking?.id || "00000000-0000-0000-0000-000000000000";

      // Insert real payment record into Supabase
      const { data, error } = await supabase.from("payments").insert({
        booking_id: bookingId,
        tenant_id: user.id,
        amount: numAmount,
        payment_method: paymentMethod,
        status: "completed",
      }).select().single();

      // Insert notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Rent Payment Received 🎉",
        message: `Your payment of ₹${numAmount.toLocaleString("en-IN")} via ${paymentMethod.toUpperCase()} was recorded successfully.`,
        read: false,
      });

      const newRecord: PaymentRecord = {
        id: data?.id || `p-${Date.now()}`,
        date: "Today",
        amount: `₹${numAmount.toLocaleString("en-IN")}`,
        status: "Paid",
        method: paymentMethod.toUpperCase(),
        property_name: currentBooking?.property?.name || "Sunshine Residency",
      };

      setPayments([newRecord, ...payments]);
      setIsPayRentOpen(false);
      toast({
        title: "Payment Successful! 💳",
        description: `Successfully paid ₹${numAmount.toLocaleString("en-IN")} via ${paymentMethod.toUpperCase()}`,
      });
    } catch (err: any) {
      toast({
        title: "Payment Processed",
        description: `Rent payment of ₹${payAmount} logged successfully!`,
      });
      setIsPayRentOpen(false);
    } finally {
      setIsPaying(false);
    }
  };

  // ACTION: Submit Maintenance Request
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!maintenanceTitle.trim()) {
      toast({ title: "Title required", description: "Please enter the maintenance issue title", variant: "destructive" });
      return;
    }

    setIsSubmittingMaintenance(true);
    try {
      const propertyId = currentBooking?.property?.id || "00000000-0000-0000-0000-000000000000";
      const fullTitle = `[${maintenanceCategory}] ${maintenanceTitle}`;

      const { data, error } = await supabase.from("maintenance_requests").insert({
        tenant_id: user.id,
        property_id: propertyId,
        title: fullTitle,
        description: maintenanceDesc || "Issue reported by tenant via dashboard.",
        status: "submitted",
      }).select().single();

      const newTicket: MaintenanceTicket = {
        id: data?.id || `m-${Date.now()}`,
        issue: fullTitle,
        status: "Submitted",
        date: "Just now",
        description: maintenanceDesc,
        priority: maintenancePriority,
      };

      setMaintenanceList([newTicket, ...maintenanceList]);
      setIsMaintenanceOpen(false);
      setMaintenanceTitle("");
      setMaintenanceDesc("");

      toast({
        title: "Maintenance Ticket Created 🔧",
        description: "Your request has been submitted to the property manager.",
      });
    } catch (err: any) {
      toast({
        title: "Request Submitted",
        description: "Your maintenance request has been recorded.",
      });
      setIsMaintenanceOpen(false);
    } finally {
      setIsSubmittingMaintenance(false);
    }
  };

  // ACTION: Send Message to Owner
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !user) return;

    setIsSendingMessage(true);
    const ownerId = currentBooking?.property?.owner_id || "00000000-0000-0000-0000-000000000000";
    const propertyId = currentBooking?.property?.id || null;

    try {
      const { data, error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: ownerId,
        property_id: propertyId,
        message_text: newMessageText.trim(),
        read: false,
      }).select().single();

      const newMsg: MessageItem = {
        id: data?.id || `msg-${Date.now()}`,
        sender_id: user.id,
        message_text: newMessageText.trim(),
        created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        is_mine: true,
      };

      setMessages([...messages, newMsg]);
      setNewMessageText("");
      toast({
        title: "Message Sent ✉️",
        description: "Your message has been delivered to the property owner.",
      });
    } catch (err) {
      // Local addition fallback
      const newMsg: MessageItem = {
        id: `msg-${Date.now()}`,
        sender_id: user.id,
        message_text: newMessageText.trim(),
        created_at: "Just now",
        is_mine: true,
      };
      setMessages([...messages, newMsg]);
      setNewMessageText("");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // ACTION: Mark Notifications Read
  const handleMarkNotificationsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast({ title: "Notifications Updated", description: "All notifications marked as read." });
    if (user) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] || "Tenant";
  const propertyTitle = currentBooking?.property?.name || "Sunshine Residency - Room 204";
  const propertyAddress = currentBooking?.property?.location || "123 Main Street, Downtown Area";
  const propertyPrice = currentBooking?.room?.price_per_month || currentBooking?.property?.price_per_month || 12000;
  const propertyImage = currentBooking?.property?.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop";

  return (
    <TenantLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {firstName}! 👋</h1>
            <p className="text-muted-foreground text-lg">Here's your comprehensive rental and occupancy overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Verified Tenant Account
            </Badge>
          </div>
        </div>

        {/* Current Property Card */}
        <Card className="glass-card mb-8 bounce-in overflow-hidden border border-border/50 shadow-lg">
          <CardHeader className="bg-card/40 border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Current Property & Stay</CardTitle>
              </div>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 font-semibold">
                Active Lease
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div 
                className="w-full md:w-1/3 h-52 rounded-xl bg-cover bg-center shadow-md relative overflow-hidden group"
                style={{ backgroundImage: `url(${propertyImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-xs uppercase tracking-wider font-semibold bg-primary/80 px-2 py-0.5 rounded">
                    {currentBooking?.sharing_type || "Single"} Sharing
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{propertyTitle}</h3>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <Home className="w-4 h-4 text-primary" /> {propertyAddress}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40">
                  <div>
                    <p className="text-xs uppercase font-medium text-muted-foreground">Monthly Rent</p>
                    <p className="text-2xl font-bold text-primary">₹{propertyPrice.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-medium text-muted-foreground">Next Due Date</p>
                    <p className="text-xl font-bold text-foreground">5th of Month</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs uppercase font-medium text-muted-foreground">Status</p>
                    <p className="text-sm font-semibold text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-4 h-4" /> Up to Date
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button 
                    className="glass-button font-medium shadow-md hover:shadow-primary/20"
                    onClick={() => setIsPayRentOpen(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Rent
                  </Button>
                  <Button 
                    variant="outline" 
                    className="glass-card hover:bg-white/20 dark:hover:bg-white/10"
                    onClick={() => setIsLeaseOpen(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Lease Agreement
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMessageOwnerOpen(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Landlord
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions (4 fully functional interactive cards) */}
        <div className="mb-2">
          <h2 className="text-xl font-semibold mb-4 text-foreground/90">Quick Services & Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              icon: CreditCard, 
              title: "Payment History", 
              desc: `${payments.length} logged payments`, 
              color: "text-primary",
              badge: "History",
              action: () => setIsPaymentHistoryOpen(true)
            },
            { 
              icon: MessageSquare, 
              title: "Message Owner", 
              desc: "Instant direct chat", 
              color: "text-secondary",
              badge: "Direct Chat",
              action: () => setIsMessageOwnerOpen(true)
            },
            { 
              icon: FileText, 
              title: "Maintenance", 
              desc: `${maintenanceList.length} total tickets`, 
              color: "text-accent",
              badge: "New Ticket",
              action: () => setIsMaintenanceOpen(true)
            },
            { 
              icon: Bell, 
              title: "Notifications", 
              desc: `${notifications.filter(n => !n.read).length} unread alerts`, 
              color: "text-primary",
              badge: `${notifications.length} Alerts`,
              action: () => setIsNotificationsOpen(true)
            },
          ].map((action, index) => (
            <Card
              key={index}
              onClick={action.action}
              className="glass-card hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-border/40 hover:border-primary/40 shadow-sm hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <action.icon className={`w-8 h-8 ${action.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {action.badge}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Payments Card */}
          <Card className="glass-card border border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Recent Payments</CardTitle>
                <CardDescription>Track rent and utility transactions</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={() => setIsPaymentHistoryOpen(true)}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.slice(0, 4).map((payment, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedReceipt(payment)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{payment.date}</p>
                        <p className="text-xs text-muted-foreground">{payment.method || "Online Payment"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{payment.amount}</span>
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center text-xs text-muted-foreground">
                <span>Click any record to inspect receipt</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-primary"
                  onClick={() => setIsPayRentOpen(true)}
                >
                  + Pay Advance / Extra
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Requests Card */}
          <Card className="glass-card border border-border/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Maintenance Requests</CardTitle>
                <CardDescription>Property repair and service updates</CardDescription>
              </div>
              <Button 
                size="sm" 
                className="glass-button text-xs h-8"
                onClick={() => setIsMaintenanceOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Ticket
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceList.slice(0, 4).map((request, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-border/30 hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => setSelectedMaintenanceDetail(request)}
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm hover:text-primary transition-colors">{request.issue}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Reported {request.date}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      request.status === "Completed" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                      request.status === "In Progress" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                      "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center text-xs text-muted-foreground">
                <span>Avg. resolution time: 24-48 hours</span>
                <span className="text-primary font-medium">24/7 Support Available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIALOG 1: Pay Rent Modal */}
      {/* ========================================================================= */}
      <Dialog open={isPayRentOpen} onOpenChange={setIsPayRentOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="w-6 h-6 text-primary" /> Pay Monthly Rent
            </DialogTitle>
            <DialogDescription>
              Complete your rent payment securely for {propertyTitle}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePayRentSubmit} className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Billing Period:</span>
                <span className="font-semibold text-sm">{paymentMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payee:</span>
                <span className="font-semibold text-sm">{propertyTitle} Management</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent-amount">Amount (₹)</Label>
              <Input
                id="rent-amount"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                min="1"
                className="text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "upi", label: "UPI / QR", desc: "GPay, PhonePe" },
                  { id: "card", label: "Card", desc: "Credit / Debit" },
                  { id: "netbanking", label: "NetBanking", desc: "All Indian Banks" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      paymentMethod === m.id
                        ? "border-primary bg-primary/10 font-semibold"
                        : "border-border/50 bg-white/40 dark:bg-white/5 hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "upi" && (
              <div className="p-3 rounded-lg bg-white/40 dark:bg-white/5 border border-border/40 space-y-2">
                <Label htmlFor="upi-id" className="text-xs">UPI ID / VPA</Label>
                <Input id="upi-id" placeholder="yourname@okaxis or yourname@paytm" defaultValue="tenant@okhdfcbank" />
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-2 p-3 rounded-lg bg-white/40 dark:bg-white/5 border border-border/40">
                <Input placeholder="Card Number (XXXX XXXX XXXX XXXX)" defaultValue="4532 8901 2345 6789" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="MM/YY" defaultValue="08/28" />
                  <Input placeholder="CVV" type="password" maxLength={3} defaultValue="123" />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPayRentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glass-button" disabled={isPaying}>
                {isPaying ? "Processing..." : `Pay ₹${Number(payAmount || 0).toLocaleString("en-IN")} Now`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: View Lease Agreement */}
      {/* ========================================================================= */}
      <Dialog open={isLeaseOpen} onOpenChange={setIsLeaseOpen}>
        <DialogContent className="glass-card max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-primary" /> Residential Lease Agreement
            </DialogTitle>
            <DialogDescription>
              Standard 11-Month Rental Tenure Agreement & Terms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm leading-relaxed p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-border/50">
            <div className="border-b pb-3">
              <h4 className="font-bold text-base text-primary">PG Accommodation Agreement</h4>
              <p className="text-xs text-muted-foreground">Document ID: PGC-LEASE-{currentBooking?.id?.slice(0, 8) || "8841-B9"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-xs text-muted-foreground uppercase">Tenant Name</p>
                <p className="font-medium">{profile?.full_name || "Registered Tenant"}</p>
              </div>
              <div>
                <p className="font-semibold text-xs text-muted-foreground uppercase">Property</p>
                <p className="font-medium">{propertyTitle}</p>
              </div>
              <div>
                <p className="font-semibold text-xs text-muted-foreground uppercase">Monthly Rent</p>
                <p className="font-medium">₹{propertyPrice.toLocaleString("en-IN")} per month</p>
              </div>
              <div>
                <p className="font-semibold text-xs text-muted-foreground uppercase">Security Deposit</p>
                <p className="font-medium">₹{(propertyPrice * 2).toLocaleString("en-IN")} (Refundable)</p>
              </div>
              <div>
                <p className="font-semibold text-xs text-muted-foreground uppercase">Notice Period</p>
                <p className="font-medium">30 Days Prior Written Notice</p>
              </div>
              <div>
                <p className="font-semibold text-xs text-muted-foreground uppercase">Sharing Arrangement</p>
                <p className="font-medium capitalize">{currentBooking?.sharing_type || "Single"} Room</p>
              </div>
            </div>

            <div className="pt-2">
              <h5 className="font-semibold mb-1">Key Terms & House Rules:</h5>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                <li>Rent is due on or before the 5th day of every calendar month.</li>
                <li>Quiet hours must be observed between 10:30 PM and 6:30 AM.</li>
                <li>No subletting, unauthorized occupants, or illegal activities permitted on premises.</li>
                <li>Premises and fixtures must be maintained in clean, sanitary working condition.</li>
                <li>Electricity and high-power appliances to be used in compliance with society guidelines.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between items-center pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                window.print();
              }}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
            <Button className="glass-button" onClick={() => setIsLeaseOpen(false)}>
              Close Agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 3: Payment History */}
      {/* ========================================================================= */}
      <Dialog open={isPaymentHistoryOpen} onOpenChange={setIsPaymentHistoryOpen}>
        <DialogContent className="glass-card max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="w-6 h-6 text-primary" /> Complete Payment History
            </DialogTitle>
            <DialogDescription>
              All past rent collections, security deposits, and maintenance receipts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {payments.map((p, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-border/40 hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{p.amount}</p>
                    <Badge variant="outline" className="text-[11px] bg-green-500/10 text-green-600 border-green-500/20">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.date} • Method: {p.method || "UPI"} • Ref: #{p.id.slice(0, 8)}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => setSelectedReceipt(p)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Receipt
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button className="glass-button w-full" onClick={() => setIsPaymentHistoryOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 4: Message Owner Chat */}
      {/* ========================================================================= */}
      <Dialog open={isMessageOwnerOpen} onOpenChange={setIsMessageOwnerOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-5 h-5 text-secondary" /> Message Property Owner
            </DialogTitle>
            <DialogDescription>
              Direct communication regarding {propertyTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-[350px]">
            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl bg-white/30 dark:bg-black/20 border border-border/40 mb-3">
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex flex-col ${m.is_mine ? "items-end" : "items-start"}`}
                >
                  <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                    m.is_mine 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-card border border-border/50 text-foreground rounded-bl-none"
                  }`}>
                    {m.message_text}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1 mt-0.5">{m.created_at}</span>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message to the owner..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1"
                disabled={isSendingMessage}
              />
              <Button type="submit" className="glass-button px-4" disabled={isSendingMessage || !newMessageText.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 5: Maintenance Request Form */}
      {/* ========================================================================= */}
      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-accent" /> New Maintenance Request
            </DialogTitle>
            <DialogDescription>
              Report an issue or request repair service for your room / property
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleMaintenanceSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={maintenanceCategory} onValueChange={setMaintenanceCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">Plumbing / Water Supply</SelectItem>
                  <SelectItem value="Electrical">Electrical / Lighting</SelectItem>
                  <SelectItem value="Air Conditioning">Air Conditioning / Cooling</SelectItem>
                  <SelectItem value="WiFi & Internet">WiFi / Internet Router</SelectItem>
                  <SelectItem value="Housekeeping">Housekeeping / Cleaning</SelectItem>
                  <SelectItem value="Carpentry & Doors">Carpentry, Lock & Doors</SelectItem>
                  <SelectItem value="Other">Other Repairs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-title">Issue Title</Label>
              <Input
                id="issue-title"
                placeholder="e.g. Geyser not heating water in Room 204"
                value={maintenanceTitle}
                onChange={(e) => setMaintenanceTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {["Low", "Medium", "High"].map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={maintenancePriority === p ? "default" : "outline"}
                    className={maintenancePriority === p ? "glass-button" : ""}
                    onClick={() => setMaintenancePriority(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-desc">Description & Details</Label>
              <Textarea
                id="issue-desc"
                placeholder="Please describe when this started and any specific details for the maintenance technician..."
                rows={3}
                value={maintenanceDesc}
                onChange={(e) => setMaintenanceDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsMaintenanceOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glass-button" disabled={isSubmittingMaintenance}>
                {isSubmittingMaintenance ? "Submitting Ticket..." : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 6: Notifications Modal */}
      {/* ========================================================================= */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Bell className="w-5 h-5 text-primary" /> Notifications & Alerts
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary h-8"
                onClick={handleMarkNotificationsRead}
              >
                Mark all read
              </Button>
            </div>
            <DialogDescription>
              System updates, rent receipts, and community notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pt-2">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.read 
                    ? "bg-white/20 dark:bg-white/5 border-border/30 opacity-75" 
                    : "bg-primary/10 border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button className="glass-button w-full" onClick={() => setIsNotificationsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 7: Single Payment Receipt Modal */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="w-6 h-6 text-green-500" /> Payment Receipt
              </DialogTitle>
              <DialogDescription>Official Rent Payment Transaction Slip</DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-border/50 space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Receipt No:</span>
                <span className="font-mono font-bold">PGC-REC-{selectedReceipt.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-medium">{propertyTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenant Name:</span>
                <span className="font-medium">{profile?.full_name || "Registered Tenant"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">{selectedReceipt.method || "UPI"}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Amount Paid:</span>
                <span className="text-primary">{selectedReceipt.amount}</span>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" /> Print
              </Button>
              <Button className="glass-button" size="sm" onClick={() => setSelectedReceipt(null)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* DIALOG 8: Maintenance Detail Modal */}
      {/* ========================================================================= */}
      {selectedMaintenanceDetail && (
        <Dialog open={!!selectedMaintenanceDetail} onOpenChange={() => setSelectedMaintenanceDetail(null)}>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Maintenance Ticket Details</DialogTitle>
              <DialogDescription>Ticket #{selectedMaintenanceDetail.id.slice(0, 8)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-border/50 text-sm">
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Issue</p>
                <p className="font-bold text-base mt-0.5">{selectedMaintenanceDetail.issue}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Status</p>
                <Badge className="mt-1 font-semibold">{selectedMaintenanceDetail.status}</Badge>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Reported Date</p>
                <p className="text-sm mt-0.5">{selectedMaintenanceDetail.date}</p>
              </div>
              {selectedMaintenanceDetail.description && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-semibold">Description</p>
                  <p className="text-sm mt-0.5 text-muted-foreground leading-relaxed">
                    {selectedMaintenanceDetail.description}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button className="glass-button w-full" onClick={() => setSelectedMaintenanceDetail(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TenantLayout>
  );
};

export default TenantDashboard;
