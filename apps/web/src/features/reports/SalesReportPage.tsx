import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/common/Button';
import { DateRangeFilter } from './DateRangeFilter';
import { defaultDateRange } from './date-defaults';
import { reportsApi } from './api';
import { useSalesReport } from './useReports';

export function SalesReportPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState(defaultDateRange());
  const { data, isLoading, isError } = useSalesReport(range);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Sales Report</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Overview, top products, and top customers.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reportsApi.exportSalesReport(range)}>
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
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.overview.quotationCount}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">Quotations - {data.overview.quotationValue}</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{data.overview.salesOrderCount}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">Sales orders - {data.overview.salesOrderValue}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Top Products</h2>
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((row) => (
                      <tr
                        key={row.productId}
                        onClick={() => navigate(`/products/${row.productId}`)}
                        className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                      >
                        <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">{row.productName}</td>
                        <td className="px-3 py-2 text-[var(--color-text-secondary)]">{row.revenue}</td>
                      </tr>
                    ))}
                    {data.topProducts.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-3 py-6 text-center text-[var(--color-text-secondary)]">
                          No sales in this date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Top Customers</h2>
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topCustomers.map((row) => (
                      <tr
                        key={row.companyId}
                        onClick={() => navigate(`/companies/${row.companyId}`)}
                        className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                      >
                        <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">{row.companyName}</td>
                        <td className="px-3 py-2 text-[var(--color-text-secondary)]">{row.revenue}</td>
                      </tr>
                    ))}
                    {data.topCustomers.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-3 py-6 text-center text-[var(--color-text-secondary)]">
                          No sales in this date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
