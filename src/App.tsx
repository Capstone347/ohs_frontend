import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WizardProvider } from "@/context/WizardContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Success from "./pages/Success";
import Orders from "./pages/Orders";
import OrderPayment from "./pages/OrderPayment";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

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
        <Sonner position="bottom-right" />
        <BrowserRouter>
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
            <Route path="/app/orders" element={<Orders />} />

            {/* Stripe redirect routes */}
            <Route path="/orders/:orderId/payment" element={<OrderPayment />} />
            <Route path="/orders/:orderId/success" element={<OrderSuccess />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WizardProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
