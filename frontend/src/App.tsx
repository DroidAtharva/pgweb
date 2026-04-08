import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TenantDashboard from "./pages/tenant/Dashboard";
import TenantBookings from "./pages/tenant/Bookings";
import TenantAppointments from "./pages/tenant/Appointments";
import TenantProfile from "./pages/tenant/Profile";
import OwnerDashboard from "./pages/owner/Dashboard";
import ListProperty from "./pages/owner/ListProperty";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/properties" element={<MainLayout><Properties /></MainLayout>} />
          <Route path="/property/:id" element={<MainLayout><PropertyDetails /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route 
            path="/tenant/dashboard" 
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tenant/bookings" 
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tenant/appointments" 
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tenant/profile" 
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/dashboard" 
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/list-property" 
            element={
              <ProtectedRoute requiredRole="owner">
                <ListProperty />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
