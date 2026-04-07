const API_BASE_URL = "http://localhost:8000/api/v1";

// --- Existing interfaces ---

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;
}

interface PlansResponse {
  plans: Plan[];
}

interface CreateOrderRequest {
  plan_id: number;
  user_email: string;
  full_name: string;
  jurisdiction: string;
  is_industry_specific?: boolean;
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
  business_description?: string;
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

// --- New interfaces for dashboard ---

interface AuthUser {
  id: number;
  email: string;
  full_name?: string;
}

interface OrderListItem {
  order_id: number;
  created_at: string;
  order_status: string;
  payment_status: string;
  total_amount: string;
  currency: string;
  jurisdiction: string;
  company_name: string;
  plan_name: string;
  naics_codes: string[];
}

interface OrdersListResponse {
  items: OrderListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface TimelineStep {
  step: string;
  status: "completed" | "current" | "pending";
  timestamp: string | null;
}

interface OrderDetailCompany {
  id: number;
  name: string;
  logo_id: number | null;
  province: string;
  business_description: string | null;
  naics_codes: string[];
}

interface OrderDetail {
  order_id: number;
  created_at: string;
  completed_at: string | null;
  jurisdiction: string;
  total_amount: string;
  is_industry_specific: boolean;
  company: OrderDetailCompany;
  plan_name: string;
  order_status: string;
  payment_status: string;
  currency: string;
  documents: OrderDocument[];
  timeline: TimelineStep[];
  naics_codes: string[];
}

interface OrdersQueryParams {
  query?: string;
  order_status?: string;
  page?: number;
  page_size?: number;
}

// --- Error handling ---

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    const error = await response
      .json()
      .catch(() => ({ error: { message: "Request failed" } }));
    throw new ApiError(
      response.status,
      error.error?.message || error.detail || "Request failed",
      error.error?.details,
    );
  }
  return response.json();
}

function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
  });
}

export const api = {
  // --- Auth methods ---

  async requestOtp(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  async verifyOtp(email: string, otp: string): Promise<{ user: AuthUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse(response);
  },

  async getMe(): Promise<AuthUser> {
    const response = await authFetch(`${API_BASE_URL}/auth/me`);
    return handleResponse<AuthUser>(response);
  },

  async logout(): Promise<{ message: string }> {
    const response = await authFetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });
    return handleResponse(response);
  },

  // --- Dashboard methods ---

  async getOrders(params: OrdersQueryParams = {}): Promise<OrdersListResponse> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set("query", params.query);
    if (params.order_status)
      searchParams.set("order_status", params.order_status);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.page_size)
      searchParams.set("page_size", String(params.page_size));

    const qs = searchParams.toString();
    const response = await authFetch(
      `${API_BASE_URL}/orders${qs ? `?${qs}` : ""}`,
    );
    return handleResponse<OrdersListResponse>(response);
  },

  async getOrderDetail(orderId: number): Promise<OrderDetail> {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}`);
    return handleResponse<OrderDetail>(response);
  },

  // --- Existing methods (updated with authFetch where appropriate) ---

  async getPlans(): Promise<PlansResponse> {
    const response = await fetch(`${API_BASE_URL}/plans`);
    return handleResponse<PlansResponse>(response);
  },

  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<CreateOrderResponse>(response);
  },

  async updateCompanyDetails(
    orderId: number,
    data: UpdateCompanyDetailsRequest,
  ): Promise<OrderSummary> {
    const formData = new FormData();
    formData.append("company_name", data.company_name);
    formData.append("province", data.province);
    formData.append("naics_codes", data.naics_codes);

    if (data.logo) {
      formData.append("logo", data.logo);
    }

    if (data.business_description && data.business_description.trim() !== "") {
      formData.append("business_description", data.business_description);
    }

    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}/company-details`,
      {
        method: "PATCH",
        body: formData,
      },
    );
    return handleResponse<OrderSummary>(response);
  },

  async generatePreview(orderId: number): Promise<GeneratePreviewResponse> {
    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}/generate-preview`,
      {
        method: "POST",
      },
    );
    return handleResponse<GeneratePreviewResponse>(response);
  },

  async downloadPreview(documentId: number): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}/preview`,
    );
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to download preview");
    }
    return response.blob();
  },

  async getDocumentDetails(documentId: number): Promise<DocumentDetails> {
    const response = await authFetch(`${API_BASE_URL}/documents/${documentId}`);
    return handleResponse<DocumentDetails>(response);
  },

  async downloadFinalDocument(
    documentId: number,
    token: string,
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}/download?token=${encodeURIComponent(token)}`,
    );
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to download document");
    }
    return response.blob();
  },

  async downloadOrderDocument(orderId: number, token: string): Promise<Blob> {
    const response = await authFetch(
      `${API_BASE_URL}/orders/${orderId}/download?token=${encodeURIComponent(token)}`,
    );
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to download document");
    }
    return response.blob();
  },

  async getOrderSummary(orderId: number): Promise<OrderSummary> {
    const response = await authFetch(
      `${API_BASE_URL}/orders/${orderId}/summary`,
    );
    return handleResponse<OrderSummary>(response);
  },

  async acceptLegalTerms(
    orderId: number,
    data: LegalAcknowledgmentRequest,
  ): Promise<LegalAcknowledgmentResponse> {
    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}/acknowledge-terms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    return handleResponse<LegalAcknowledgmentResponse>(response);
  },

  async createCheckoutSession(
    orderId: number,
  ): Promise<CreateCheckoutSessionResponse> {
    const response = await fetch(
      `${API_BASE_URL}/payments/orders/${orderId}/create-checkout-session`,
      {
        method: "POST",
      },
    );
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
  AuthUser,
  OrderListItem,
  OrdersListResponse,
  TimelineStep,
  OrderDetail,
  OrderDetailCompany,
  OrdersQueryParams,
};

export { ApiError };
