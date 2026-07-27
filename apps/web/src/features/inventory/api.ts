import type {
  ApiCollectionResponse,
  CreateInventoryAdjustmentRequest,
  CreateInventoryTransferRequest,
  InventoryBalance,
  StockMovement,
  StockMovementType,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListInventoryParams {
  page?: number;
  pageSize?: number;
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  q?: string;
  stockStatus?: 'low';
}

export interface ListStockMovementsParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  warehouseId?: string;
  movementType?: StockMovementType;
  dateFrom?: string;
  dateTo?: string;
}

export const inventoryApi = {
  async list(params: ListInventoryParams): Promise<ApiCollectionResponse<InventoryBalance>> {
    const { data } = await apiClient.get<ApiCollectionResponse<InventoryBalance>>('/inventory', { params });
    return data;
  },

  async getProductInventory(productId: string): Promise<{ data: InventoryBalance[] }> {
    const { data } = await apiClient.get<{ data: InventoryBalance[] }>(`/products/${productId}/inventory`);
    return data;
  },

  async listMovements(params: ListStockMovementsParams): Promise<ApiCollectionResponse<StockMovement>> {
    const { data } = await apiClient.get<ApiCollectionResponse<StockMovement>>('/stock-movements', { params });
    return data;
  },

  async createAdjustment(request: CreateInventoryAdjustmentRequest): Promise<InventoryBalance> {
    const { data } = await apiClient.post<InventoryBalance>('/inventory/adjustments', request);
    return data;
  },

  async createTransfer(
    request: CreateInventoryTransferRequest,
  ): Promise<{ from: InventoryBalance; to: InventoryBalance }> {
    const { data } = await apiClient.post<{ from: InventoryBalance; to: InventoryBalance }>(
      '/inventory/transfers',
      request,
    );
    return data;
  },
};
