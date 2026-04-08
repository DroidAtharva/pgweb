import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  sidebarOpen?: boolean;
}

const Navbar = ({ sidebarOpen }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userInitial = user?.email?.charAt(0).toUpperCase() || "";

  const renderUserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer ring-2 ring-offset-2 ring-offset-background ring-primary/50 hover:ring-primary transition-all duration-300 shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
            {userInitial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuItem asChild>
          <Link to="/tenant/profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/tenant/dashboard">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderGuestMenu = () => (
    <div className="flex items-center space-x-2">
      <Link to="/login">
        <Button variant="outline" className="glass-card">
          <User className="w-4 h-4 mr-2" />
          Login
        </Button>
      </Link>
      <Link to="/signup">
        <Button className="glass-button">Get Started</Button>
      </Link>
    </div>
  );

  return (
    <nav
      className={`fixed top-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-card shadow-lg py-3" : "bg-transparent py-6"
      } ${sidebarOpen ? "left-64" : "left-16"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-bold text-gradient">PG CONNECT</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/properties" className="text-foreground hover:text-primary transition-colors">
                Properties
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            {user ? renderUserMenu() : renderGuestMenu()}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 glass-card rounded-lg p-4 space-y-4 bounce-in">
            <Link to="/properties" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Properties
            </Link>
            <Link to="/about" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <div className="border-t border-border/50 pt-4">
              {user ? (
                <div className="space-y-2">
                  <Link to="/tenant/profile" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/tenant/dashboard" className="block py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Button variant="outline" className="w-full glass-card" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full glass-card">
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full glass-button">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
