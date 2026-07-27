import { useState } from 'react';
import { STOCK_MOVEMENT_TYPES, type StockMovementType } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { useProductsList } from '@/features/products/useProducts';
import { useWarehouses } from '@/features/warehouses/useWarehouses';
import { movementTypeLabel, movementTypeTone } from './labels';
import { useStockMovements } from './useInventory';

/** UX.md section 36: Date/Product/Movement/Quantity/Warehouse/Reference/Notes/User. */
export function StockMovementsPage() {
  const { data: products } = useProductsList({ pageSize: 100, isActive: true });
  const { data: warehouses } = useWarehouses();
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [movementType, setMovementType] = useState<StockMovementType | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useStockMovements({
    page,
    pageSize: 25,
    productId: productId || undefined,
    warehouseId: warehouseId || undefined,
    movementType: movementType || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Stock Movements</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          The full ledger behind every stock balance - movements are recorded only as a side effect of an
          adjustment or transfer, never edited or deleted directly.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-56">
          <Select
            label="Product"
            placeholder="Any product"
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              setPage(1);
            }}
            options={(products?.data ?? []).map((product) => ({ value: product.id, label: product.name }))}
          />
        </div>
        <div className="w-48">
          <Select
            label="Warehouse"
            placeholder="Any warehouse"
            value={warehouseId}
            onChange={(event) => {
              setWarehouseId(event.target.value);
              setPage(1);
            }}
            options={(warehouses?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }))}
          />
        </div>
        <div className="w-56">
          <Select
            label="Movement"
            placeholder="Any movement type"
            value={movementType}
            onChange={(event) => {
              setMovementType(event.target.value as StockMovementType | '');
              setPage(1);
            }}
            options={STOCK_MOVEMENT_TYPES.map((value) => ({ value, label: movementTypeLabel(value) }))}
          />
        </div>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load stock movements. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No stock movements yet"
          description="Movements appear here once an adjustment or transfer is recorded."
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Movement</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((movement) => (
                  <tr key={movement.id} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(movement.movementAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">{movement.product.name}</div>
                      <div className="text-[13px] text-[var(--color-text-secondary)]">{movement.product.sku}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={movementTypeTone(movement.movementType)}>
                        {movementTypeLabel(movement.movementType)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{movement.quantityDelta}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{movement.warehouse.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{movement.notes ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {movement.createdBy ? `${movement.createdBy.firstName} ${movement.createdBy.lastName}` : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} movements)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
