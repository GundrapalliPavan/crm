import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { leadStatusLabel, leadStatusTone } from '@/features/leads/status';
import { DateRangeFilter } from './DateRangeFilter';
import { defaultDateRange } from './date-defaults';
import { reportsApi } from './api';
import { useLeadsReport } from './useReports';

export function LeadsReportPage() {
  const [range, setRange] = useState(defaultDateRange());
  const { data, isLoading, isError } = useLeadsReport(range);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Leads Report</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Funnel, source performance, and conversion rate.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reportsApi.exportLeadsReport(range)}>
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
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.totalLeads}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">Total leads</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.convertedLeads}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">Converted</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.conversionRate}%</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">Conversion rate</p>
            </div>
          </div>

          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Funnel</h2>
          <div className="mb-6 flex flex-wrap gap-2">
            {data.funnel.map((stage) => (
              <Badge key={stage.status} tone={leadStatusTone(stage.status)}>
                {leadStatusLabel(stage.status)}: {stage.count}
              </Badge>
            ))}
          </div>

          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">By Source</h2>
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Converted</th>
                  <th className="px-4 py-3">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.bySource.map((row) => (
                  <tr key={row.sourceId ?? 'none'} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.sourceName}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.totalLeads}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.convertedLeads}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.conversionRate}%</td>
                  </tr>
                ))}
                {data.bySource.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                      No leads in this date range.
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
