import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductCategoryCreateModal } from './ProductCategoryCreateModal';
import { useProductCategories, useUpdateProductCategory } from './useProductCategories';

function CategoryRow({ category }: { category: { id: string; name: string; parent: { name: string } | null; isActive: boolean } }) {
  const updateCategory = useUpdateProductCategory(category.id);

  return (
    <tr className="border-b border-[var(--color-border-default)] last:border-0">
      <td className="px-4 py-3">
        <div className="font-medium text-[var(--color-text-primary)]">{category.name}</div>
        {category.parent && (
          <div className="text-[13px] text-[var(--color-text-secondary)]">Under {category.parent.name}</div>
        )}
      </td>
      <td className="px-4 py-3">
        {category.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="secondary"
          isLoading={updateCategory.isPending}
          onClick={() => void updateCategory.mutateAsync({ isActive: !category.isActive })}
        >
          {category.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </td>
    </tr>
  );
}

/** DATABASE.md section 39: no delete - products keep resolving their category, deactivate instead. */
export function ProductCategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError } = useProductCategories();

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Categories</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Organise the product catalogue.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Category</Button>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load categories. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No categories yet"
          description="Add your first category to start organising products."
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Category</Button>}
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
            <tbody>
              {!isLoading && data?.data.map((category) => <CategoryRow key={category.id} category={category} />)}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <ProductCategoryCreateModal onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
