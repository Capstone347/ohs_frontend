import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { isTerminalStatus, OrderStatus } from '@/lib/statusMaps';

export function useOrderDetail(orderId: number | null) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.getOrderDetail(orderId!),
    enabled: orderId != null && !isNaN(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.order_status as OrderStatus | undefined;
      if (!status) return false;
      return isTerminalStatus(status) ? false : 10_000;
    },
  });
}
