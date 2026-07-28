import type {
  ApiCollectionResponse,
  CancelSalesOrderRequest,
  ConfirmSalesOrderResponse,
  CreateSalesOrderRequest,
  SalesOrder,
  SalesOrderStatus,
  SalesOrderSummary,
  UpdateSalesOrderRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListSalesOrdersParams {
  page?: number;
  pageSize?: number;
  status?: SalesOrderStatus;
  customerCompanyId?: string;
  teamId?: string;
  q?: string;
}

export const salesOrdersApi = {
  async list(params: ListSalesOrdersParams): Promise<ApiCollectionResponse<SalesOrderSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<SalesOrderSummary>>('/sales-orders', { params });
    return data;
  },

  async getById(id: string): Promise<SalesOrder> {
    const { data } = await apiClient.get<SalesOrder>(`/sales-orders/${id}`);
    return data;
  },

  async create(request: CreateSalesOrderRequest): Promise<SalesOrder> {
    const { data } = await apiClient.post<SalesOrder>('/sales-orders', request);
    return data;
  },

  async update(id: string, request: UpdateSalesOrderRequest): Promise<SalesOrder> {
    const { data } = await apiClient.patch<SalesOrder>(`/sales-orders/${id}`, request);
    return data;
  },

  async confirm(id: string): Promise<ConfirmSalesOrderResponse> {
    const { data } = await apiClient.post<ConfirmSalesOrderResponse>(`/sales-orders/${id}/confirm`);
    return data;
  },

  async cancel(id: string, request: CancelSalesOrderRequest): Promise<SalesOrder> {
    const { data } = await apiClient.post<SalesOrder>(`/sales-orders/${id}/cancel`, request);
    return data;
  },

  async complete(id: string): Promise<SalesOrder> {
    const { data } = await apiClient.post<SalesOrder>(`/sales-orders/${id}/complete`);
    return data;
  },
};
