import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api, OrdersQueryParams } from '@/services/api';

export function useOrders(params: OrdersQueryParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.getOrders(params),
    placeholderData: keepPreviousData,
  });
}
