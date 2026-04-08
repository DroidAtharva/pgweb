import { useState, useEffect } from "react";
import { MapPin, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Static properties as fallback
  const staticProperties = [
    {
      id: "static-1",
      name: "Ramayan PG",
      location: "Kothrud, Pune",
      price_per_month: 12500,
      image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop",
      amenities: ["WiFi", "AC", "Meals"]
    },
    {
      id: "static-2",
      name: "Ambarnath PG",
      location: "Hinjewadi, Pune",
      price_per_month: 11000,
      image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
      amenities: ["WiFi", "Laundry", "Security"]
    },
    {
      id: "static-3",
      name: "Homies PG",
      location: "Viman Nagar, Pune",
      price_per_month: 13500,
      image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
      amenities: ["WiFi", "AC", "Gym"]
    },
    {
      id: "static-4",
      name: "Akshata PG",
      location: "Wakad, Pune",
      price_per_month: 10500,
      image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
      amenities: ["WiFi", "Meals", "Parking"]
    },
    {
      id: "static-5",
      name: "Atlantis99 PG",
      location: "Baner, Pune",
      price_per_month: 14500,
      image_url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop",
      amenities: ["WiFi", "AC", "Swimming Pool"]
    },
    {
      id: "static-6",
      name: "Chintamani PG",
      location: "Kalyani Nagar, Pune",
      price_per_month: 11500,
      image_url: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&auto=format&fit=crop",
      amenities: ["WiFi", "AC", "Meals"]
    }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching properties:", error);
      if (error.code === 'PGRST205') {
        console.error('❌ DATABASE NOT SETUP: Please run database_migration.sql first!');
        console.error('Instructions: See SETUP_INSTRUCTIONS.md');
      }
      // Use static properties as fallback
      setProperties(staticProperties);
    } else if (data && data.length > 0) {
      // Combine Supabase properties with static ones
      setProperties([...data, ...staticProperties]);
    } else {
      // Only static properties
      setProperties(staticProperties);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden parallax-section pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 slide-up">
            <h1 className="text-5xl md:text-6xl font-bold">
              Available <span className="text-gradient">PG Properties</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover comfortable and verified PG accommodations in Pune
            </p>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <Card
                  key={property.id}
                  className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300 group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.image_url}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{property.name}</span>
                      <span className="text-primary text-xl">₹{property.price_per_month.toLocaleString()}/mo</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities?.slice(0, 3).map((amenity: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full glass-button" onClick={() => navigate(`/property/${property.id}`)}>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 PG CONNECT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Properties;
