import { useNavigate } from 'react-router';
import type { DashboardFollowUpItem } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/auth/useAuth';
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

interface AttentionCardProps {
  label: string;
  value: string;
  detail?: string;
  urgent?: boolean;
  onAction: () => void;
}

/** PROJECT.md section 29: the dashboard should answer "what needs attention", not just report a count - urgent items get a danger accent, everything is a click-through. */
function AttentionCard({ label, value, detail, urgent, onAction }: AttentionCardProps) {
  return (
    <button
      type="button"
      onClick={onAction}
      className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-left"
      style={{ borderLeft: `3px solid ${urgent ? 'var(--color-danger)' : 'var(--color-border-strong)'}` }}
    >
      <p className="text-[13px] text-[var(--color-text-secondary)]">{label}</p>
      <p className="text-xl font-semibold text-[var(--color-text-primary)]">
        {value}
        {detail && (
          <span
            className={`ml-2 text-xs font-normal ${urgent ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-secondary)]'}`}
          >
            {detail}
          </span>
        )}
      </p>
    </button>
  );
}

function followUpEntityPath(item: DashboardFollowUpItem): string {
  if (item.leadId) return `/leads/${item.leadId}`;
  if (item.contactId) return `/contacts/${item.contactId}`;
  if (item.companyId) return `/companies/${item.companyId}`;
  return '/follow-ups';
}

/**
 * API.md sections 108-110: one purpose-built endpoint, permission-aware -
 * only the sections the backend actually returned are rendered here, so a
 * Sales Executive naturally sees fewer cards than an Administrator without
 * any role-name branching on the frontend either.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
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

  const hasAnySection = Boolean(
    data.followUps || data.leads || data.sales || data.purchase || data.inventory || data.billing,
  );
  const hasAttentionCard = Boolean(data.followUps || data.sales || data.inventory || data.billing);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Where every day's work starts.</p>
      </div>

      {!hasAnySection && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Nothing to show yet - you don't currently have permission to view any business area.
        </p>
      )}

      {hasAttentionCard && (
        <div className="mb-6">
          <h2 className="mb-3 text-[13px] font-medium text-[var(--color-text-secondary)]">Needs your attention</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.followUps && (
              <AttentionCard
                label="Follow-ups due"
                value={String(data.followUps.dueToday + data.followUps.overdue)}
                detail={data.followUps.overdue > 0 ? `${data.followUps.overdue} overdue` : undefined}
                urgent={data.followUps.overdue > 0}
                onAction={() => navigate('/follow-ups')}
              />
            )}
            {data.sales && (
              <AttentionCard
                label={can('quotation.approve') ? 'Quotations awaiting approval' : 'My quotations awaiting approval'}
                value={String(can('quotation.approve') ? data.sales.quotationsPendingApproval : data.sales.myQuotationsPendingApproval)}
                onAction={() => navigate('/quotations?status=approval_pending')}
              />
            )}
            {data.inventory && (
              <AttentionCard
                label="Low stock items"
                value={String(data.inventory.lowStockCount)}
                urgent={data.inventory.lowStockCount > 0}
                onAction={() => navigate('/inventory?stockStatus=low')}
              />
            )}
            {data.billing && (
              <AttentionCard
                label="Overdue invoices"
                value={String(data.billing.overdueInvoiceCount)}
                detail={data.billing.overdueInvoiceCount > 0 ? data.billing.totalOutstanding : undefined}
                urgent={data.billing.overdueInvoiceCount > 0}
                onAction={() => navigate('/reports/outstanding')}
              />
            )}
          </div>
        </div>
      )}

      {data.followUps && data.followUps.items.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-[13px] font-medium text-[var(--color-text-secondary)]">My work</h2>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            {data.followUps.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-[var(--color-border-default)] px-4 py-3 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">{item.entityLabel}</span>
                  <span className="shrink-0 text-[13px] text-[var(--color-text-secondary)]">{item.followUpType} follow-up</span>
                  {item.isOverdue && (
                    <Badge tone="critical">Overdue</Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(followUpEntityPath(item))}
                  className="shrink-0 text-[13px] font-medium text-[var(--color-info-text)] underline"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.leads || data.sales || data.purchase || data.inventory || data.billing) && (
        <div>
          <h2 className="mb-3 text-[13px] font-medium text-[var(--color-text-secondary)]">Business snapshot</h2>
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
      )}
    </div>
  );
}
