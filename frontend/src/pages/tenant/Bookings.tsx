import TenantLayout from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Bookings = () => {
  return (
    <TenantLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 slide-up">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground text-lg">View and manage your property bookings</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Active Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No active bookings found.</p>
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
};

export default Bookings;
