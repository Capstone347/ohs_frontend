export interface Plan {
  id: 'basic' | 'comprehensive';
  name: string;
  price: number;
  suitable: string;
  features: string[];
}

export interface IndustryAddOn {
  id: 'industry';
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Order {
  id: string;
  date: string;
  plan: string;
  industryAddOn: boolean;
  province: string;
  naics: string;
  status: 'processing' | 'delivered';
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    suitable: 'Small business, office',
    features: [
      'Core health and safety policies',
      'Roles and responsibilities',
      'Inspection and incident procedures',
      'Ready-to-use templates',
      'Basic safe work practices',
    ],
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    price: 199,
    suitable: 'Businesses wanting to upgrade their manual',
    features: [
      'All Basic content included',
      'Detailed step-by-step procedures',
      'Implementation guides & sample forms',
      'Performance monitoring tools',
      'COR-aligned program structure',
    ],
  },
];

export const industryAddOn: IndustryAddOn = {
  id: 'industry',
  name: 'Industry-Specific Add-On',
  price: 100,
  description: 'Enhance your manual with industry-specific content tailored to your NAICS code',
  features: [
    'Industry-specific policies & risk assessments',
    'Job hazard analysis templates',
    'Training matrix included',
    'Audit-ready documentation',
  ],
};

export const provinces = [
  'Ontario',
  'British Columbia',
  'Alberta',
  'Quebec',
  'Manitoba',
  'Saskatchewan',
  'Nova Scotia',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Prince Edward Island',
];

export const getTOCForPlan = (planId: string, hasIndustryAddOn: boolean): string[] => {
  const basicTOC = [
    'Policy Statement',
    'Roles & Responsibilities',
    'Workplace Inspections',
    'Hazard Identification',
    'Incident Reporting',
    'Training & Orientation',
    'Emergency Procedures',
    'PPE Requirements',
  ];

  const comprehensiveTOC = [
    ...basicTOC,
    'Workplace Violence & Harassment',
    'Return-to-Work / Accommodation',
    'Health & Safety Committee',
    'Performance Monitoring',
  ];

  const industryExtras = [
    'Industry Hazard Modules',
    'Job Hazard Analysis',
    'Safe Work Procedures (Industry)',
    'Training Matrix',
  ];

  let baseTOC = planId === 'comprehensive' ? comprehensiveTOC : basicTOC;
  
  if (hasIndustryAddOn) {
    return [...baseTOC, ...industryExtras];
  }
  
  return baseTOC;
};

export const mockOrders: Order[] = [
  {
    id: 'OHS-2026-001234',
    date: 'Jan 14, 2026',
    plan: 'Basic',
    industryAddOn: false,
    province: 'Ontario',
    naics: '23',
    status: 'processing',
  },
  {
    id: 'OHS-2025-000891',
    date: 'Jan 11, 2026',
    plan: 'Comprehensive',
    industryAddOn: true,
    province: 'Ontario',
    naics: '31',
    status: 'delivered',
  },
  {
    id: 'OHS-2025-000456',
    date: 'Dec 28, 2025',
    plan: 'Basic',
    industryAddOn: false,
    province: 'Ontario',
    naics: '54',
    status: 'delivered',
  },
];

export const howItWorksSteps = [
  {
    step: 1,
    icon: 'Package',
    title: 'Select Program',
    description: 'Choose Basic or Comprehensive, add industry options',
  },
  {
    step: 2,
    icon: 'Image',
    title: 'Upload Logo',
    description: 'Brand your manual with your company logo',
  },
  {
    step: 3,
    icon: 'Building2',
    title: 'Enter Industry Code',
    description: 'Input your NAICS code and province',
  },
  {
    step: 4,
    icon: 'FileCheck',
    title: 'Preview & Approve',
    description: 'Review your Table of Contents and sign',
  },
  {
    step: 5,
    icon: 'CreditCard',
    title: 'Pay',
    description: 'Secure payment via credit card',
  },
  {
    step: 6,
    icon: 'Mail',
    title: 'Receive Manual',
    description: 'Get your editable document by email',
  },
];

export const trustBadges = [
  {
    icon: 'MapPin',
    title: 'Ontario-First',
    description: 'Built for Ontario legislation requirements',
  },
  {
    icon: 'FileEdit',
    title: 'Editable Deliverables',
    description: 'Fully editable DOCX format',
  },
  {
    icon: 'Shield',
    title: 'Secure Payments',
    description: 'PCI-compliant payment processing',
  },
  {
    icon: 'CheckCircle',
    title: 'Audit-Ready',
    description: 'Structured for compliance audits',
  },
];
