import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { purchaseOrderStatusLabel, purchaseOrderStatusTone } from '@/features/purchase-orders/labels';
import { DateRangeFilter } from './DateRangeFilter';
import { defaultDateRange } from './date-defaults';
import { reportsApi } from './api';
import { usePurchaseReport } from './useReports';

export function PurchaseReportPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState(defaultDateRange());
  const { data, isLoading, isError } = usePurchaseReport(range);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Purchase Report</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Order value by status and supplier.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reportsApi.exportPurchaseReport(range)}>
          Export CSV
        </Button>
      </div>

      <div className="mb-4">
        <DateRangeFilter dateFrom={range.dateFrom} dateTo={range.dateTo} onChange={setRange} />
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load this report. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.overview.totalOrders}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Total orders - {data.overview.totalValue}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.overview.byStatus
                .filter((row) => row.count > 0)
                .map((row) => (
                  <Badge key={row.status} tone={purchaseOrderStatusTone(row.status)}>
                    {purchaseOrderStatusLabel(row.status)}: {row.count}
                  </Badge>
                ))}
            </div>
          </div>

          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">By Supplier</h2>
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {data.bySupplier.map((row) => (
                  <tr
                    key={row.supplierCompanyId}
                    onClick={() => navigate(`/companies/${row.supplierCompanyId}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.supplierName}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.orderCount}</td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{row.totalValue}</td>
                  </tr>
                ))}
                {data.bySupplier.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                      No purchase orders in this date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
