
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import TenantLayout from "@/components/TenantLayout";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();

  // Pages where the tenant layout should be applied if the user is a tenant
  const tenantPages = ["/", "/properties", "/property/:id", "/about", "/contact"];
  
  const isTenantPage = tenantPages.some(page => {
    if (page.includes("/:id")) {
      return location.pathname.startsWith(page.split("/:id")[0]);
    }
    return location.pathname === page;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && userRole === 'tenant' && isTenantPage) {
    return <TenantLayout>{children}</TenantLayout>;
  }

  return <>{children}</>;
};

export default MainLayout;
