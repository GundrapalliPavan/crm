import type { ApiCollectionResponse, AuditLogEntry, ListAuditLogsQuery } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export const auditApi = {
  async list(params: ListAuditLogsQuery): Promise<ApiCollectionResponse<AuditLogEntry>> {
    const { data } = await apiClient.get<ApiCollectionResponse<AuditLogEntry>>('/audit-logs', { params });
    return data;
  },
};
