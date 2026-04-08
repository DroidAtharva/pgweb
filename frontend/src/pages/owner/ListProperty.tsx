import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ListProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price_per_month: "",
    occupancy_type: "boys" as "boys" | "girls" | "coed",
    image_url: "",
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [rooms, setRooms] = useState<
    Array<{ sharing_type: "single" | "double" | "triple"; price: string; available_count: string }>
  >([]);

  const availableAmenities = [
    "WiFi",
    "AC",
    "Meals",
    "Laundry",
    "Security",
    "Parking",
    "Gym",
    "Swimming Pool",
    "Power Backup",
    "Hot Water",
    "TV",
    "Refrigerator",
  ];

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addRoom = () => {
    setRooms([...rooms, { sharing_type: "single", price: "", available_count: "1" }]);
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const updateRoom = (index: number, field: string, value: string) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRooms(updatedRooms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to list a property",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.location || !formData.price_per_month) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (rooms.length === 0) {
      toast({
        title: "No Rooms Added",
        description: "Please add at least one room type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Insert property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          name: formData.name,
          location: formData.location,
          description: formData.description,
          price_per_month: parseFloat(formData.price_per_month),
          occupancy_type: formData.occupancy_type,
          amenities: amenities,
          image_url:
            formData.image_url ||
            `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop`,
          available: true,
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Insert rooms
      const roomsData = rooms.map((room) => ({
        property_id: property.id,
        sharing_type: room.sharing_type,
        price_per_month: parseFloat(room.price),
        available_count: parseInt(room.available_count),
      }));

      const { error: roomsError } = await supabase.from("rooms").insert(roomsData);

      if (roomsError) throw roomsError;

      toast({
        title: "Property Listed Successfully! 🎉",
        description: "Your property is now visible to tenants",
      });

      setTimeout(() => {
        navigate("/owner/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error listing property:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to list property",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <Button variant="ghost" onClick={() => navigate("/owner/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[30vh] flex items-center justify-center overflow-hidden parallax-section pt-20 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4 slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">List Your Property</h1>
            <p className="text-xl text-muted-foreground">
              Add your PG accommodation and connect with potential tenants
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Property Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Sunshine Residency PG"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Kothrud, Pune"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your property..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Starting Price (per month) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price_per_month}
                      onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                      placeholder="e.g., 12000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Property Image URL (optional)</Label>
                    <Input
                      id="image"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Occupancy Type */}
                <div className="space-y-3">
                  <Label>
                    Occupancy Type <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.occupancy_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, occupancy_type: value as any })
                    }
                  >
                    <div className="grid grid-cols-3 gap-4">
                      {["boys", "girls", "coed"].map((type) => (
                        <div key={type}>
                          <RadioGroupItem value={type} id={type} className="peer sr-only" />
                          <Label
                            htmlFor={type}
                            className="flex items-center justify-center rounded-lg border-2 border-muted bg-white/40 dark:bg-white/5 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                          >
                            <span className="capitalize font-semibold">{type}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={amenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <Label
                          htmlFor={amenity}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      Room Types <span className="text-destructive">*</span>
                    </Label>
                    <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Room Type
                    </Button>
                  </div>

                  {rooms.map((room, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-end p-4 rounded-lg bg-white/40 dark:bg-white/5"
                    >
                      <div className="flex-1 space-y-2">
                        <Label>Sharing Type</Label>
                        <RadioGroup
                          value={room.sharing_type}
                          onValueChange={(value) => updateRoom(index, "sharing_type", value)}
                        >
                          <div className="flex gap-2">
                            {["single", "double", "triple"].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <RadioGroupItem value={type} id={`${index}-${type}`} />
                                <Label htmlFor={`${index}-${type}`} className="capitalize">
                                  {type}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="w-32 space-y-2">
                        <Label>Price/Month</Label>
                        <Input
                          type="number"
                          value={room.price}
                          onChange={(e) => updateRoom(index, "price", e.target.value)}
                          placeholder="12000"
                          required
                        />
                      </div>

                      <div className="w-24 space-y-2">
                        <Label>Available</Label>
                        <Input
                          type="number"
                          value={room.available_count}
                          onChange={(e) => updateRoom(index, "available_count", e.target.value)}
                          placeholder="1"
                          required
                          min="1"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRoom(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {rooms.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No rooms added yet. Click "Add Room Type" to get started.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-6 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/owner/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 glass-button" disabled={loading}>
                    {loading ? "Listing Property..." : "List Property"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 PG CONNECT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ListProperty;
