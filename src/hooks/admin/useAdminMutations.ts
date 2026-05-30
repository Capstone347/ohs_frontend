import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, CreateStaffRequest, EditSjpSectionRequest } from '@/services/adminApi';
import { ApiError } from '@/services/api';
import { toast } from 'sonner';

export function useApproveOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, admin_notes }: { orderId: number; admin_notes?: string }) =>
      adminApi.approveOrder(orderId, admin_notes),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-review'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Order approved successfully.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to approve order.');
    },
  });
}

export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, admin_notes }: { orderId: number; admin_notes: string }) =>
      adminApi.updateOrderNotes(orderId, admin_notes),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      toast.success('Notes saved.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to save notes.');
    },
  });
}

export function useResendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => adminApi.resendEmail(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      toast.success('Delivery email resent.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to resend email.');
    },
  });
}

export function useRegenerateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => adminApi.regenerateDocument(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      toast.success('Document regenerated.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to regenerate document.');
    },
  });
}

export function useToggleApprovalSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, requires_approval }: { planId: number; requires_approval: boolean }) =>
      adminApi.updateApprovalSetting(planId, requires_approval),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan approval setting updated.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update setting.');
    },
  });
}

export function useUpdatePlanPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, base_price }: { planId: number; base_price: string }) =>
      adminApi.updatePlanPrice(planId, base_price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan price updated.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update plan price.');
    },
  });
}

export function useUploadTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planSlug, file }: { planSlug: string; file: File }) =>
      adminApi.uploadTemplate(planSlug, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      toast.success('Template uploaded successfully.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to upload template.');
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffRequest) => adminApi.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff member created.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create staff member.');
    },
  });
}

export function useDeactivateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: number) => adminApi.deactivateStaff(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff member deactivated.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to deactivate staff member.');
    },
  });
}

export function useEditSjpSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tocEntryId, data }: { tocEntryId: number; data: EditSjpSectionRequest }) =>
      adminApi.editSjpSection(tocEntryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sjp-content'] });
      toast.success('SJP section updated.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update SJP section.');
    },
  });
}

export function useRegenerateSjpEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tocEntryId: number) => adminApi.regenerateSjpEntry(tocEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sjp-content'] });
      toast.success('SJP entry regeneration started.');
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to regenerate SJP entry.');
    },
  });
}
