import { useNavigate } from 'react-router';
import { useDashboard } from './useReports';

interface KpiCardProps {
  title: string;
  metrics: { label: string; value: string }[];
  actionLabel: string;
  onAction: () => void;
}

function KpiCard({ title, metrics, actionLabel, onAction }: KpiCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <button type="button" onClick={onAction} className="text-[13px] font-medium text-[var(--color-info-text)] underline">
          {actionLabel}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{metric.value}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * API.md sections 108-110: one purpose-built endpoint, permission-aware -
 * only the sections the backend actually returned are rendered here, so a
 * Sales Executive naturally sees fewer cards than an Administrator without
 * any role-name branching on the frontend either.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading dashboard…</p>;
  }
  if (isError || !data) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load the dashboard. Check your connection and try again.
      </div>
    );
  }

  const hasAnySection = Boolean(data.leads || data.sales || data.purchase || data.inventory || data.billing);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Where every day's work starts.</p>
      </div>

      {!hasAnySection && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Nothing to show yet - you don't currently have permission to view any business area.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.leads && (
          <KpiCard
            title="Leads"
            metrics={[
              { label: 'Open leads', value: String(data.leads.totalOpen) },
              { label: 'My open leads', value: String(data.leads.myOpen) },
              { label: 'New this week', value: String(data.leads.newThisWeek) },
              { label: 'Conversion this month', value: `${data.leads.conversionRateThisMonth}%` },
            ]}
            actionLabel="View Leads"
            onAction={() => navigate('/leads')}
          />
        )}

        {data.sales && (
          <KpiCard
            title="Sales"
            metrics={[
              { label: 'Quotations pending approval', value: String(data.sales.quotationsPendingApproval) },
              { label: 'Mine pending approval', value: String(data.sales.myQuotationsPendingApproval) },
              { label: 'Orders confirmed this month', value: String(data.sales.confirmedOrdersThisMonth) },
              { label: 'Revenue this month', value: data.sales.revenueThisMonth },
            ]}
            actionLabel="View Sales Report"
            onAction={() => navigate('/reports/sales')}
          />
        )}

        {data.purchase && (
          <KpiCard
            title="Purchase"
            metrics={[
              { label: 'Pending approval', value: String(data.purchase.pendingApprovalCount) },
              { label: 'Open purchase orders', value: String(data.purchase.openPurchaseOrderCount) },
            ]}
            actionLabel="View Purchase Orders"
            onAction={() => navigate('/purchase-orders')}
          />
        )}

        {data.inventory && (
          <KpiCard
            title="Inventory"
            metrics={[{ label: 'Low stock items', value: String(data.inventory.lowStockCount) }]}
            actionLabel="View Low Stock"
            onAction={() => navigate('/inventory?stockStatus=low')}
          />
        )}

        {data.billing && (
          <KpiCard
            title="Billing"
            metrics={[
              { label: 'Total outstanding', value: data.billing.totalOutstanding },
              { label: 'Overdue invoices', value: String(data.billing.overdueInvoiceCount) },
            ]}
            actionLabel="View Outstanding Report"
            onAction={() => navigate('/reports/outstanding')}
          />
        )}
      </div>
    </div>
  );
}
