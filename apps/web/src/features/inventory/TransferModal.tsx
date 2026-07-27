import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { useProductsList } from '@/features/products/useProducts';
import { useWarehouses } from '@/features/warehouses/useWarehouses';
import { ApiError } from '@/lib/api/api-error';
import { useCreateInventoryTransfer } from './useInventory';

export interface TransferModalProps {
  /** Preselects and locks the product when opened from a product's own stock page. */
  productId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/** INVENTORY.md sections 36-40 (Transfers, foundation scope): moves stock between two warehouses. */
export function TransferModal({ productId: fixedProductId, onClose, onSuccess }: TransferModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [productId, setProductId] = useState(fixedProductId ?? '');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const { data: products } = useProductsList({ pageSize: 100, isActive: true });
  const { data: warehouses } = useWarehouses();
  const createTransfer = useCreateInventoryTransfer();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
      setFormError('Fill in every field before saving this transfer.');
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      setFormError('Choose two different warehouses.');
      return;
    }

    try {
      await createTransfer.mutateAsync({ productId, fromWarehouseId, toWarehouseId, quantity, notes: notes || undefined });
      onSuccess();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [...apiError.fieldErrors('quantity'), ...apiError.fieldErrors('toWarehouseId')]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  const warehouseOptions = (warehouses?.data ?? []).map((warehouse) => ({
    value: warehouse.id,
    label: warehouse.name,
  }));

  return (
    <Modal title="Transfer Stock" onClose={onClose} size="md">
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
            label="From warehouse"
            required
            placeholder="Select a warehouse"
            value={fromWarehouseId}
            onChange={(event) => setFromWarehouseId(event.target.value)}
            options={warehouseOptions}
          />

          <Select
            label="To warehouse"
            required
            placeholder="Select a warehouse"
            value={toWarehouseId}
            onChange={(event) => setToWarehouseId(event.target.value)}
            options={warehouseOptions}
          />

          <TextField
            label="Quantity"
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />

          <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createTransfer.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createTransfer.isPending}>
            {createTransfer.isPending ? 'Saving…' : 'Save Transfer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
