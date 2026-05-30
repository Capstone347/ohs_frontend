import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useAdminCustomerDetail(userId: number | null) {
  return useQuery({
    queryKey: ['admin-customer', userId],
    queryFn: () => adminApi.getCustomerDetail(userId!),
    enabled: userId != null && !isNaN(userId),
  });
}
