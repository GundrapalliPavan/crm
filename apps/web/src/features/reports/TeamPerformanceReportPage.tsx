import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { DateRangeFilter } from './DateRangeFilter';
import { defaultDateRange } from './date-defaults';
import { reportsApi } from './api';
import { useTeamPerformanceReport } from './useReports';

/** REPORTS.md section 7 "Comparison" report type: one row per team, side by side. */
export function TeamPerformanceReportPage() {
  const [range, setRange] = useState(defaultDateRange());
  const { data, isLoading, isError } = useTeamPerformanceReport(range);

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Team Performance</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Leads, quotations and sales orders compared across teams.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reportsApi.exportTeamPerformanceReport(range)}>
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
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Converted</th>
                <th className="px-4 py-3">Conversion Rate</th>
                <th className="px-4 py-3">Quotations</th>
                <th className="px-4 py-3">Quotation Value</th>
                <th className="px-4 py-3">Sales Orders</th>
                <th className="px-4 py-3">Sales Order Value</th>
              </tr>
            </thead>
            <tbody>
              {data.teams.map((row) => (
                <tr key={row.teamId} className="border-b border-[var(--color-border-default)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.teamName}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.memberCount}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.leadCount}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.convertedLeadCount}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.conversionRate}%</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.quotationCount}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.quotationValue}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.salesOrderCount}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.salesOrderValue}</td>
                </tr>
              ))}
              {data.teams.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                    No active teams yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
