import { useState } from 'react';
import { STOCK_ADJUSTMENT_REASONS, type StockAdjustmentReason } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { useProductsList } from '@/features/products/useProducts';
import { useWarehouses } from '@/features/warehouses/useWarehouses';
import { ApiError } from '@/lib/api/api-error';
import { adjustmentReasonLabel } from './labels';
import { useCreateInventoryAdjustment } from './useInventory';

export interface AdjustmentModalProps {
  /** Preselects and locks the product when opened from a product's own stock page. */
  productId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/** INVENTORY.md sections 41-42, UX.md section 37: Product/Warehouse/Adjustment Quantity/Reason/Notes. */
export function AdjustmentModal({ productId: fixedProductId, onClose, onSuccess }: AdjustmentModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [productId, setProductId] = useState(fixedProductId ?? '');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantityDelta, setQuantityDelta] = useState('');
  const [reason, setReason] = useState<StockAdjustmentReason | ''>('');
  const [notes, setNotes] = useState('');

  const { data: products } = useProductsList({ pageSize: 100, isActive: true });
  const { data: warehouses } = useWarehouses();
  const createAdjustment = useCreateInventoryAdjustment();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!productId || !warehouseId || !quantityDelta || !reason) {
      setFormError('Fill in every field before saving this adjustment.');
      return;
    }

    try {
      await createAdjustment.mutateAsync({ productId, warehouseId, quantityDelta, reason, notes: notes || undefined });
      onSuccess();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError ? apiError.fieldErrors('quantityDelta') : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Adjust Stock" onClose={onClose} size="md">
      <form noValidate onSubmit={(event) => void onSubmit(event)}>
        <div className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
            >
              {formError}
            </div>
          )}

          {!fixedProductId && (
            <Select
              label="Product"
              required
              placeholder="Select a product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              options={(products?.data ?? []).map((product) => ({
                value: product.id,
                label: `${product.name} (${product.sku})`,
              }))}
            />
          )}

          <Select
            label="Warehouse"
            required
            placeholder="Select a warehouse"
            value={warehouseId}
            onChange={(event) => setWarehouseId(event.target.value)}
            options={(warehouses?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }))}
          />

          <TextField
            label="Adjustment quantity"
            required
            helperText="Use a negative number to reduce stock, e.g. -5."
            value={quantityDelta}
            onChange={(event) => setQuantityDelta(event.target.value)}
          />

          <Select
            label="Reason"
            required
            placeholder="Select a reason"
            value={reason}
            onChange={(event) => setReason(event.target.value as StockAdjustmentReason)}
            options={STOCK_ADJUSTMENT_REASONS.map((value) => ({ value, label: adjustmentReasonLabel(value) }))}
          />

          <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createAdjustment.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createAdjustment.isPending}>
            {createAdjustment.isPending ? 'Saving…' : 'Save Adjustment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
