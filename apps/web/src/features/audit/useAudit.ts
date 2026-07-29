import { useQuery } from '@tanstack/react-query';
import type { ListAuditLogsQuery } from '@crm/types';
import { auditApi } from './api';

const auditKeys = {
  all: ['audit-logs'] as const,
  list: (query: ListAuditLogsQuery) => [...auditKeys.all, 'list', query] as const,
};

export function useAuditLogs(query: ListAuditLogsQuery) {
  return useQuery({
    queryKey: auditKeys.list(query),
    queryFn: () => auditApi.list(query),
  });
}
