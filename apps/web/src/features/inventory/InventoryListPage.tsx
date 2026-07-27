import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useBrands } from '@/features/brands/useBrands';
import { useProductCategories } from '@/features/product-categories/useProductCategories';
import { useWarehouses } from '@/features/warehouses/useWarehouses';
import { AdjustmentModal } from './AdjustmentModal';
import { TransferModal } from './TransferModal';
import { useInventoryList } from './useInventory';

/**
 * UX.md sections 35-36: On Hand / Reserved / Available, with a low-stock
 * indicator - available is always shown, never just on-hand, since reserved
 * stock is not free to sell.
 */
export function InventoryListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: warehouses } = useWarehouses();
  const { data: categories } = useProductCategories();
  const { data: brands } = useBrands();
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('stockStatus') === 'low');
  const [page, setPage] = useState(1);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const { data, isLoading, isError } = useInventoryList({
    page,
    pageSize: 25,
    q: search || undefined,
    warehouseId: warehouseId || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    stockStatus: lowStockOnly ? 'low' : undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Stock</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            On-hand, reserved and available quantities by warehouse.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsTransferOpen(true)}>
            Transfer Stock
          </Button>
          <Button onClick={() => setIsAdjustOpen(true)}>Adjust Stock</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <TextField
            label="Search"
            placeholder="Name or SKU"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
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
        <div className="w-48">
          <Select
            label="Category"
            placeholder="Any category"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            options={(categories?.data ?? []).map((category) => ({ value: category.id, label: category.name }))}
          />
        </div>
        <div className="w-48">
          <Select
            label="Brand"
            placeholder="Any brand"
            value={brandId}
            onChange={(event) => {
              setBrandId(event.target.value);
              setPage(1);
            }}
            options={(brands?.data ?? []).map((brand) => ({ value: brand.id, label: brand.name }))}
          />
        </div>
        <label className="flex h-10 items-center gap-2 text-sm text-[var(--color-text-primary)]">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => {
              setLowStockOnly(event.target.checked);
              setPage(1);
            }}
          />
          Low stock only
        </label>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load stock. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={lowStockOnly ? 'No products are low on stock' : 'No stock recorded yet'}
          description={
            lowStockOnly
              ? 'Every product is at or above its minimum stock level.'
              : 'Stock balances appear once an adjustment or transfer is recorded.'
          }
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">On Hand</th>
                <th className="px-4 py-3">Reserved</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((balance) => (
                  <tr
                    key={`${balance.productId}-${balance.warehouseId}`}
                    onClick={() => navigate(`/inventory/products/${balance.productId}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">{balance.product.name}</div>
                      <div className="text-[13px] text-[var(--color-text-secondary)]">{balance.product.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{balance.warehouse.name}</td>
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
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} balances)
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

      {isAdjustOpen && (
        <AdjustmentModal onClose={() => setIsAdjustOpen(false)} onSuccess={() => setIsAdjustOpen(false)} />
      )}
      {isTransferOpen && (
        <TransferModal onClose={() => setIsTransferOpen(false)} onSuccess={() => setIsTransferOpen(false)} />
      )}
    </div>
  );
}
