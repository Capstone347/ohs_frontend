import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi, EmailLogsQueryParams } from '@/services/adminApi';

export function useEmailLogs(params: EmailLogsQueryParams = {}) {
  return useQuery({
    queryKey: ['email-logs', params],
    queryFn: () => adminApi.getEmailLogs(params),
    placeholderData: keepPreviousData,
  });
}
