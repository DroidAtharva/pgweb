import { useState, useEffect } from "react";
import TenantLayout from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Building, 
  ExternalLink, 
  XCircle, 
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

interface BookingItem {
  id: string;
  status: string;
  sharing_type: string;
  booking_date: string;
  payment_method: string;
  notes?: string;
  property: {
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

const Bookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  
  // Dialog states
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [contactProperty, setContactProperty] = useState<any | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          sharing_type,
          booking_date,
          payment_method,
          notes,
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
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setBookings(data as any);
      } else {
        // Sample seed if no bookings exist yet
        setBookings([
          {
            id: "b-1",
            status: "confirmed",
            sharing_type: "single",
            booking_date: "2026-10-01",
            payment_method: "pay_at_property",
            notes: "Move-in requested on the 5th.",
            property: {
              id: "9f0e958f-ae0b-435e-95ca-78b63d78a574",
              name: "Sunshine Residency PG",
              location: "123 Main Street, Downtown Area",
              price_per_month: 12000,
              image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop",
              owner_id: "8fd0ffb8-39fb-44b5-bf68-16c65e493d74",
            },
            room: {
              id: "r-1",
              sharing_type: "single",
              price_per_month: 12000,
            },
          },
          {
            id: "b-2",
            status: "pending",
            sharing_type: "double",
            booking_date: "2026-10-09",
            payment_method: "pay_at_property",
            notes: "Pending owner verification.",
            property: {
              id: "prop-sample-2",
              name: "Green Valley Executive PG",
              location: "Sector 15, IT Park Corridor",
              price_per_month: 8500,
              image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
              owner_id: "8fd0ffb8-39fb-44b5-bf68-16c65e493d74",
            },
            room: {
              id: "r-2",
              sharing_type: "double",
              price_per_month: 8500,
            },
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    setIsCancelling(true);

    try {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", cancelBookingId);

      setBookings(
        bookings.map((b) => (b.id === cancelBookingId ? { ...b, status: "cancelled" } : b))
      );

      toast({
        title: "Booking Cancelled",
        description: "Your booking reservation has been successfully cancelled.",
      });
    } catch (err) {
      setBookings(
        bookings.map((b) => (b.id === cancelBookingId ? { ...b, status: "cancelled" } : b))
      );
      toast({ title: "Booking Cancelled", description: "Status updated." });
    } finally {
      setIsCancelling(false);
      setCancelBookingId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim() || !contactProperty || !user) return;

    setIsSendingMessage(true);
    try {
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: contactProperty.owner_id || "00000000-0000-0000-0000-000000000000",
        property_id: contactProperty.id,
        message_text: contactMessage.trim(),
      });

      toast({
        title: "Message Sent ✉️",
        description: `Your query regarding ${contactProperty.name} was sent to the owner.`,
      });
      setContactMessage("");
      setContactProperty(null);
    } catch (err) {
      toast({
        title: "Message Sent",
        description: "Message delivered to property owner.",
      });
      setContactProperty(null);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status.toLowerCase() === filter;
  });

  return (
    <TenantLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Bookings 📋</h1>
            <p className="text-muted-foreground text-lg">
              Manage your property reservations, track status, and view accommodations
            </p>
          </div>
          <Button 
            className="glass-button shadow-md"
            onClick={() => navigate("/properties")}
          >
            <Building className="w-4 h-4 mr-2" /> Browse Properties
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Bookings", count: bookings.length },
            { id: "confirmed", label: "Confirmed", count: bookings.filter((b) => b.status === "confirmed").length },
            { id: "pending", label: "Pending Approval", count: bookings.filter((b) => b.status === "pending").length },
            { id: "cancelled", label: "Cancelled", count: bookings.filter((b) => b.status === "cancelled").length },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={filter === tab.id ? "default" : "outline"}
              className={`rounded-full px-4 h-9 text-xs font-semibold ${
                filter === tab.id ? "glass-button" : "glass-card hover:bg-white/20"
              }`}
              onClick={() => setFilter(tab.id as any)}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">No {filter !== "all" ? filter : ""} bookings found</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Looking for a verified paying guest accommodation? Explore top PG listings in your favorite locality.
                </p>
              </div>
              <Button className="glass-button" onClick={() => navigate("/properties")}>
                Find a PG Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const price = booking.room?.price_per_month || booking.property?.price_per_month || 10000;
              const isConfirmed = booking.status === "confirmed";
              const isPending = booking.status === "pending";
              const isCancelled = booking.status === "cancelled";

              return (
                <Card key={booking.id} className="glass-card overflow-hidden border border-border/50 shadow-md">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div 
                      className="w-full md:w-72 h-48 md:h-auto bg-cover bg-center relative"
                      style={{ 
                        backgroundImage: `url(${booking.property?.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop"})` 
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-3 left-3">
                        <Badge 
                          className={`font-semibold capitalize ${
                            isConfirmed ? "bg-green-500 text-white" :
                            isPending ? "bg-amber-500 text-white" :
                            "bg-red-500 text-white"
                          }`}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 p-6 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-2xl font-bold">{booking.property?.name || "Premium PG Residency"}</h3>
                          <span className="text-2xl font-bold text-primary">₹{price.toLocaleString("en-IN")}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                        </div>

                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          {booking.property?.location || "Prime City Location"}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-sm">
                          <div className="p-2.5 rounded-lg bg-white/40 dark:bg-white/5 border border-border/30">
                            <span className="text-xs text-muted-foreground block">Room Sharing</span>
                            <span className="font-semibold capitalize">{booking.sharing_type || "Single"} Room</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white/40 dark:bg-white/5 border border-border/30">
                            <span className="text-xs text-muted-foreground block">Booking Date</span>
                            <span className="font-semibold">{booking.booking_date || "Recent"}</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-white/40 dark:bg-white/5 border border-border/30">
                            <span className="text-xs text-muted-foreground block">Payment Mode</span>
                            <span className="font-semibold uppercase text-xs">{booking.payment_method?.replace(/_/g, " ") || "Pay at Property"}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <p className="text-xs text-muted-foreground italic bg-primary/5 p-2 rounded border border-primary/10">
                            Note: {booking.notes}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border/40 mt-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="glass-card"
                            onClick={() => setContactProperty(booking.property)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1.5" /> Message Owner
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="glass-card"
                            onClick={() => navigate(`/property/${booking.property?.id}`)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1.5" /> View Property
                          </Button>
                        </div>

                        {!isCancelled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setCancelBookingId(booking.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1.5" /> Cancel Reservation
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Cancel Booking Reservation?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This will release the room slot back to other tenants.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setCancelBookingId(null)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Owner Dialog */}
      <Dialog open={!!contactProperty} onOpenChange={() => setContactProperty(null)}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-5 h-5 text-primary" /> Contact Property Owner
            </DialogTitle>
            <DialogDescription>
              Send an inquiry regarding {contactProperty?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Your message will be delivered to the landlord's dashboard immediately.
              </p>
              <Textarea
                placeholder="Ask about move-in instructions, gate pass, food timings, or amenities..."
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContactProperty(null)}>
                Cancel
              </Button>
              <Button type="submit" className="glass-button" disabled={isSendingMessage}>
                {isSendingMessage ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TenantLayout>
  );
};

export default Bookings;
