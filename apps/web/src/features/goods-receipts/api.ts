import type { ApiCollectionResponse, CreateGoodsReceiptRequest, GoodsReceipt } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListGoodsReceiptsParams {
  page?: number;
  pageSize?: number;
  purchaseOrderId?: string;
  warehouseId?: string;
}

export const goodsReceiptsApi = {
  async list(params: ListGoodsReceiptsParams): Promise<ApiCollectionResponse<GoodsReceipt>> {
    const { data } = await apiClient.get<ApiCollectionResponse<GoodsReceipt>>('/goods-receipts', { params });
    return data;
  },

  async getById(id: string): Promise<GoodsReceipt> {
    const { data } = await apiClient.get<GoodsReceipt>(`/goods-receipts/${id}`);
    return data;
  },

  async create(request: CreateGoodsReceiptRequest): Promise<GoodsReceipt> {
    const { data } = await apiClient.post<GoodsReceipt>('/goods-receipts', request);
    return data;
  },
};
