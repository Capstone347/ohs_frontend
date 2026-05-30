import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => adminApi.getPlans(),
  });
}
