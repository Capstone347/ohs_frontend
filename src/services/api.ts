const API_BASE_URL = 'http://localhost:8000/api/v1';

interface Plan {
  plan_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  features: string[];
}

interface RequestOtpRequest {
  email: string;
}

interface PlansResponse {
  plans: Plan[];
}

interface CreateOrderRequest {
  plan_id: number;
  user_email: string;
  full_name: string;
  jurisdiction: string;
}

interface CreateOrderResponse {
  order_id: number;
  status: string;
  created_at: string;
  message: string;
}

interface UpdateCompanyDetailsRequest {
  company_name: string;
  province: string;
  naics_codes: string;
  logo?: File;
}

interface OrderDocument {
  document_id: number;
  access_token: string;
  token_expires_at: string;
  generated_at: string;
  file_format: string;
}

interface OrderSummary {
  order_id: number;
  user_email: string;
  full_name: string;
  jurisdiction: string;
  company_name: string;
  province: string;
  naics_codes: string[];
  status: string;
  payment_status: string;
  plan: {
    plan_id: number;
    name: string;
    description: string;
    price: number;
  };
  documents: OrderDocument[];
  created_at: string;
  updated_at: string;
}

interface GeneratePreviewResponse {
  document_id: number;
  order_id: number;
  message: string;
  generated_at: string;
}

interface DocumentDetails {
  document_id: number;
  order_id: number;
  file_format: string;
  file_path: string;
  access_token: string;
  token_expires_at: string;
  generated_at: string;
}

interface LegalAcknowledgmentRequest {
  jurisdiction: string;
  content: string;
  version?: number;
}

interface LegalAcknowledgmentResponse {
  order_id: number;
  jurisdiction: string;
  content: string;
  version: number;
  acknowledged_at: string;
  message: string;
}

interface CreateCheckoutSessionResponse {
  checkout_session_id: string;
  checkout_url: string;
}

interface StripeConfigResponse {
  publishable_key: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new ApiError(
      response.status,
      error.error?.message || 'Request failed',
      error.error?.details
    );
  }
  return response.json();
}

export const api = {
  async getPlans(): Promise<PlansResponse> {
    const response = await fetch(`${API_BASE_URL}/plans`);
    return handleResponse<PlansResponse>(response);
  },

  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<CreateOrderResponse>(response);
  },
  async requestOtp(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: { message: 'Request failed' } }));

    throw new ApiError(
      response.status,
      error.error?.message || 'Request failed',
      error.error?.details
    );
  }
  },

  
  async updateCompanyDetails(
    orderId: number,
    data: UpdateCompanyDetailsRequest
  ): Promise<OrderSummary> {
    const formData = new FormData();
    formData.append('company_name', data.company_name);
    formData.append('province', data.province);
    formData.append('naics_codes', data.naics_codes);
    if (data.logo) {
      formData.append('logo', data.logo);
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/company-details`, {
      method: 'PATCH',
      body: formData,
    });
    return handleResponse<OrderSummary>(response);
  },

  async generatePreview(orderId: number): Promise<GeneratePreviewResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/generate-preview`, {
      method: 'POST',
    });
    return handleResponse<GeneratePreviewResponse>(response);
  },

  async downloadPreview(documentId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/preview`);
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to download preview');
    }
    return response.blob();
  },

  async getDocumentDetails(documentId: number): Promise<DocumentDetails> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
    return handleResponse<DocumentDetails>(response);
  },

  async downloadFinalDocument(documentId: number, token: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}/download?token=${token}`
    );
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to download document');
    }
    return response.blob();
  },

  async downloadOrderDocument(orderId: number, token: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}/download?token=${token}`
    );
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to download document');
    }
    return response.blob();
  },

  async getOrderSummary(orderId: number): Promise<OrderSummary> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/summary`);
    return handleResponse<OrderSummary>(response);
  },

  async acceptLegalTerms(orderId: number, data: LegalAcknowledgmentRequest): Promise<LegalAcknowledgmentResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/acknowledge-terms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<LegalAcknowledgmentResponse>(response);
  },

  async createCheckoutSession(orderId: number): Promise<CreateCheckoutSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/orders/${orderId}/create-checkout-session`, {
      method: 'POST',
    });
    return handleResponse<CreateCheckoutSessionResponse>(response);
  },

  async getStripeConfig(): Promise<StripeConfigResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/stripe/config`);
    return handleResponse<StripeConfigResponse>(response);
  },

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};

export type {
  Plan,
  PlansResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateCompanyDetailsRequest,
  OrderSummary,
  OrderDocument,
  GeneratePreviewResponse,
  DocumentDetails,
  LegalAcknowledgmentRequest,
  LegalAcknowledgmentResponse,
  CreateCheckoutSessionResponse,
  StripeConfigResponse,
};

export { ApiError };
