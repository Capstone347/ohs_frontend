import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "@/context/WizardContext";
import { CreditCard, Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api, ApiError } from "@/services/api";
import PaymentMethodBadges from "@/components/PaymentMethodBadges";
import { industryAddOn } from "@/data/mockData";

const Step5 = () => {
  const navigate = useNavigate();
  const { selectedPlan, hasIndustryAddOn, getTotalPrice, orderId } =
    useWizard();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const totalPrice = getTotalPrice();
  const isSjpOnlySelected = selectedPlan?.id === "industry_specific";

  const handlePay = async () => {
    if (!orderId) {
      toast.error("Order ID not found. Please start over.");
      navigate("/app/step-1");
      return;
    }

    setIsRedirecting(true);

    try {
      const { checkout_url } = await api.createCheckoutSession(orderId);
      window.location.href = checkout_url;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-wizard-text mb-2">
          Complete Your Purchase
        </h1>
        <p className="text-wizard-text-muted text-lg">
          Secure payment via Stripe.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <h3 className="font-heading text-xl text-wizard-text mb-4">
          Order Summary
        </h3>

        <div className="space-y-3 py-4 border-b border-wizard-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-wizard-text font-medium">
                {selectedPlan?.name} Package
              </p>
              <p className="text-wizard-text-muted text-sm">
                {isSjpOnlySelected
                  ? "Industry-specific safe job procedures"
                  : "Health & Safety Manual"}
              </p>
            </div>
            <p className="text-wizard-text font-medium">
              ${Number(selectedPlan?.price ?? 0).toFixed(2)} CAD
            </p>
          </div>

          {isSjpOnlySelected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-wizard-text font-medium">
                  Industry-Specific Content
                </p>
                <p className="text-wizard-text-muted text-sm">
                  Included with SJP Only package
                </p>
              </div>
              <p className="text-wizard-text font-medium">Included</p>
            </div>
          ) : hasIndustryAddOn ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-wizard-text font-medium">
                  Industry-Specific Add-On
                </p>
                <p className="text-wizard-text-muted text-sm">
                  Enhanced compliance documentation
                </p>
              </div>
              <p className="text-wizard-text font-medium">
                ${industryAddOn.price.toFixed(2)} CAD
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between py-4">
          <p className="text-wizard-text font-medium text-lg">Total Due</p>
          <p className="font-heading text-3xl text-wizard-text">
            ${totalPrice.toFixed(2)}{" "}
            <span className="text-base text-wizard-text-muted">CAD</span>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-wizard-text" />
          <h3 className="font-heading text-xl text-wizard-text">Payment</h3>
        </div>

        <p className="text-wizard-text-muted mb-6">
          You'll be redirected to Stripe's secure checkout to complete your
          payment. No card details are collected on this site.
        </p>

        <div className="mb-6">
          <PaymentMethodBadges />
        </div>

        <Button
          onClick={handlePay}
          disabled={isRedirecting}
          size="lg"
          className="w-full h-14 text-lg"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>Pay ${totalPrice.toFixed(2)} CAD</>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 mt-4 text-wizard-text-muted text-sm">
          <Lock className="w-4 h-4" />
          <span>256-bit SSL encrypted</span>
          <span className="mx-1">•</span>
          <ShieldCheck className="w-4 h-4" />
          <span>Powered by Stripe</span>
        </div>
      </motion.div>

      <div className="flex justify-start pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/app/step-4")}
          className="px-8"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default Step5;
