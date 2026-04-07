import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import UserManagement from "@/pages/UserManagement";
import Dashboard from "@/pages/Dashboard";
import StorageHub from "@/pages/StorageHub";
import Divisions from "@/pages/Divisions";
import VisualAllocation from "@/pages/VisualAllocation";
import ProcurementHub from "@/pages/ProcurementHub";
import ProcurementList from "@/pages/ProcurementList";
import SVPList from "@/pages/SVPList";
import RegularList from "@/pages/RegularList";
import Suppliers from "@/pages/Suppliers";
import UrgentRecords from "@/pages/UrgentRecords";
import ProcurementProcessFlow from "@/pages/ProcurementProcessFlow";
import ProcessFlowChart from "@/pages/ProcessFlowChart";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />

      {/* Procurement Hub — Add | Records | Tracking */}
      <Route path="/procurement" element={<ProtectedRoute><AppLayout><ProcurementHub /></AppLayout></ProtectedRoute>} />
      {/* Legacy redirects */}
      <Route path="/procurement/add" element={<Navigate to="/procurement?tab=add" replace />} />
      <Route path="/procurement/list" element={<ProtectedRoute><AppLayout><ProcurementList /></AppLayout></ProtectedRoute>} />
      <Route path="/procurement/svp" element={<ProtectedRoute><AppLayout><SVPList /></AppLayout></ProtectedRoute>} />
      <Route path="/procurement/regular" element={<ProtectedRoute><AppLayout><RegularList /></AppLayout></ProtectedRoute>} />
      <Route path="/procurement/progress" element={<Navigate to="/procurement?tab=tracking" replace />} />

      {/* Storage Hub — Drawers | Cabinets | Folders | Boxes */}
      <Route path="/storage" element={<ProtectedRoute><AppLayout><StorageHub /></AppLayout></ProtectedRoute>} />
      {/* Legacy redirects */}
      <Route path="/cabinets" element={<Navigate to="/storage?tab=cabinets" replace />} />
      <Route path="/shelves" element={<Navigate to="/storage?tab=drawers" replace />} />
      <Route path="/folders" element={<Navigate to="/storage?tab=folders" replace />} />
      <Route path="/boxes" element={<Navigate to="/storage?tab=boxes" replace />} />

      {/* Other Pages */}
      <Route path="/visual-allocation" element={<ProtectedRoute><AppLayout><VisualAllocation /></AppLayout></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><AppLayout><Suppliers /></AppLayout></ProtectedRoute>} />
      <Route path="/urgent-records" element={<ProtectedRoute><AppLayout><UrgentRecords /></AppLayout></ProtectedRoute>} />
      <Route path="/divisions" element={<ProtectedRoute><AppLayout><Divisions /></AppLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/process-flow" element={<ProtectedRoute><AppLayout><ProcurementProcessFlow /></AppLayout></ProtectedRoute>} />
      <Route path="/flow-chart" element={<ProtectedRoute><AppLayout><ProcessFlowChart /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" expand={false} richColors closeButton />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;