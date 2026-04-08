import { ApiError } from './api';

const API_BASE_URL = 'http://localhost:8000/api/v1/admin';

// --- Types ---

export type AdminRole = 'owner' | 'manager' | 'support';

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: AdminRole;
}

export interface AdminOrderListItem {
  order_id: number;
  created_at: string;
  order_status: string;
  payment_status: string;
  total_amount: string;
  currency: string;
  jurisdiction: string;
  company_name: string;
  plan_name: string;
  user_email: string;
  user_full_name: string;
  is_industry_specific: boolean;
  admin_notes: string | null;
}

export interface AdminOrderDocument {
  document_id: number;
  access_token: string;
  token_expires_at: string;
  generated_at: string;
  file_format: string;
  downloaded_count: number;
}

export interface AdminOrderEmailLog {
  id: number;
  order_id: number;
  recipient_email: string;
  subject: string;
  status: string;
  sent_at: string;
  failure_reason: string | null;
}

export interface AdminOrderDetail {
  order_id: number;
  created_at: string;
  completed_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: number | null;
  jurisdiction: string;
  total_amount: string;
  is_industry_specific: boolean;
  admin_notes: string | null;
  company_name: string;
  plan_name: string;
  order_status: string;
  payment_status: string;
  currency: string;
  user_email: string;
  user_full_name: string;
  documents: AdminOrderDocument[];
  email_logs: AdminOrderEmailLog[];
}

export interface AdminCustomerListItem {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  last_login: string | null;
  order_count: number;
}

export interface AdminPlan {
  id: number;
  slug: string;
  name: string;
  description: string;
  base_price: string;
  requires_approval: boolean;
}

export interface AdminTemplate {
  plan_slug: string;
  filename: string;
  file_size_bytes: number;
  last_modified: string;
}

export interface DashboardStats {
  total_revenue: string;
  total_orders: number;
  orders_by_status: Record<string, number>;
  orders_by_plan: Record<string, number>;
  revenue_by_plan: Record<string, number>;
  pending_review_count: number;
}

export interface EmailLogItem {
  id: number;
  order_id: number;
  recipient_email: string;
  subject: string;
  status: string;
  sent_at: string;
  failure_reason: string | null;
}

export interface AdminStaffItem {
  id: number;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminOrdersQueryParams {
  page?: number;
  page_size?: number;
  order_status?: string;
  payment_status?: string;
  plan_id?: number;
  query?: string;
}

export interface EmailLogsQueryParams {
  page?: number;
  page_size?: number;
  email_status?: string;
  order_id?: number;
}

export interface CreateStaffRequest {
  email: string;
  full_name: string;
  password: string;
  role: AdminRole;
}

// --- Helpers ---

async function handleAdminResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('admin-auth:unauthorized'));
    }
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new ApiError(
      response.status,
      error.error?.message || error.detail || 'Request failed',
      error.error?.details
    );
  }
  return response.json();
}

function adminAuthFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}

function buildParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// --- API ---

export const adminApi = {
  // Auth
  async login(email: string, password: string): Promise<{ admin: AdminUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return handleAdminResponse(response);
  },

  async getMe(): Promise<AdminUser> {
    const response = await adminAuthFetch(`${API_BASE_URL}/auth/me`);
    return handleAdminResponse<AdminUser>(response);
  },

  async logout(): Promise<{ message: string }> {
    const response = await adminAuthFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
    return handleAdminResponse(response);
  },

  async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
    const response = await adminAuthFetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password }),
    });
    return handleAdminResponse(response);
  },

  // Orders
  async getOrders(params: AdminOrdersQueryParams = {}): Promise<PaginatedResponse<AdminOrderListItem>> {
    const response = await adminAuthFetch(`${API_BASE_URL}/orders${buildParams(params)}`);
    return handleAdminResponse(response);
  },

  async getPendingReview(params: { page?: number; page_size?: number } = {}): Promise<PaginatedResponse<AdminOrderListItem>> {
    const response = await adminAuthFetch(`${API_BASE_URL}/orders/pending-review${buildParams(params)}`);
    return handleAdminResponse(response);
  },

  async getOrderDetail(orderId: number): Promise<AdminOrderDetail> {
    const response = await adminAuthFetch(`${API_BASE_URL}/orders/${orderId}`);
    return handleAdminResponse(response);
  },

  async updateOrderNotes(orderId: number, admin_notes: string): Promise<AdminOrderDetail> {
    const response = await adminAuthFetch(`${API_BASE_URL}/orders/${orderId}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes }),
    });
    return handleAdminResponse(response);
  },

  async resendEmail(orderId: number): Promise<{ message: string }> {
    const response = await adminAuthFetch(`${API_BASE_URL}/orders/${orderId}/resend-email`, {
      method: 'POST',
    });
    return handleAdminResponse(response);
  },

  async regenerateDocument(orderId: number): Promise<{ message: string }> {
    const response = await adminAuthFetch(`${API_BASE_URL}/orders/${orderId}/regenerate-document`, {
      method: 'POST',
    });
    return handleAdminResponse(response);
  },

  async approveOrder(orderId: number, admin_notes?: string): Promise<AdminOrderDetail> {
    const response = await adminAuthFetch(`${API_BASE_URL}/orders/${orderId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes }),
    });
    return handleAdminResponse(response);
  },

  // Customers
  async getCustomers(params: { page?: number; page_size?: number; query?: string } = {}): Promise<PaginatedResponse<AdminCustomerListItem>> {
    const response = await adminAuthFetch(`${API_BASE_URL}/customers${buildParams(params)}`);
    return handleAdminResponse(response);
  },

  async getCustomerDetail(userId: number): Promise<AdminCustomerListItem> {
    const response = await adminAuthFetch(`${API_BASE_URL}/customers/${userId}`);
    return handleAdminResponse(response);
  },

  // Plans
  async getPlans(): Promise<AdminPlan[]> {
    const response = await adminAuthFetch(`${API_BASE_URL}/plans`);
    return handleAdminResponse(response);
  },

  async updateApprovalSetting(planId: number, requires_approval: boolean): Promise<AdminPlan> {
    const response = await adminAuthFetch(`${API_BASE_URL}/plans/${planId}/approval-setting`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requires_approval }),
    });
    return handleAdminResponse(response);
  },

  // Templates
  async getTemplates(): Promise<AdminTemplate[]> {
    const response = await adminAuthFetch(`${API_BASE_URL}/templates`);
    return handleAdminResponse(response);
  },

  async uploadTemplate(planSlug: string, file: File): Promise<{ message: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await adminAuthFetch(`${API_BASE_URL}/templates/${planSlug}`, {
      method: 'POST',
      body: formData,
    });
    return handleAdminResponse(response);
  },

  async downloadTemplate(planSlug: string): Promise<Blob> {
    const response = await adminAuthFetch(`${API_BASE_URL}/templates/${planSlug}/download`);
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to download template');
    }
    return response.blob();
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await adminAuthFetch(`${API_BASE_URL}/stats/dashboard`);
    return handleAdminResponse(response);
  },

  // Email Logs
  async getEmailLogs(params: EmailLogsQueryParams = {}): Promise<PaginatedResponse<EmailLogItem>> {
    const response = await adminAuthFetch(`${API_BASE_URL}/logs/emails${buildParams(params)}`);
    return handleAdminResponse(response);
  },

  // Staff
  async getStaff(): Promise<AdminStaffItem[]> {
    const response = await adminAuthFetch(`${API_BASE_URL}/staff`);
    return handleAdminResponse(response);
  },

  async createStaff(data: CreateStaffRequest): Promise<AdminStaffItem> {
    const response = await adminAuthFetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleAdminResponse(response);
  },

  async deactivateStaff(adminId: number): Promise<AdminStaffItem> {
    const response = await adminAuthFetch(`${API_BASE_URL}/staff/${adminId}/deactivate`, {
      method: 'PATCH',
    });
    return handleAdminResponse(response);
  },
};
