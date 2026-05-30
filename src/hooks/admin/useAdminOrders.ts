import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi, AdminOrdersQueryParams } from '@/services/adminApi';

export function useAdminOrders(params: AdminOrdersQueryParams = {}) {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => adminApi.getOrders(params),
    placeholderData: keepPreviousData,
  });
}
