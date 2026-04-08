import { Target, Eye, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const About = () => {
  const sections = [
    {
      icon: Target,
      title: "Our Mission",
      content: "At PG CONNECT, our mission is to revolutionize the way people find and manage PG accommodations. We strive to create a seamless platform that connects tenants with verified property owners, ensuring transparency, trust, and convenience at every step. Our goal is to make the search for the perfect living space stress-free and efficient for everyone involved."
    },
    {
      icon: Eye,
      title: "Our Vision",
      content: "We envision a future where finding quality PG accommodation is as simple as a few clicks. Our platform aims to become the most trusted marketplace for rental properties, where safety, affordability, and community are at the forefront. We believe in empowering both tenants and property owners with the tools they need to make informed decisions and build lasting relationships."
    },
    {
      icon: Lightbulb,
      title: "How It Works",
      content: "Getting started with PG CONNECT is incredibly simple. Tenants can browse through verified listings, filter by location and amenities, and connect directly with property owners. Property owners can easily list their PGs, manage bookings, track payments, and communicate with tenants—all from one intuitive dashboard. Our smart matching system ensures you find the perfect fit every time."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden parallax-section pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-background" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 slide-up">
            <h1 className="text-5xl md:text-6xl font-bold">
              About <span className="text-gradient">PG CONNECT</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Building the future of PG accommodation management
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {sections.map((section, index) => (
              <Card
                key={index}
                className="glass-card hover:scale-[1.02] transition-all duration-500"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-3xl">
                    <div className="relative">
                      <section.icon className="w-12 h-12 text-primary" />
                      <div className="absolute inset-0 bg-primary/20 blur-2xl" />
                    </div>
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { number: "10K+", label: "Happy Tenants" },
              { number: "5K+", label: "Verified Properties" },
              { number: "500+", label: "Property Owners" },
            ].map((stat, index) => (
              <div key={index} className="glass-card rounded-2xl p-8 text-center bounce-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-5xl font-bold text-gradient mb-2">{stat.number}</div>
                <div className="text-xl text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
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

export default About;
