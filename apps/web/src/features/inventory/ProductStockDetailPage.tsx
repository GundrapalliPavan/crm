import { useState } from 'react';
import { useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useProduct } from '@/features/products/useProducts';
import { AdjustmentModal } from './AdjustmentModal';
import { TransferModal } from './TransferModal';
import { useProductInventory } from './useInventory';

/** A product's stock position across every warehouse (API.md section 57). */
export function ProductStockDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const { data: product, isLoading: isProductLoading, isError: isProductError } = useProduct(productId ?? '');
  const { data: inventory, isLoading: isInventoryLoading, isError: isInventoryError } = useProductInventory(
    productId ?? '',
  );

  if (isProductLoading || isInventoryLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading stock…</p>;
  }

  if (isProductError || isInventoryError || !product) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load stock for this product. Check your connection and try again.
      </div>
    );
  }

  const balances = inventory?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{product.name}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{product.sku}</p>
          {product.minimumStockLevel && (
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Minimum stock level: {product.minimumStockLevel}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsTransferOpen(true)}>
            Transfer
          </Button>
          <Button size="sm" onClick={() => setIsAdjustOpen(true)}>
            Adjust
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3">On Hand</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance) => (
              <tr key={balance.warehouseId} className="border-b border-[var(--color-border-default)] last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{balance.warehouse.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-primary)]">{balance.onHandQuantity}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{balance.reservedQuantity}</td>
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                  {balance.availableQuantity}
                </td>
                <td className="px-4 py-3">
                  {balance.isLowStock ? <Badge tone="warning">Low stock</Badge> : <Badge tone="success">OK</Badge>}
                </td>
              </tr>
            ))}
            {balances.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                  No stock recorded for this product in any warehouse yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdjustOpen && (
        <AdjustmentModal
          productId={product.id}
          onClose={() => setIsAdjustOpen(false)}
          onSuccess={() => setIsAdjustOpen(false)}
        />
      )}
      {isTransferOpen && (
        <TransferModal
          productId={product.id}
          onClose={() => setIsTransferOpen(false)}
          onSuccess={() => setIsTransferOpen(false)}
        />
      )}
    </div>
  );
}
