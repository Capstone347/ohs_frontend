import { useQuery } from '@tanstack/react-query';
import { api, SjpGenerationStatus } from '@/services/api';

export function useSjpStatus(orderId: number | null) {
  return useQuery({
    queryKey: ['sjp-status', orderId],
    queryFn: () => api.getSjpStatus(orderId!),
    enabled: orderId != null && !isNaN(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.status as SjpGenerationStatus | undefined;
      if (!status) return 3000;
      if (status === 'completed' || status === 'failed') return false;
      if (status === 'generating_sjps') return 5000;
      return 3000;
    },
    retry: (failureCount, error) => {
      if (error && 'status' in error && (error as { status: number }).status === 404) {
        return failureCount < 10;
      }
      return failureCount < 3;
    },
    retryDelay: 3000,
  });
}
