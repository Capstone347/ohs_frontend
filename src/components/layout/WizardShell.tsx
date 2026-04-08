import { Outlet, Link, useLocation } from "react-router-dom";
import { X, Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { NaicsInline } from "@/components/ui/naics-inline";

const steps = [
  { number: 1, label: "Program", path: "/app/step-1" },
  { number: 2, label: "Logo", path: "/app/step-2" },
  { number: 3, label: "Industry", path: "/app/step-3" },
  { number: 4, label: "Preview", path: "/app/step-4" },
  { number: 5, label: "Pay", path: "/app/step-5" },
];

export const WizardShell = () => {
  const location = useLocation();
  const {
    selectedPlan,
    hasIndustryAddOn,
    province,
    naicsCodes,
    getTotalPrice,
  } = useWizard();

  const getCurrentStep = () => {
    const match = location.pathname.match(/step-(\d)/);
    return match ? parseInt(match[1]) : 1;
  };

  const currentStep = getCurrentStep();

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "complete";
    if (stepNumber === currentStep) return "active";
    return "inactive";
  };

  return (
    <div className="min-h-screen bg-wizard-bg">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-wizard-border">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="font-heading text-xl text-wizard-text">
            OHS Remote
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-wizard-text-muted hover:text-wizard-text transition-colors"
          >
            <X size={20} />
            <span className="hidden sm:inline text-sm">Exit</span>
          </Link>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-wizard-border py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <Link
                  to={step.path}
                  className={`flex items-center gap-2 ${
                    getStepStatus(step.number) === "inactive"
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  <div
                    className={`step-indicator ${
                      getStepStatus(step.number) === "active"
                        ? "step-indicator-active"
                        : getStepStatus(step.number) === "complete"
                          ? "step-indicator-complete"
                          : "step-indicator-inactive"
                    }`}
                  >
                    {getStepStatus(step.number) === "complete" ? (
                      <Check size={16} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      getStepStatus(step.number) === "active"
                        ? "text-wizard-text"
                        : "text-wizard-text-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                </Link>
                {index < steps.length - 1 && (
                  <div className="w-8 sm:w-12 h-px bg-wizard-border mx-2 sm:mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <Outlet />
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-6 sticky top-24">
              <h3 className="font-heading text-xl text-wizard-text mb-6">
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-wizard-border">
                  <span className="text-wizard-text-muted text-sm">
                    Selected Plan
                  </span>
                  <span className="text-wizard-text font-medium">
                    {selectedPlan?.name || "—"}
                  </span>
                </div>

                {hasIndustryAddOn && (
                  <div className="flex justify-between py-3 border-b border-wizard-border">
                    <span className="text-wizard-text-muted text-sm">
                      Add-On
                    </span>
                    <span className="text-wizard-text font-medium">
                      Industry-Specific
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-3 border-b border-wizard-border">
                  <span className="text-wizard-text-muted text-sm">
                    Province
                  </span>
                  <span className="text-wizard-text font-medium">
                    {province}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-wizard-border gap-4">
                  <span className="text-wizard-text-muted text-sm">
                    NAICS Codes
                  </span>
                  <span className="text-wizard-text font-medium text-right">
                    <NaicsInline codes={naicsCodes} maxInline={2} />
                  </span>
                </div>

                <div className="pt-4 mt-4 border-t border-wizard-border">
                  <div className="flex justify-between items-center">
                    <span className="text-wizard-text font-medium">Total</span>
                    <span className="font-heading text-2xl text-wizard-text">
                      {selectedPlan
                        ? `$${getTotalPrice().toFixed(2)} CAD`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
