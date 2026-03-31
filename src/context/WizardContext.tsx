import React, { createContext, useContext, useState, ReactNode } from "react";
import { Plan as MockPlan, industryAddOn } from "@/data/mockData";
import { Plan as ApiPlan } from "@/services/api";

interface WizardState {
  selectedPlan: MockPlan | null;
  hasIndustryAddOn: boolean;
  logoFile: File | null;
  logoPreview: string | null;
  province: string;
  naicsCode: string;
  businessDescription: string;
  companyName: string;
  userEmail: string;
  fullName: string;
  tocGenerated: boolean;
  disclaimerAccepted: boolean;
  signatureName: string;
  signatureDate: string;
  orderId: number | null;
  documentId: number | null;
  apiPlans: ApiPlan[];
}

interface WizardContextType extends WizardState {
  setSelectedPlan: (plan: MockPlan | null) => void;
  setHasIndustryAddOn: (hasAddOn: boolean) => void;
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
  setProvince: (province: string) => void;
  setNaicsCode: (code: string) => void;
  setBusinessDescription: (description: string) => void;
  setCompanyName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setFullName: (name: string) => void;
  setTocGenerated: (generated: boolean) => void;
  setDisclaimerAccepted: (accepted: boolean) => void;
  setSignatureName: (name: string) => void;
  setOrderId: (id: number | null) => void;
  setDocumentId: (id: number | null) => void;
  setApiPlans: (plans: ApiPlan[]) => void;
  resetWizard: () => void;
  getTotalPrice: () => number;
  isSjpOnlyPlan: () => boolean;
  isLogoOptional: () => boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const initialState: WizardState = {
  selectedPlan: null,
  hasIndustryAddOn: false,
  logoFile: null,
  logoPreview: null,
  province: "Ontario",
  naicsCode: "",
  businessDescription: "",
  companyName: "",
  userEmail: "",
  fullName: "",
  tocGenerated: false,
  disclaimerAccepted: false,
  signatureName: "",
  signatureDate: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  orderId: null,
  documentId: null,
  apiPlans: [],
};

export const WizardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<WizardState>(initialState);

  const setSelectedPlan = (plan: MockPlan | null) => {
    setState((prev) => {
      const isSjpOnly = plan?.id === "sjp_only";

      return {
        ...prev,
        selectedPlan: plan,
        hasIndustryAddOn: isSjpOnly ? true : prev.hasIndustryAddOn,
      };
    });
  };

  const setHasIndustryAddOn = (hasAddOn: boolean) => {
    setState((prev) => ({
      ...prev,
      hasIndustryAddOn: prev.selectedPlan?.id === "sjp_only" ? true : hasAddOn,
    }));
  };

  const setLogoFile = (file: File | null) => {
    setState((prev) => ({ ...prev, logoFile: file }));
  };

  const setLogoPreview = (preview: string | null) => {
    setState((prev) => ({ ...prev, logoPreview: preview }));
  };

  const setProvince = (province: string) => {
    setState((prev) => ({ ...prev, province }));
  };

  const setNaicsCode = (code: string) => {
    setState((prev) => ({ ...prev, naicsCode: code }));
  };

  const setBusinessDescription = (description: string) => {
    setState((prev) => ({ ...prev, businessDescription: description }));
  };

  const setCompanyName = (name: string) => {
    setState((prev) => ({ ...prev, companyName: name }));
  };

  const setUserEmail = (email: string) => {
    setState((prev) => ({ ...prev, userEmail: email }));
  };

  const setFullName = (name: string) => {
    setState((prev) => ({ ...prev, fullName: name }));
  };

  const setTocGenerated = (generated: boolean) => {
    setState((prev) => ({ ...prev, tocGenerated: generated }));
  };

  const setDisclaimerAccepted = (accepted: boolean) => {
    setState((prev) => ({ ...prev, disclaimerAccepted: accepted }));
  };

  const setSignatureName = (name: string) => {
    setState((prev) => ({ ...prev, signatureName: name }));
  };

  const setOrderId = (id: number | null) => {
    setState((prev) => ({ ...prev, orderId: id }));
  };

  const setDocumentId = (id: number | null) => {
    setState((prev) => ({ ...prev, documentId: id }));
  };

  const setApiPlans = (plans: ApiPlan[]) => {
    setState((prev) => ({ ...prev, apiPlans: plans }));
  };

  const resetWizard = () => {
    setState(initialState);
  };

  const isSjpOnlyPlan = () => state.selectedPlan?.id === "sjp_only";

  const isLogoOptional = () => isSjpOnlyPlan();

  const getTotalPrice = () => {
    const basePrice = state.selectedPlan?.price || 0;

    if (state.selectedPlan?.id === "sjp_only") {
      return basePrice;
    }

    let total = basePrice;
    if (state.hasIndustryAddOn) {
      total += industryAddOn.price;
    }
    return total;
  };

  return (
    <WizardContext.Provider
      value={{
        ...state,
        setSelectedPlan,
        setHasIndustryAddOn,
        setLogoFile,
        setLogoPreview,
        setProvince,
        setNaicsCode,
        setBusinessDescription,
        setCompanyName,
        setUserEmail,
        setFullName,
        setTocGenerated,
        setDisclaimerAccepted,
        setSignatureName,
        setOrderId,
        setDocumentId,
        setApiPlans,
        resetWizard,
        getTotalPrice,
        isSjpOnlyPlan,
        isLogoOptional,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = (): WizardContextType => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
