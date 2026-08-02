import type { ApiCollectionResponse, Payment, PaymentStatus, PaymentSummary } from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors ListPaymentsQuery on the server - mobile only needs Read (MOBILE_PRD.md 7.7). */
export interface ListPaymentsParams {
  page?: number;
  pageSize?: number;
  status?: PaymentStatus;
  customerCompanyId?: string;
  q?: string;
}

/** Read-only: mobile has no payment record/cancel UI - "No payment recording from mobile in V1". */
export const paymentsApi = {
  async list(params: ListPaymentsParams): Promise<ApiCollectionResponse<PaymentSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<PaymentSummary>>('/payments', { params });
    return data;
  },

  async getById(id: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/${id}`);
    return data;
  },
};
