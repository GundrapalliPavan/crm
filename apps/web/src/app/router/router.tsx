import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { BrandsPage } from '@/features/brands/BrandsPage';
import { CompanyDetailPage } from '@/features/companies/CompanyDetailPage';
import { CompanyListPage } from '@/features/companies/CompanyListPage';
import { CommunicationListPage } from '@/features/communications/CommunicationListPage';
import { CommunicationTemplateListPage } from '@/features/communications/CommunicationTemplateListPage';
import { ContactDetailPage } from '@/features/contacts/ContactDetailPage';
import { ContactListPage } from '@/features/contacts/ContactListPage';
import { FollowUpsPage } from '@/features/follow-ups/FollowUpsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { GoodsReceiptCreatePage } from '@/features/goods-receipts/GoodsReceiptCreatePage';
import { GoodsReceiptDetailPage } from '@/features/goods-receipts/GoodsReceiptDetailPage';
import { GoodsReceiptListPage } from '@/features/goods-receipts/GoodsReceiptListPage';
import { InventoryListPage } from '@/features/inventory/InventoryListPage';
import { ProductStockDetailPage } from '@/features/inventory/ProductStockDetailPage';
import { StockMovementsPage } from '@/features/inventory/StockMovementsPage';
import { InvoiceDetailPage } from '@/features/invoices/InvoiceDetailPage';
import { InvoiceListPage } from '@/features/invoices/InvoiceListPage';
import { LeadDetailPage } from '@/features/leads/LeadDetailPage';
import { LeadListPage } from '@/features/leads/LeadListPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PaymentCreatePage } from '@/features/payments/PaymentCreatePage';
import { PaymentDetailPage } from '@/features/payments/PaymentDetailPage';
import { PaymentListPage } from '@/features/payments/PaymentListPage';
import { ProductCategoriesPage } from '@/features/product-categories/ProductCategoriesPage';
import { ProductDetailPage } from '@/features/products/ProductDetailPage';
import { ProductListPage } from '@/features/products/ProductListPage';
import { PurchaseOrderBuilderPage } from '@/features/purchase-orders/PurchaseOrderBuilderPage';
import { PurchaseOrderDetailPage } from '@/features/purchase-orders/PurchaseOrderDetailPage';
import { PurchaseOrderListPage } from '@/features/purchase-orders/PurchaseOrderListPage';
import { QuotationBuilderPage } from '@/features/quotations/QuotationBuilderPage';
import { QuotationDetailPage } from '@/features/quotations/QuotationDetailPage';
import { QuotationListPage } from '@/features/quotations/QuotationListPage';
import { BillingReportPage } from '@/features/reports/BillingReportPage';
import { DashboardPage } from '@/features/reports/DashboardPage';
import { InventoryReportPage } from '@/features/reports/InventoryReportPage';
import { LeadsReportPage } from '@/features/reports/LeadsReportPage';
import { OutstandingReportPage } from '@/features/reports/OutstandingReportPage';
import { PurchaseReportPage } from '@/features/reports/PurchaseReportPage';
import { SalesReportPage } from '@/features/reports/SalesReportPage';
import { OpportunitiesPage } from '@/features/sales/OpportunitiesPage';
import { SalesOrderDetailPage } from '@/features/sales-orders/SalesOrderDetailPage';
import { SalesOrderListPage } from '@/features/sales-orders/SalesOrderListPage';
import { WarehousesPage } from '@/features/warehouses/WarehousesPage';

/**
 * Route table.
 *
 * CRM, Catalog, Inventory, Sales, Purchase, Billing, Reports and
 * Communication routes exist below "/" - Team Management and Settings are
 * separate modules not yet built (UX.md section 13). "/" redirects to
 * "/dashboard" - the role-aware home screen from Module 7.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadListPage />} />
        <Route path="/leads/:leadId" element={<LeadDetailPage />} />
        <Route path="/contacts" element={<ContactListPage />} />
        <Route path="/contacts/:contactId" element={<ContactDetailPage />} />
        <Route path="/companies" element={<CompanyListPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/categories" element={<ProductCategoriesPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/products/:productId" element={<ProductStockDetailPage />} />
        <Route path="/stock-movements" element={<StockMovementsPage />} />
        <Route path="/warehouses" element={<WarehousesPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/quotations" element={<QuotationListPage />} />
        <Route path="/quotations/new" element={<QuotationBuilderPage />} />
        <Route path="/quotations/:quotationId/edit" element={<QuotationBuilderPage />} />
        <Route path="/quotations/:quotationId" element={<QuotationDetailPage />} />
        <Route path="/sales-orders" element={<SalesOrderListPage />} />
        <Route path="/sales-orders/:salesOrderId" element={<SalesOrderDetailPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
        <Route path="/purchase-orders/new" element={<PurchaseOrderBuilderPage />} />
        <Route path="/purchase-orders/:purchaseOrderId/edit" element={<PurchaseOrderBuilderPage />} />
        <Route path="/purchase-orders/:purchaseOrderId/receive" element={<GoodsReceiptCreatePage />} />
        <Route path="/purchase-orders/:purchaseOrderId" element={<PurchaseOrderDetailPage />} />
        <Route path="/goods-receipts" element={<GoodsReceiptListPage />} />
        <Route path="/goods-receipts/:goodsReceiptId" element={<GoodsReceiptDetailPage />} />
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
        <Route path="/payments" element={<PaymentListPage />} />
        <Route path="/payments/new" element={<PaymentCreatePage />} />
        <Route path="/payments/:paymentId" element={<PaymentDetailPage />} />
        <Route path="/reports/leads" element={<LeadsReportPage />} />
        <Route path="/reports/sales" element={<SalesReportPage />} />
        <Route path="/reports/inventory" element={<InventoryReportPage />} />
        <Route path="/reports/purchases" element={<PurchaseReportPage />} />
        <Route path="/reports/billing" element={<BillingReportPage />} />
        <Route path="/reports/outstanding" element={<OutstandingReportPage />} />
        <Route path="/communications" element={<CommunicationListPage />} />
        <Route path="/communication-templates" element={<CommunicationTemplateListPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
