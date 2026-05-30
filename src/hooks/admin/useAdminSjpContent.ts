import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useAdminSjpContent(orderId: number | null) {
  return useQuery({
    queryKey: ['admin-sjp-content', orderId],
    queryFn: () => adminApi.getSjpContent(orderId!),
    enabled: orderId != null && !isNaN(orderId),
  });
}
