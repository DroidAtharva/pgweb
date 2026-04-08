import TenantLayout from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const Appointments = () => {
  return (
    <TenantLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 slide-up">
          <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground text-lg">View your scheduled property visits</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No scheduled appointments.</p>
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
};

export default Appointments;
