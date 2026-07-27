import { Button } from '@/components/common/Button';
import { reportsApi } from './api';
import { useInventoryReport } from './useReports';

/** REPORTS.md section 44: a point-in-time snapshot, not a period metric - no date range here. */
export function InventoryReportPage() {
  const { data, isLoading, isError } = useInventoryReport({});

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Inventory Report</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Stock by warehouse and low-stock items, as of now.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reportsApi.exportInventoryReport({})}>
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
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">By Warehouse</h2>
          <div className="mb-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">On Hand</th>
                  <th className="px-4 py-3">Reserved</th>
                  <th className="px-4 py-3">Available</th>
                </tr>
              </thead>
              <tbody>
                {data.byWarehouse.map((row) => (
                  <tr key={row.warehouseId} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.warehouseName}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.onHandQuantity}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.reservedQuantity}</td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{row.availableQuantity}</td>
                  </tr>
                ))}
                {data.byWarehouse.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                      No stock recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Low Stock</h2>
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Minimum</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((row) => (
                  <tr key={`${row.productId}-${row.warehouseId}`} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">{row.productName}</div>
                      <div className="text-[13px] text-[var(--color-text-secondary)]">{row.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.warehouseName}</td>
                    <td className="px-4 py-3 text-[var(--color-danger-text)]">{row.availableQuantity}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.minimumStockLevel}</td>
                  </tr>
                ))}
                {data.lowStock.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                      Nothing is below its minimum stock level.
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
