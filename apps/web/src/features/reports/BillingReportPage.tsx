import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { invoiceStatusLabel, invoiceStatusTone } from '@/features/invoices/labels';
import { DateRangeFilter } from './DateRangeFilter';
import { defaultDateRange } from './date-defaults';
import { reportsApi } from './api';
import { useBillingReport } from './useReports';

export function BillingReportPage() {
  const [range, setRange] = useState(defaultDateRange());
  const { data, isLoading, isError } = useBillingReport(range);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Billing Report</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Invoice register and collections.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reportsApi.exportBillingReport(range)}>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.invoiceRegister.totalInvoices}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Invoices raised - {data.invoiceRegister.totalValue}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.invoiceRegister.byStatus
                .filter((row) => row.count > 0)
                .map((row) => (
                  <Badge key={row.status} tone={invoiceStatusTone(row.status)}>
                    {invoiceStatusLabel(row.status)}: {row.count}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.collections.totalPayments}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Payments recorded - {data.collections.totalCollected}</p>
          </div>
        </div>
      )}
    </div>
  );
}
