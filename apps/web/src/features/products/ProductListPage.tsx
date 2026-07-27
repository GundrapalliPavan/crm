import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useBrands } from '@/features/brands/useBrands';
import { useProductCategories } from '@/features/product-categories/useProductCategories';
import { ProductCreateModal } from './ProductCreateModal';
import { useProductsList } from './useProducts';

/** UX.md sections 32-33: name/SKU/category/brand/unit/selling price/active status, searchable by name or SKU. */
export function ProductListPage() {
  const navigate = useNavigate();
  const { data: categories } = useProductCategories();
  const { data: brands } = useBrands();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError } = useProductsList({
    page,
    pageSize: 25,
    q: search || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Products</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">The shared product catalogue.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Product</Button>
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
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load products. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={search || categoryId || brandId ? 'No products match these filters.' : 'No products yet'}
          description={
            search || categoryId || brandId
              ? 'Clear filters or adjust your search.'
              : 'Add your first product to start building the catalogue.'
          }
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Product</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">{product.name}</div>
                      <div className="text-[13px] text-[var(--color-text-secondary)]">{product.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{product.category.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{product.brand?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{product.unit.symbol}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {product.sellingPriceReference ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {product.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
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
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} products)
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

      {isCreateOpen && (
        <ProductCreateModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(product) => {
            setIsCreateOpen(false);
            navigate(`/products/${product.id}`);
          }}
        />
      )}
    </div>
  );
}
