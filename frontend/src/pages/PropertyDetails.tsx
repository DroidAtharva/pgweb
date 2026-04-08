import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Home, Check, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSharing, setSelectedSharing] = useState<string>("");
  const [bookingType, setBookingType] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (data) {
      setTenantName(data.full_name);
    }
  };

  const fetchPropertyDetails = async () => {
    setLoading(true);
    const { data: propData, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
      setLoading(false);
      return;
    }

    setProperty(propData);

    // Fetch rooms for this property
    const { data: roomsData } = await supabase
      .from("rooms")
      .select("*")
      .eq("property_id", id);

    if (roomsData) {
      setRooms(roomsData);
    }

    setLoading(false);
  };

  const handleBookNow = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book a property",
        variant: "destructive",
      });
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!selectedSharing) {
      toast({
        title: "Select Sharing Type",
        description: "Please select a sharing type first",
        variant: "destructive",
      });
      return;
    }

    if (bookingType === "pay_at_property") {
      await submitBooking();
    }
  };

  const submitBooking = async () => {
    setSubmitting(true);
    const selectedRoom = rooms.find((r) => r.sharing_type === selectedSharing);

    const { error } = await supabase.from("bookings").insert({
      tenant_id: user!.id,
      property_id: property.id,
      room_id: selectedRoom?.id,
      sharing_type: selectedSharing,
      payment_method: "pay_at_property",
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setShowConfirmation(true);
      setTimeout(() => {
        navigate("/tenant/dashboard");
      }, 2000);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentDate || !appointmentTime || !tenantName) {
      toast({
        title: "Missing Information",
        description: "Please fill all appointment details",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("appointments").insert({
      tenant_id: user!.id,
      property_id: property.id,
      tenant_name: tenantName,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: "scheduled",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Appointment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Appointment Scheduled",
        description: "Your appointment has been scheduled successfully",
      });
      setBookingType("");
      setAppointmentDate("");
      setAppointmentTime("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button onClick={() => navigate("/properties")}>Back to Properties</Button>
        </div>
      </div>
    );
  }

  const occupancyLabel = {
    boys: "Boys Only",
    girls: "Girls Only",
    coed: "Co-ed",
  }[property.occupancy_type] || property.occupancy_type;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden parallax-section pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4 slide-up">
            <h1 className="text-4xl md:text-5xl font-bold">{property.name}</h1>
            <div className="flex items-center justify-center text-muted-foreground text-lg">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{property.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="glass-card overflow-hidden">
                <img
                  src={property.image_url}
                  alt={property.name}
                  className="w-full h-[400px] object-cover"
                />
              </Card>

              {/* Description */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>About This Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || "A comfortable PG accommodation with modern amenities."}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities && property.amenities.length > 0 ? (
                      property.amenities.map((amenity: string, i: number) => (
                        <span
                          key={i}
                          className="px-4 py-2 rounded-full bg-primary/10 text-primary flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {amenity}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No amenities listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Room Types */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Available Room Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedSharing} onValueChange={setSelectedSharing}>
                    <div className="space-y-3">
                      {rooms.length > 0 ? (
                        rooms.map((room) => (
                          <div
                            key={room.id}
                            className="flex items-center space-x-3 p-4 rounded-lg bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer"
                          >
                            <RadioGroupItem value={room.sharing_type} id={room.sharing_type} />
                            <Label
                              htmlFor={room.sharing_type}
                              className="flex-1 cursor-pointer flex justify-between items-center"
                            >
                              <span className="capitalize font-semibold">{room.sharing_type} Sharing</span>
                              <span className="text-primary font-bold">
                                ₹{room.price_per_month.toLocaleString()}/month
                              </span>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No rooms available</p>
                      )}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Booking Options */}
              {selectedSharing && (
                <Card className="glass-card bounce-in">
                  <CardHeader>
                    <CardTitle>Booking Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        className="glass-button h-auto py-6"
                        onClick={() => setBookingType("pay_at_property")}
                        variant={bookingType === "pay_at_property" ? "default" : "outline"}
                      >
                        <div className="text-center">
                          <Home className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-semibold">Pay at Property</div>
                          <div className="text-xs opacity-75">Visit and pay directly</div>
                        </div>
                      </Button>

                      <Button
                        className="glass-button h-auto py-6"
                        onClick={() => setBookingType("schedule")}
                        variant={bookingType === "schedule" ? "default" : "outline"}
                      >
                        <div className="text-center">
                          <Calendar className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-semibold">Schedule Appointment</div>
                          <div className="text-xs opacity-75">Book a viewing slot</div>
                        </div>
                      </Button>
                    </div>

                    {bookingType === "pay_at_property" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                          Your booking request will be sent to the owner. You can pay when you visit the property.
                        </p>
                        <Button
                          className="w-full glass-button"
                          onClick={handleBookNow}
                          disabled={submitting}
                        >
                          {submitting ? "Submitting..." : "Confirm Booking"}
                        </Button>
                      </div>
                    )}

                    {bookingType === "schedule" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="space-y-2">
                          <Label htmlFor="tenant-name">Your Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="tenant-name"
                              value={tenantName}
                              onChange={(e) => setTenantName(e.target.value)}
                              className="pl-10"
                              placeholder="Enter your name"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="appointment-date">Appointment Date</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="appointment-date"
                              type="date"
                              value={appointmentDate}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              className="pl-10"
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="appointment-time">Appointment Time</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="appointment-time"
                              type="time"
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full glass-button"
                          onClick={handleScheduleAppointment}
                          disabled={submitting}
                        >
                          {submitting ? "Scheduling..." : "Confirm Appointment"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card sticky top-24">
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Rent</p>
                    <p className="text-3xl font-bold text-primary">
                      ₹{property.price_per_month.toLocaleString()}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Occupancy Type</p>
                    <p className="text-lg font-semibold">{occupancyLabel}</p>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm">{property.location}</p>
                    </div>
                  </div>

                  {!selectedSharing && (
                    <div className="pt-4">
                      <p className="text-sm text-center text-muted-foreground italic">
                        Select a room type to see booking options
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Booking Request Sent! 🎉</DialogTitle>
            <DialogDescription className="text-center pt-4">
              Your booking request has been sent to the property owner. They will contact you soon.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 PG CONNECT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PropertyDetails;
