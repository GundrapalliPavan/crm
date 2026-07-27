import type {
  ApiCollectionResponse,
  CancelQuotationRequest,
  CreateQuotationRequest,
  Quotation,
  QuotationStatus,
  QuotationSummary,
  SalesOrder,
  UpdateQuotationRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListQuotationsParams {
  page?: number;
  pageSize?: number;
  status?: QuotationStatus;
  customerCompanyId?: string;
  q?: string;
}

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

  async update(id: string, request: UpdateQuotationRequest): Promise<Quotation> {
    const { data } = await apiClient.patch<Quotation>(`/quotations/${id}`, request);
    return data;
  },

  async submit(id: string): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/submit`);
    return data;
  },

  async approve(id: string): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/approve`);
    return data;
  },

  async rejectApproval(id: string): Promise<Quotation> {
    const { data } = await apiClient.post<Quotation>(`/quotations/${id}/reject-approval`);
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
