import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateGoodsReceiptRequest } from '@crm/types';
import { goodsReceiptsApi, type ListGoodsReceiptsParams } from './api';

const goodsReceiptKeys = {
  all: ['goods-receipts'] as const,
  list: (params: ListGoodsReceiptsParams) => [...goodsReceiptKeys.all, 'list', params] as const,
  detail: (id: string) => [...goodsReceiptKeys.all, 'detail', id] as const,
};

export function useGoodsReceiptsList(params: ListGoodsReceiptsParams) {
  return useQuery({
    queryKey: goodsReceiptKeys.list(params),
    queryFn: () => goodsReceiptsApi.list(params),
  });
}

export function useGoodsReceipt(id: string) {
  return useQuery({
    queryKey: goodsReceiptKeys.detail(id),
    queryFn: () => goodsReceiptsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateGoodsReceiptRequest) => goodsReceiptsApi.create(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      void queryClient.invalidateQueries({ queryKey: ['inventory'] });
      void queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
}
