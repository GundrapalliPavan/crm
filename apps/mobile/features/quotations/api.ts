import type {
  ApiCollectionResponse,
  CancelQuotationRequest,
  CreateQuotationRequest,
  Quotation,
  QuotationStatus,
  QuotationSummary,
  SalesOrder,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

/** Mirrors apps/web/src/features/quotations/api.ts's ListQuotationsParams - same query contract. */
export interface ListQuotationsParams {
  page?: number;
  pageSize?: number;
  status?: QuotationStatus;
  customerCompanyId?: string;
  q?: string;
}

/** The only module that calls `/quotations*` directly - feature code goes through useQuotations.ts. */
export const quotationsApi = {
  async list(params: ListQuotationsParams): Promise<ApiCollectionResponse<QuotationSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<QuotationSummary>>('/quotations', { params });
    return data;
  },

  async getById(id: string): Promise<Quotation> {
    const { data } = await apiClient.get<Quotation>(`/quotations/${id}`);
    return data;
  },

  async create(request: CreateQuotationRequest): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>('/quotations', request);
    return data;
  },

  async submit(id: string): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/submit`);
    return data;
  },

  async send(id: string): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/send`);
    return data;
  },

  async accept(id: string): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/accept`);
    return data;
  },

  async reject(id: string): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/reject`);
    return data;
  },

  async cancel(id: string, request: CancelQuotationRequest): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/cancel`, request);
    return data;
  },

  async convertToOrder(id: string): Promise<SalesOrder> {
    const { data } = await apiClient.post<SalesOrder>(`/quotations/${id}/convert-to-order`);
    return data;
  },
};
