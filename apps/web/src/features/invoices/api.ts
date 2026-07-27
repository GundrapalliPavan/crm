import type {
  ApiCollectionResponse,
  CancelInvoiceRequest,
  CreateInvoiceFromSalesOrderRequest,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  Invoice,
  InvoiceStatus,
  InvoiceSummary,
  OutstandingInvoice,
  UpdateInvoiceRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListInvoicesParams {
  page?: number;
  pageSize?: number;
  status?: InvoiceStatus;
  customerCompanyId?: string;
  q?: string;
}

export const invoicesApi = {
  async list(params: ListInvoicesParams): Promise<ApiCollectionResponse<InvoiceSummary>> {
    const { data } = await apiClient.get<ApiCollectionResponse<InvoiceSummary>>('/invoices', { params });
    return data;
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
    return data;
  },

  async create(request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
    const { data } = await apiClient.post<CreateInvoiceResponse>('/invoices', request);
    return data;
  },

  async createFromSalesOrder(
    salesOrderId: string,
    request: CreateInvoiceFromSalesOrderRequest,
  ): Promise<CreateInvoiceResponse> {
    const { data } = await apiClient.post<CreateInvoiceResponse>(
      `/sales-orders/${salesOrderId}/create-invoice`,
      request,
    );
    return data;
  },

  async update(id: string, request: UpdateInvoiceRequest): Promise<Invoice> {
    const { data } = await apiClient.patch<Invoice>(`/invoices/${id}`, request);
    return data;
  },

  async issue(id: string): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>(`/invoices/${id}/issue`);
    return data;
  },

  async cancel(id: string, request: CancelInvoiceRequest): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>(`/invoices/${id}/cancel`, request);
    return data;
  },

  async listOutstandingForCompany(companyId: string): Promise<{ data: OutstandingInvoice[] }> {
    const { data } = await apiClient.get<{ data: OutstandingInvoice[] }>(
      `/companies/${companyId}/outstanding-invoices`,
    );
    return data;
  },
};
