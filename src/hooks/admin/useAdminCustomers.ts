import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useAdminCustomers(params: { page?: number; page_size?: number; query?: string } = {}) {
  return useQuery({
    queryKey: ['admin-customers', params],
    queryFn: () => adminApi.getCustomers(params),
    placeholderData: keepPreviousData,
  });
}
