import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FileAttachmentsSection } from '@/features/files/FileAttachmentsSection';
import { useArchiveProduct, useProduct } from './useProducts';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(productId ?? '');
  const archiveProduct = useArchiveProduct();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading product…</p>;
  }

  if (isError || !product) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this product. Check your connection and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{product.name}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{product.sku}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{product.category.name}</Badge>
              {product.brand && <Badge tone="neutral">{product.brand.name}</Badge>}
              {product.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge>}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsArchiveOpen(true)}>
            Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5 text-sm">
        <div>
          <p className="text-[var(--color-text-secondary)]">Unit</p>
          <p className="text-[var(--color-text-primary)]">
            {product.unit.name} ({product.unit.symbol})
          </p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">HSN code</p>
          <p className="text-[var(--color-text-primary)]">{product.hsnCode ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Tax rate</p>
          <p className="text-[var(--color-text-primary)]">{product.taxRate}%</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Minimum stock level</p>
          <p className="text-[var(--color-text-primary)]">{product.minimumStockLevel ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Selling price (reference)</p>
          <p className="text-[var(--color-text-primary)]">{product.sellingPriceReference ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Purchase price (reference)</p>
          <p className="text-[var(--color-text-primary)]">{product.purchasePriceReference ?? '—'}</p>
        </div>
        {product.description && (
          <div className="col-span-2">
            <p className="text-[var(--color-text-secondary)]">Description</p>
            <p className="text-[var(--color-text-primary)]">{product.description}</p>
          </div>
        )}
      </div>

      <FileAttachmentsSection relatedEntityType="product" relatedEntityId={product.id} />

      {isArchiveOpen && (
        <ConfirmDialog
          title="Archive product?"
          description="This product will no longer appear in the default list. Historical documents that reference it are unaffected."
          confirmLabel="Archive"
          destructive
          isConfirming={archiveProduct.isPending}
          onConfirm={() => void archiveProduct.mutateAsync(product.id).then(() => navigate('/products'))}
          onCancel={() => setIsArchiveOpen(false)}
        />
      )}
    </div>
  );
}
