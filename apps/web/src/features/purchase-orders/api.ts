import type {
  ApiCollectionResponse,
  CancelPurchaseOrderRequest,
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderSummary,
  UpdatePurchaseOrderRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListPurchaseOrdersParams {
  page?: number;
  pageSize?: number;
  status?: PurchaseOrderStatus;
  supplierCompanyId?: string;
  q?: string;
}

export const purchaseOrdersApi = {
  async list(params: ListPurchaseOrdersParams): Promise<ApiCollectionResponse<PurchaseOrderSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<PurchaseOrderSummary>>('/purchase-orders', {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<PurchaseOrder> {
    const { data } = await apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return data;
  },

  async create(request: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>('/purchase-orders', request);
    return data;
  },

  async update(id: string, request: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const { data } = await apiClient.patch<PurchaseOrder>(`/purchase-orders/${id}`, request);
    return data;
  },

  async submit(id: string): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/submit`);
    return data;
  },

  async approve(id: string): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/approve`);
    return data;
  },

  async rejectApproval(id: string): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/reject-approval`);
    return data;
  },

  async send(id: string): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/send`);
    return data;
  },

  async markSupplierConfirmed(id: string): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/supplier-confirm`);
    return data;
  },

  async close(id: string): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/close`);
    return data;
  },

  async cancel(id: string, request: CancelPurchaseOrderRequest): Promise<PurchaseOrder> {
    const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`, request);
    return data;
  },
};
