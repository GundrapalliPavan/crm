import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { BrandCreateModal } from './BrandCreateModal';
import { useBrands, useUpdateBrand } from './useBrands';

function BrandRow({ brand }: { brand: { id: string; name: string; isActive: boolean } }) {
  const updateBrand = useUpdateBrand(brand.id);

  return (
    <tr className="border-b border-[var(--color-border-default)] last:border-0">
      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{brand.name}</td>
      <td className="px-4 py-3">
        {brand.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="secondary"
          isLoading={updateBrand.isPending}
          onClick={() => void updateBrand.mutateAsync({ isActive: !brand.isActive })}
        >
          {brand.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </td>
    </tr>
  );
}

/** API.md section 53: no delete - products keep resolving their brand, deactivate instead. */
export function BrandsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError } = useBrands();

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Brands</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Manufacturer brands carried in the catalogue.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Brand</Button>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load brands. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No brands yet"
          description="Add your first brand to start tagging products."
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Brand</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>{!isLoading && data?.data.map((brand) => <BrandRow key={brand.id} brand={brand} />)}</tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <BrandCreateModal onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
