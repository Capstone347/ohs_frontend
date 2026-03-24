// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WizardProvider } from "@/context/WizardContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Success from "./pages/Success";
import OrderPayment from "./pages/OrderPayment";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

// Dashboard
import { DashboardShell } from "./components/layout/DashboardShell";
import DashboardOrders from "./pages/dashboard/DashboardOrders";
import OrderDetail from "./pages/dashboard/OrderDetail";

// Wizard
import { WizardShell } from "./components/layout/WizardShell";
import Step1 from "./pages/wizard/Step1";
import Step2 from "./pages/wizard/Step2";
import Step3 from "./pages/wizard/Step3";
import Step4 from "./pages/wizard/Step4";
import Step5 from "./pages/wizard/Step5";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WizardProvider>
        {/* <Toaster /> */}
        <Sonner position="bottom-right" />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />

              {/* Wizard Routes */}
              <Route path="/app" element={<WizardShell />}>
                <Route path="step-1" element={<Step1 />} />
                <Route path="step-2" element={<Step2 />} />
                <Route path="step-3" element={<Step3 />} />
                <Route path="step-4" element={<Step4 />} />
                <Route path="step-5" element={<Step5 />} />
              </Route>

              <Route path="/app/success" element={<Success />} />

              {/* Dashboard Routes (protected) */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardShell /></ProtectedRoute>}>
                <Route path="orders" element={<DashboardOrders />} />
                <Route path="orders/:orderId" element={<OrderDetail />} />
              </Route>

              {/* Redirect old route */}
              <Route path="/app/orders" element={<Navigate to="/dashboard/orders" replace />} />

              {/* Stripe redirect routes */}
              <Route path="/orders/:orderId/payment" element={<OrderPayment />} />
              <Route path="/orders/:orderId/success" element={<OrderSuccess />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </WizardProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
