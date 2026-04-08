import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Contact = () => {
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
              Get In <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="glass-card rounded-2xl p-8 bounce-in">
                <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
                <div className="space-y-6">
                  <a 
                    href="mailto:vineetsingh68220@gmail.com"
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <div className="relative">
                      <Mail className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Email</p>
                      <p className="text-muted-foreground">vineetsingh68220@gmail.com</p>
                    </div>
                  </a>

                  <a 
                    href="tel:8848456075"
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <div className="relative">
                      <Phone className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Phone</p>
                      <p className="text-muted-foreground">+91 8848456075</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-lg">
                    <div className="relative">
                      <MapPin className="w-6 h-6 text-primary" />
                      <div className="absolute inset-0 bg-primary/20 blur-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Office Address</p>
                      <p className="text-muted-foreground">
                        123 Tech Park, Hinjewadi Phase 2<br />
                        Pune, Maharashtra 411057<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <Card className="glass-card bounce-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle>Office Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="glass-card bounce-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-3xl">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      className="glass-card"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="glass-card"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      className="glass-card min-h-[150px]"
                    />
                  </div>

                  <Button type="submit" className="w-full glass-button text-lg py-6">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
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

export default Contact;
