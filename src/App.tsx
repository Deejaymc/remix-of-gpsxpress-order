import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ServiceOrders from "./pages/ServiceOrders";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Technicians from "./pages/Technicians";
import CompanySettings from "./pages/CompanySettings";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ordens" element={<ProtectedRoute><ServiceOrders /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/produtos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/tecnicos" element={<ProtectedRoute><Technicians /></ProtectedRoute>} />
      <Route path="/empresa" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
