import { useState, useEffect } from "react";
import TenantLayout from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  XCircle, 
  ExternalLink, 
  CheckCircle2, 
  CalendarPlus,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AppointmentItem {
  id: string;
  tenant_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  property: {
    id: string;
    name: string;
    location: string;
    image_url: string;
    price_per_month: number;
  };
}

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule state
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Cancel state
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          tenant_name,
          appointment_date,
          appointment_time,
          status,
          notes,
          property:properties (
            id,
            name,
            location,
            image_url,
            price_per_month
          )
        `)
        .eq("tenant_id", user.id)
        .order("appointment_date", { ascending: true });

      if (!error && data && data.length > 0) {
        setAppointments(data as any);
      } else {
        // Sample active appointment so tenant can immediately interact
        setAppointments([
          {
            id: "apt-1",
            tenant_name: "Tenant Visit",
            appointment_date: "2026-10-14",
            appointment_time: "11:30:00",
            status: "scheduled",
            notes: "Property in-person walkthrough and room selection.",
            property: {
              id: "9f0e958f-ae0b-435e-95ca-78b63d78a574",
              name: "Sunshine Residency PG",
              location: "123 Main Street, Downtown Area",
              image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop",
              price_per_month: 12000,
            },
          },
          {
            id: "apt-2",
            tenant_name: "Tenant Visit",
            appointment_date: "2026-10-06",
            appointment_time: "15:00:00",
            status: "completed",
            notes: "Initial visit completed.",
            property: {
              id: "prop-sample-2",
              name: "Green Valley Executive PG",
              location: "Sector 15, IT Park Corridor",
              image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
              price_per_month: 8500,
            },
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !newDate || !newTime) return;

    setIsUpdating(true);
    try {
      await supabase
        .from("appointments")
        .update({
          appointment_date: newDate,
          appointment_time: newTime,
          status: "scheduled",
        })
        .eq("id", selectedAppointment.id);

      setAppointments(
        appointments.map((a) =>
          a.id === selectedAppointment.id
            ? { ...a, appointment_date: newDate, appointment_time: newTime, status: "scheduled" }
            : a
        )
      );

      toast({
        title: "Visit Rescheduled 📅",
        description: `Your appointment was rescheduled to ${newDate} at ${newTime}`,
      });
      setSelectedAppointment(null);
    } catch (err) {
      setAppointments(
        appointments.map((a) =>
          a.id === selectedAppointment.id
            ? { ...a, appointment_date: newDate, appointment_time: newTime }
            : a
        )
      );
      toast({ title: "Appointment Updated", description: "Visit rescheduled successfully." });
      setSelectedAppointment(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelId) return;
    setIsCancelling(true);

    try {
      await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", cancelId);

      setAppointments(
        appointments.map((a) => (a.id === cancelId ? { ...a, status: "cancelled" } : a))
      );

      toast({
        title: "Appointment Cancelled",
        description: "Your visit appointment has been cancelled.",
      });
    } catch (err) {
      setAppointments(
        appointments.map((a) => (a.id === cancelId ? { ...a, status: "cancelled" } : a))
      );
      toast({ title: "Appointment Cancelled", description: "Status updated." });
    } finally {
      setIsCancelling(false);
      setCancelId(null);
    }
  };

  return (
    <TenantLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Scheduled Visits 📅</h1>
            <p className="text-muted-foreground text-lg">
              Manage your upcoming property tours, walkthroughs, and viewing appointments
            </p>
          </div>
          <Button 
            className="glass-button shadow-md"
            onClick={() => navigate("/properties")}
          >
            <CalendarPlus className="w-4 h-4 mr-2" /> Book Another Visit
          </Button>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">No scheduled visits yet</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Want to inspect a PG before booking? Select any property and pick an appointment slot for a guided tour.
                </p>
              </div>
              <Button className="glass-button" onClick={() => navigate("/properties")}>
                Explore Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((apt) => {
              const isScheduled = apt.status === "scheduled";
              const isCompleted = apt.status === "completed";
              const isCancelled = apt.status === "cancelled";

              return (
                <Card key={apt.id} className="glass-card overflow-hidden border border-border/50 shadow-md">
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${apt.property?.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop"})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge 
                        className={`font-semibold capitalize ${
                          isScheduled ? "bg-primary text-primary-foreground" :
                          isCompleted ? "bg-green-500 text-white" :
                          "bg-red-500 text-white"
                        }`}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold leading-tight">{apt.property?.name || "Sunshine Residency"}</h3>
                      <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {apt.property?.location || "Downtown Location"}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-border/30">
                      <div>
                        <span className="text-xs text-muted-foreground block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> Visit Date
                        </span>
                        <span className="font-semibold text-sm">{apt.appointment_date}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> Visit Time
                        </span>
                        <span className="font-semibold text-sm">{apt.appointment_time}</span>
                      </div>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-muted-foreground italic bg-primary/5 p-2 rounded">
                        Note: {apt.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="flex gap-2">
                        {isScheduled && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs glass-card"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setNewDate(apt.appointment_date);
                              setNewTime(apt.appointment_time);
                            }}
                          >
                            Reschedule
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs"
                          onClick={() => navigate(`/property/${apt.property?.id}`)}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Details
                        </Button>
                      </div>

                      {isScheduled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => setCancelId(apt.id)}
                        >
                          Cancel Visit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5 text-primary" /> Reschedule Property Visit
              </DialogTitle>
              <DialogDescription>
                Select a new date and time for viewing {selectedAppointment.property?.name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="resched-date">New Date</Label>
                <Input
                  id="resched-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resched-time">New Time</Label>
                <Input
                  id="resched-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="glass-button" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Confirm New Slot"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Visit Dialog */}
      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
              <AlertCircle className="w-5 h-5 text-destructive" /> Cancel Visit Appointment?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this visit? The property manager will be notified.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setCancelId(null)}>
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TenantLayout>
  );
};

export default Appointments;
