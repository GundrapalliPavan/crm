import { useNavigate } from 'react-router';
import { Button } from '@/components/common/Button';
import { reportsApi } from './api';
import { useOutstandingReport } from './useReports';

/** BILLING.md section 44: organisation-wide, not scoped to one customer, unlike GET /companies/{id}/outstanding-invoices. */
export function OutstandingReportPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOutstandingReport({});

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Outstanding Report</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {data ? `As of ${data.asOf}` : 'Amount still payable by each customer, aged by due date.'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reportsApi.exportOutstandingReport({})}>
          Export CSV
        </Button>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load this report. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.totalOutstanding}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Total outstanding across all customers</p>
          </div>

          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Invoices</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Current</th>
                  <th className="px-4 py-3">1-30</th>
                  <th className="px-4 py-3">31-60</th>
                  <th className="px-4 py-3">61-90</th>
                  <th className="px-4 py-3">90+</th>
                </tr>
              </thead>
              <tbody>
                {data.byCustomer.map((row) => (
                  <tr
                    key={row.companyId}
                    onClick={() => navigate(`/companies/${row.companyId}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.companyName}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.invoiceCount}</td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.totalOutstanding}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.current}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.days30}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.days60}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.days90}</td>
                    <td className="px-4 py-3 text-[var(--color-danger-text)]">{row.daysOver90}</td>
                  </tr>
                ))}
                {data.byCustomer.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                      Nothing outstanding right now.
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
