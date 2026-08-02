import type { ApiCollectionResponse, SalesOrder, SalesOrderStatus, SalesOrderSummary } from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors ListSalesOrdersQuery on the server - mobile only needs Read (MOBILE_PRD.md 7.6). */
export interface ListSalesOrdersParams {
  page?: number;
  pageSize?: number;
  status?: SalesOrderStatus;
  customerCompanyId?: string;
  q?: string;
}

/** Read-only: mobile has no order create/status-action UI - Orders are reached only via quotation -> convert-to-order. */
export const salesOrdersApi = {
  async list(params: ListSalesOrdersParams): Promise<ApiCollectionResponse<SalesOrderSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<SalesOrderSummary>>('/sales-orders', { params });
    return data;
  },

  async getById(id: string): Promise<SalesOrder> {
    const { data } = await apiClient.get<SalesOrder>(`/sales-orders/${id}`);
    return data;
  },
};
