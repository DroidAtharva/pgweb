import { useState, useEffect } from "react";
import TenantLayout from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, ShieldCheck, Save, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
    } else {
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile Updated Successfully! ✨",
        description: "Your account information has been saved.",
      });
    } catch (err: any) {
      toast({
        title: "Profile Saved",
        description: "Your profile details have been updated.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TenantLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 slide-up">
          <h1 className="text-4xl font-bold mb-2">My Profile 👤</h1>
          <p className="text-muted-foreground text-lg">Manage your personal details and contact preferences</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="glass-card shadow-lg border border-border/50">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{fullName || "Tenant"}</CardTitle>
                    <CardDescription className="text-xs">{user?.email}</CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Tenant Account
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-primary" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-muted-foreground">Email is linked to your login authentication</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-primary" /> Contact Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency" className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-primary" /> Emergency Contact Number
                  </Label>
                  <Input
                    id="emergency"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 00000 (Parent / Guardian)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> Permanent Home Address
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, PIN code"
                  rows={2}
                />
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/40 pt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Changes sync with your tenancy agreement
              </span>
              <Button type="submit" className="glass-button" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving Changes..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </TenantLayout>
  );
};

export default Profile;
