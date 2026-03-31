export interface Plan {
  id: "basic" | "comprehensive" | "sjp_only";
  name: string;
  price: number;
  suitable: string;
  features: string[];
}

export interface IndustryAddOn {
  id: "industry";
  name: string;
  price: number;
  description: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    suitable: "Small business, office",
    features: [
      "Core health and safety policies",
      "Roles and responsibilities",
      "Inspection and incident procedures",
      "Ready-to-use templates",
      "Basic safe work practices",
    ],
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    price: 199,
    suitable: "Businesses wanting to upgrade their manual",
    features: [
      "All Basic content included",
      "Detailed step-by-step procedures",
      "Implementation guides & sample forms",
      "Performance monitoring tools",
      "COR-aligned program structure",
    ],
  },
  {
    id: "sjp_only",
    name: "SJP Only",
    price: 149,
    suitable: "Businesses needing industry-specific safe job procedures only",
    features: [
      "Industry-Specific Safe Job Procedures",
      "Task-specific hazard controls",
      "Procedure-focused deliverable without full manual",
      "Built around your NAICS code",
      "Ready-to-use SJP content",
    ],
  },
];

export const industryAddOn: IndustryAddOn = {
  id: "industry",
  name: "Industry-Specific Add-On",
  price: 100,
  description:
    "Enhance your manual with industry-specific content tailored to your NAICS code",
  features: [
    "Industry-specific policies & risk assessments",
    "Job hazard analysis templates",
    "Training matrix included",
    "Audit-ready documentation",
  ],
};

export const provinces = [
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Prince Edward Island",
];

export const getTOCForPlan = (
  planId: string,
  hasIndustryAddOn: boolean,
): string[] => {
  const basicTOC = [
    "Policy Statement",
    "Roles & Responsibilities",
    "Workplace Inspections",
    "Hazard Identification",
    "Incident Reporting",
    "Training & Orientation",
    "Emergency Procedures",
    "PPE Requirements",
  ];

  const comprehensiveTOC = [
    ...basicTOC,
    "Workplace Violence & Harassment",
    "Return-to-Work / Accommodation",
    "Health & Safety Committee",
    "Performance Monitoring",
  ];

  const sjpOnlyTOC = [
    "Safe Job Procedures Overview",
    "Job Hazard Analysis",
    "Task-Specific Safe Work Procedures",
    "Required PPE by Task",
    "Hazard Controls and Preventive Measures",
    "Worker Training Requirements",
    "Emergency Response for Job Tasks",
    "Industry-Specific Procedure Modules",
  ];

  const industryExtras = [
    "Industry Hazard Modules",
    "Job Hazard Analysis",
    "Safe Work Procedures (Industry)",
    "Training Matrix",
  ];

  if (planId === "sjp_only") {
    return sjpOnlyTOC;
  }

  const baseTOC = planId === "comprehensive" ? comprehensiveTOC : basicTOC;

  if (hasIndustryAddOn) {
    return [...baseTOC, ...industryExtras];
  }

  return baseTOC;
};

export const howItWorksSteps = [
  {
    step: 1,
    icon: "Package",
    title: "Select Program",
    description: "Choose Basic, Comprehensive, or SJP Only",
  },
  {
    step: 2,
    icon: "Image",
    title: "Upload Logo",
    description: "Brand your document with your company logo",
  },
  {
    step: 3,
    icon: "Building2",
    title: "Enter Industry Code",
    description: "Input your NAICS code and province",
  },
  {
    step: 4,
    icon: "FileCheck",
    title: "Preview & Approve",
    description: "Review your Table of Contents and sign",
  },
  {
    step: 5,
    icon: "CreditCard",
    title: "Pay",
    description: "Secure payment via credit card",
  },
  {
    step: 6,
    icon: "Mail",
    title: "Receive Manual",
    description: "Get your editable document by email",
  },
];

export const trustBadges = [
  {
    icon: "MapPin",
    title: "Ontario-First",
    description: "Built for Ontario legislation requirements",
  },
  {
    icon: "FileEdit",
    title: "Editable Deliverables",
    description: "Fully editable DOCX format",
  },
  {
    icon: "Shield",
    title: "Secure Payments",
    description: "PCI-compliant payment processing",
  },
  {
    icon: "CheckCircle",
    title: "Audit-Ready",
    description: "Structured for compliance audits",
  },
];
