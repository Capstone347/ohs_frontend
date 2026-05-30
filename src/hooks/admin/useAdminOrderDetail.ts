import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useAdminOrderDetail(orderId: number | null) {
  return useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => adminApi.getOrderDetail(orderId!),
    enabled: orderId != null && !isNaN(orderId),
  });
}
