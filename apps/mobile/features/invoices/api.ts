import type { ApiCollectionResponse, Invoice, InvoiceStatus, InvoiceSummary } from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors ListInvoicesQuery on the server - mobile only needs Read (MOBILE_PRD.md 7.7). */
export interface ListInvoicesParams {
  page?: number;
  pageSize?: number;
  status?: InvoiceStatus;
  customerCompanyId?: string;
  q?: string;
}

/** Read-only: mobile has no invoice create/issue/cancel UI - "No payment recording from mobile in V1". */
export const invoicesApi = {
  async list(params: ListInvoicesParams): Promise<ApiCollectionResponse<InvoiceSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<InvoiceSummary>>('/invoices', { params });
    return data;
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
    return data;
  },
};
