import type {
  ApiCollectionResponse,
  CancelPaymentRequest,
  CreatePaymentRequest,
  Payment,
  PaymentStatus,
  PaymentSummary,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListPaymentsParams {
  page?: number;
  pageSize?: number;
  status?: PaymentStatus;
  customerCompanyId?: string;
  q?: string;
}

export const paymentsApi = {
  async list(params: ListPaymentsParams): Promise<ApiCollectionResponse<PaymentSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<PaymentSummary>>('/payments', { params });
    return data;
  },

  async getById(id: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/${id}`);
    return data;
  },

  async create(request: CreatePaymentRequest): Promise<Payment> {
    const { data } = await apiClient.post<Payment>('/payments', request);
    return data;
  },

  async cancel(id: string, request: CancelPaymentRequest): Promise<Payment> {
    const { data } = await apiClient.post<Payment>(`/payments/${id}/cancel`, request);
    return data;
  },
};
