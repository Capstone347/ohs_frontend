import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useAdminStaff() {
  return useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => adminApi.getStaff(),
  });
}
