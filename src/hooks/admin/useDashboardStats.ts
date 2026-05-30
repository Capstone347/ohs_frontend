import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 60_000,
  });
}
