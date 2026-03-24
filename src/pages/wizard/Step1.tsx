import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { plans, industryAddOn } from "@/data/mockData";
import { useWizard } from "@/context/WizardContext";
import { Check, Plus, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/services/api";
import { toast } from "sonner";
import { provinceNameToCode } from "@/lib/provinceMapping";

const Step1 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    selectedPlan,
    setSelectedPlan,
    hasIndustryAddOn,
    setHasIndustryAddOn,
    getTotalPrice,
    userEmail,
    fullName,
    province,
    orderId,
    setUserEmail,
    setFullName,
    setOrderId,
    apiPlans,
    setApiPlans,
  } = useWizard();

  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const response = await api.getPlans();
        setApiPlans(response.plans);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast.error("Failed to load plans. Using default plans.");
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, [searchParams, setSelectedPlan]);

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateName = (name: string): boolean => {
    if (!name || name.trim().length === 0) {
      setNameError("Full name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    const isEmailValid = validateEmail(userEmail);
    const isNameValid = validateName(fullName);

    if (!isEmailValid || !isNameValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    // If order already created (user navigated back), just continue
    if (orderId) {
      navigate("/app/step-2");
      return;
    }

    // Find the API plan id (number) for the selected plan
    const apiPlan = apiPlans.find(
      (p) => p.slug === selectedPlan.id || p.name.toLowerCase() === selectedPlan.name.toLowerCase()
    );
    const planId = apiPlan?.id;

    if (!planId) {
      toast.error("Could not determine plan. Please try again.");
      return;
    }

    setIsCreatingOrder(true);
    try {
      const response = await api.createOrder({
        plan_id: planId,
        user_email: userEmail,
        full_name: fullName,
        jurisdiction: provinceNameToCode(province),
      });
      setOrderId(response.order_id);
      navigate("/app/step-2");
    } catch (error) {
      console.error("Failed to create order:", error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create order. Please try again.");
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const displayPlans = apiPlans && apiPlans.length > 0
    ? apiPlans.map((ap) => {
        const mockMatch = plans.find((p) => p.id === ap.slug || p.name.toLowerCase() === ap.name.toLowerCase());
        return {
          id: ap.slug as 'basic' | 'comprehensive',
          name: ap.name,
          price: parseFloat(ap.base_price) || 0,
          suitable: ap.description,
          features: mockMatch?.features ?? [],
        };
      })
    : plans;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-wizard-text mb-2">
          Select Your H&S Program
        </h1>
        <p className="text-wizard-text-muted text-lg">
          Choose the package that best fits your business needs.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <h3 className="font-heading text-xl text-wizard-text mb-4">
          Your Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-wizard-text mb-2">
              Full Name <span className="text-error">*</span>
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameError) validateName(e.target.value);
              }}
              className={cn(
                "h-12 bg-white border-wizard-border text-wizard-text",
                nameError && "border-error focus:border-error focus:ring-error",
              )}
            />
            {nameError && (
              <p className="text-error text-sm mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-wizard-text mb-2">
              Email Address <span className="text-error">*</span>
            </label>
            <Input
              type="email"
              placeholder="john@company.com"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              className={cn(
                "h-12 bg-white border-wizard-border text-wizard-text",
                emailError &&
                  "border-error focus:border-error focus:ring-error",
              )}
            />
            {emailError && (
              <p className="text-error text-sm mt-1">{emailError}</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-wizard-text-muted uppercase tracking-wide">
          Step 1: Choose Your Base Package
        </p>

        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          displayPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  "plan-card w-full text-left",
                  selectedPlan?.id === plan.id && "plan-card-selected",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-heading text-2xl text-wizard-text">
                        {plan.name}
                      </h3>
                      {selectedPlan?.id === plan.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <p className="text-wizard-text-muted text-sm mb-4">
                      Most suitable for: {plan.suitable}
                    </p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-wizard-text-muted"
                        >
                          <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-heading text-3xl text-wizard-text">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-wizard-text-muted text-sm block">
                      CAD
                    </span>
                  </div>
                </div>
              </button>
            </motion.div>
          ))
        )}
      </div>

      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <p className="text-sm font-medium text-wizard-text-muted uppercase tracking-wide">
            Step 2: Enhance Your Package (Optional)
          </p>

          <button
            type="button"
            onClick={() => setHasIndustryAddOn(!hasIndustryAddOn)}
            className={cn(
              "w-full text-left rounded-xl border-2 p-6 transition-all duration-200",
              hasIndustryAddOn
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border-light bg-white hover:border-primary/50 hover:shadow-md",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      hasIndustryAddOn ? "bg-primary" : "bg-primary/10",
                    )}
                  >
                    {hasIndustryAddOn ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <h3 className="font-heading text-xl text-wizard-text">
                    {industryAddOn.name}
                  </h3>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </span>
                </div>

                <p className="text-wizard-text-muted text-sm mb-4">
                  {industryAddOn.description}
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {industryAddOn.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-wizard-text-muted"
                    >
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-heading text-2xl text-wizard-text">
                  +${industryAddOn.price}
                </span>
                <span className="text-wizard-text-muted text-sm block">
                  CAD
                </span>
              </div>
            </div>
          </button>
        </motion.div>
      )}

      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bg-surface rounded-xl p-6 border border-border-dark"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Your Selection</p>
              <p className="text-text-light font-medium">
                {selectedPlan.name}
                {hasIndustryAddOn && " + Industry-Specific Add-On"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-text-muted text-sm">Total</p>
              <p className="font-heading text-3xl text-text-light">
                ${getTotalPrice().toFixed(2)}{" "}
                <span className="text-sm text-text-muted">CAD</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          disabled={!userEmail || !fullName || !selectedPlan || isCreatingOrder}
          size="lg"
          className="px-8"
        >
          {isCreatingOrder ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Order...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step1;
