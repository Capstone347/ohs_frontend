import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function useAdminTemplates() {
  return useQuery({
    queryKey: ['admin-templates'],
    queryFn: () => adminApi.getTemplates(),
  });
}
