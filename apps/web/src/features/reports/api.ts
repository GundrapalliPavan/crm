import type {
  BillingReportQuery,
  BillingReportResponse,
  DashboardResponse,
  InventoryReportQuery,
  InventoryReportResponse,
  LeadsReportQuery,
  LeadsReportResponse,
  OutstandingReportQuery,
  OutstandingReportResponse,
  PurchaseReportQuery,
  PurchaseReportResponse,
  SalesReportQuery,
  SalesReportResponse,
  TeamPerformanceReportQuery,
  TeamPerformanceReportResponse,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';
import { downloadBlob } from '@/lib/api/download-blob';

/** API.md section 111's sync export path. */
async function downloadCsv(path: string, params: object, filename: string): Promise<void> {
  await downloadBlob(path, filename, params);
}

export const reportsApi = {
  async getDashboard(): Promise<DashboardResponse> {
    const { data } = await apiClient.get<DashboardResponse>('/dashboard');
    return data;
  },

  async getLeadsReport(query: LeadsReportQuery): Promise<LeadsReportResponse> {
    const { data } = await apiClient.get<LeadsReportResponse>('/reports/leads', { params: query });
    return data;
  },
  exportLeadsReport: (query: LeadsReportQuery) => downloadCsv('/reports/leads/export', query, 'leads-report.csv'),

  async getSalesReport(query: SalesReportQuery): Promise<SalesReportResponse> {
    const { data } = await apiClient.get<SalesReportResponse>('/reports/sales', { params: query });
    return data;
  },
  exportSalesReport: (query: SalesReportQuery) => downloadCsv('/reports/sales/export', query, 'sales-report.csv'),

  async getInventoryReport(query: InventoryReportQuery): Promise<InventoryReportResponse> {
    const { data } = await apiClient.get<InventoryReportResponse>('/reports/inventory', { params: query });
    return data;
  },
  exportInventoryReport: (query: InventoryReportQuery) =>
    downloadCsv('/reports/inventory/export', query, 'inventory-report.csv'),

  async getPurchaseReport(query: PurchaseReportQuery): Promise<PurchaseReportResponse> {
    const { data } = await apiClient.get<PurchaseReportResponse>('/reports/purchases', { params: query });
    return data;
  },
  exportPurchaseReport: (query: PurchaseReportQuery) =>
    downloadCsv('/reports/purchases/export', query, 'purchase-report.csv'),

  async getBillingReport(query: BillingReportQuery): Promise<BillingReportResponse> {
    const { data } = await apiClient.get<BillingReportResponse>('/reports/billing', { params: query });
    return data;
  },
  exportBillingReport: (query: BillingReportQuery) => downloadCsv('/reports/billing/export', query, 'billing-report.csv'),

  async getOutstandingReport(query: OutstandingReportQuery): Promise<OutstandingReportResponse> {
    const { data } = await apiClient.get<OutstandingReportResponse>('/reports/outstanding', { params: query });
    return data;
  },
  exportOutstandingReport: (query: OutstandingReportQuery) =>
    downloadCsv('/reports/outstanding/export', query, 'outstanding-report.csv'),

  async getTeamPerformanceReport(query: TeamPerformanceReportQuery): Promise<TeamPerformanceReportResponse> {
    const { data } = await apiClient.get<TeamPerformanceReportResponse>('/reports/team-performance', { params: query });
    return data;
  },
  exportTeamPerformanceReport: (query: TeamPerformanceReportQuery) =>
    downloadCsv('/reports/team-performance/export', query, 'team-performance-report.csv'),
};
