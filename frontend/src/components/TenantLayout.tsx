import { ReactNode, cloneElement, isValidElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, Calendar, FileText, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface TenantLayoutProps {
  children: ReactNode;
}

const TenantLayout = ({ children }: TenantLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    }
  };

  const menuItems = [
    { path: "/tenant/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/tenant/bookings", icon: FileText, label: "Bookings" },
    { path: "/tenant/appointments", icon: Calendar, label: "Appointments" },
    { path: "/tenant/profile", icon: User, label: "Profile" },
  ];

  // Pass sidebarOpen state to children
  const childrenWithProps = isValidElement(children) 
    ? cloneElement(children, { sidebarOpen } as any)
    : children;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-full bg-card/95 backdrop-blur-xl border-r border-border/50 
          transition-all duration-300 z-50 glass-card
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <Link to="/" className={`flex items-center space-x-2 ${!sidebarOpen && 'justify-center'}`}>
            {sidebarOpen && <span className="font-bold text-gradient">PG CONNECT</span>}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/20 text-primary font-semibold' 
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                  }
                  ${!sidebarOpen && 'justify-center'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button 
            variant="outline" 
            className={`w-full glass-card ${!sidebarOpen ? 'px-2' : ''}`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {childrenWithProps}
      </main>
    </div>
  );
};

export default TenantLayout;
