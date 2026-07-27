/**
 * Reports & Analytics module contracts (Module 7 - see REPORTS.md section
 * 148, technical/API.md sections 106-111).
 *
 * Scope for this pass: a role-aware `GET /dashboard` (each section appears
 * only if the actor holds that domain's own `*.read` permission - not
 * branched on role name) plus one dedicated report per domain (Leads,
 * Sales, Inventory, Purchase, Billing, Outstanding), each with CSV export.
 * Team Performance is deferred - `Team`/`TeamMember` exist in the schema but
 * are completely unused (no Team management module exists yet to create or
 * assign one), so reporting on it now would report against permanently-empty
 * data. Branch reports (no Branch entity), Saved/Scheduled Reports and the
 * async large-export job pattern (no queue infra), cross-module attribution/
 * profitability reports, AI summaries/forecasting/anomaly detection, and
 * period-over-period comparison are explicitly deferred - none are backed by
 * the schema yet, depend on infrastructure that doesn't exist, or are
 * explicitly framed as future-platform capability in REPORTS.md itself.
 */

import type { LeadStatus } from './crm';
import type { InvoiceStatus } from './billing';
import type { PurchaseOrderStatus } from './purchase';

export interface ReportDateRangeQuery {
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardLeadsSection {
  totalOpen: number;
  myOpen: number;
  newThisWeek: number;
  conversionRateThisMonth: string;
}

export interface DashboardSalesSection {
  quotationsPendingApproval: number;
  myQuotationsPendingApproval: number;
  confirmedOrdersThisMonth: number;
  revenueThisMonth: string;
}

export interface DashboardPurchaseSection {
  pendingApprovalCount: number;
  openPurchaseOrderCount: number;
}

export interface DashboardInventorySection {
  lowStockCount: number;
}

export interface DashboardBillingSection {
  totalOutstanding: string;
  overdueInvoiceCount: number;
}

/** Only the sections the caller's own permissions unlock are present - API.md section 109-110. */
export interface DashboardResponse {
  leads?: DashboardLeadsSection;
  sales?: DashboardSalesSection;
  purchase?: DashboardPurchaseSection;
  inventory?: DashboardInventorySection;
  billing?: DashboardBillingSection;
}

export interface LeadsReportQuery extends ReportDateRangeQuery {
  userId?: string;
}

export interface LeadFunnelStage {
  status: LeadStatus;
  count: number;
}

export interface LeadSourceBreakdown {
  sourceId: string | null;
  sourceName: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: string;
}

export interface LeadsReportResponse {
  dateFrom: string;
  dateTo: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: string;
  funnel: LeadFunnelStage[];
  bySource: LeadSourceBreakdown[];
}

export interface SalesReportQuery extends ReportDateRangeQuery {
  userId?: string;
  customerId?: string;
}

export interface SalesOverview {
  quotationCount: number;
  quotationValue: string;
  salesOrderCount: number;
  salesOrderValue: string;
}

export interface TopProductRow {
  productId: string;
  sku: string;
  productName: string;
  quantity: string;
  revenue: string;
}

export interface TopCustomerRow {
  companyId: string;
  companyName: string;
  orderCount: number;
  revenue: string;
}

export interface SalesReportResponse {
  dateFrom: string;
  dateTo: string;
  overview: SalesOverview;
  topProducts: TopProductRow[];
  topCustomers: TopCustomerRow[];
}

export interface InventoryReportQuery {
  warehouseId?: string;
  categoryId?: string;
  brandId?: string;
}

export interface WarehouseStockRow {
  warehouseId: string;
  warehouseName: string;
  onHandQuantity: string;
  reservedQuantity: string;
  availableQuantity: string;
}

export interface LowStockRow {
  productId: string;
  sku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  availableQuantity: string;
  minimumStockLevel: string;
}

/** Point-in-time snapshot, not a period metric - no date range (REPORTS.md section 44). */
export interface InventoryReportResponse {
  byWarehouse: WarehouseStockRow[];
  lowStock: LowStockRow[];
}

export interface PurchaseReportQuery extends ReportDateRangeQuery {
  supplierCompanyId?: string;
}

export interface PurchaseStatusBreakdown {
  status: PurchaseOrderStatus;
  count: number;
  value: string;
}

export interface PurchaseOverview {
  totalOrders: number;
  totalValue: string;
  byStatus: PurchaseStatusBreakdown[];
}

export interface SupplierSpendRow {
  supplierCompanyId: string;
  supplierName: string;
  orderCount: number;
  totalValue: string;
}

export interface PurchaseReportResponse {
  dateFrom: string;
  dateTo: string;
  overview: PurchaseOverview;
  bySupplier: SupplierSpendRow[];
}

export interface BillingReportQuery extends ReportDateRangeQuery {
  customerId?: string;
}

export interface InvoiceStatusBreakdown {
  status: InvoiceStatus;
  count: number;
  value: string;
}

export interface InvoiceRegisterSummary {
  totalInvoices: number;
  totalValue: string;
  byStatus: InvoiceStatusBreakdown[];
}

export interface CollectionsSummary {
  totalPayments: number;
  totalCollected: string;
}

export interface BillingReportResponse {
  dateFrom: string;
  dateTo: string;
  invoiceRegister: InvoiceRegisterSummary;
  collections: CollectionsSummary;
}

export interface OutstandingReportQuery {
  customerId?: string;
}

/** BILLING.md section 44 ageing buckets. */
export interface OutstandingCustomerRow {
  companyId: string;
  companyName: string;
  invoiceCount: number;
  totalOutstanding: string;
  current: string;
  days30: string;
  days60: string;
  days90: string;
  daysOver90: string;
}

export interface OutstandingReportResponse {
  asOf: string;
  totalOutstanding: string;
  byCustomer: OutstandingCustomerRow[];
}
