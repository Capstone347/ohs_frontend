import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export function usePendingReview(params: { page?: number; page_size?: number } = {}) {
  return useQuery({
    queryKey: ['pending-review', params],
    queryFn: () => adminApi.getPendingReview(params),
    placeholderData: keepPreviousData,
  });
}
