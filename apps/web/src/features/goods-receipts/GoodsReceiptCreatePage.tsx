import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { usePurchaseOrder } from '@/features/purchase-orders/usePurchaseOrders';
import { useWarehouses } from '@/features/warehouses/useWarehouses';
import { ApiError } from '@/lib/api/api-error';
import { useCreateGoodsReceipt } from './useGoodsReceipts';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ReceiptLineDraft {
  purchaseOrderItemId: string;
  quantityReceived: string;
  rejectedQuantity: string;
}

/** API.md section 73 / PURCHASE.md section 56: records a delivery against a PO's still-pending quantities. */
export function GoodsReceiptCreatePage() {
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState('');
  const [receiptDate, setReceiptDate] = useState(today());
  const [supplierDocumentNumber, setSupplierDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Record<string, ReceiptLineDraft>>({});

  const { data: order, isLoading } = usePurchaseOrder(purchaseOrderId ?? '');
  const { data: warehouses } = useWarehouses();
  const createGoodsReceipt = useCreateGoodsReceipt();

  const pendingItems = (order?.items ?? []).filter(
    (item) => Number(item.orderedQuantity) - Number(item.receivedQuantity) > 0,
  );

  function lineFor(itemId: string, pending: number): ReceiptLineDraft {
    return lines[itemId] ?? { purchaseOrderItemId: itemId, quantityReceived: pending.toString(), rejectedQuantity: '0' };
  }

  function updateLine(itemId: string, pending: number, patch: Partial<ReceiptLineDraft>) {
    setLines((current) => ({ ...current, [itemId]: { ...lineFor(itemId, pending), ...patch } }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const items = pendingItems
      .map((item) => lineFor(item.id, Number(item.orderedQuantity) - Number(item.receivedQuantity)))
      .filter((line) => Number(line.quantityReceived) > 0)
      .map((line) => ({
        purchaseOrderItemId: line.purchaseOrderItemId,
        quantityReceived: line.quantityReceived,
        rejectedQuantity: line.rejectedQuantity !== '0' ? line.rejectedQuantity : undefined,
      }));

    if (!warehouseId || items.length === 0) {
      setFormError('Choose a warehouse and enter a received quantity for at least one item.');
      return;
    }

    try {
      await createGoodsReceipt.mutateAsync({
        purchaseOrderId: purchaseOrderId!,
        warehouseId,
        receiptDate,
        supplierDocumentNumber: supplierDocumentNumber || undefined,
        notes: notes || undefined,
        items,
      });
      navigate(`/purchase-orders/${purchaseOrderId}`);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [...apiError.fieldErrors('quantityReceived'), ...apiError.fieldErrors('rejectedQuantity')]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading purchase order…</p>;
  }
  if (!order) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this purchase order.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <h1 className="mb-1 font-serif text-2xl font-bold text-[var(--color-text-primary)]">Receive Goods</h1>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        Against {order.poNumber} · {order.supplier.name}
      </p>

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

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Warehouse"
              required
              placeholder="Select a warehouse"
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              options={(warehouses?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }))}
            />
            <TextField
              label="Receipt date"
              type="date"
              required
              value={receiptDate}
              onChange={(event) => setReceiptDate(event.target.value)}
            />
            <TextField
              label="Supplier document number"
              value={supplierDocumentNumber}
              onChange={(event) => setSupplierDocumentNumber(event.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)]">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-app)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Pending</th>
                  <th className="w-32 px-3 py-2">Received</th>
                  <th className="w-32 px-3 py-2">Rejected</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item) => {
                  const pending = Number(item.orderedQuantity) - Number(item.receivedQuantity);
                  const line = lineFor(item.id, pending);
                  return (
                    <tr key={item.id} className="border-b border-[var(--color-border-default)] last:border-0">
                      <td className="px-3 py-2">
                        <div className="font-medium text-[var(--color-text-primary)]">{item.productName}</div>
                        <div className="text-[13px] text-[var(--color-text-secondary)]">{item.sku}</div>
                      </td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                        {pending} {item.unit}
                      </td>
                      <td className="px-3 py-2">
                        <TextField
                          label="Quantity received"
                          hideLabel
                          value={line.quantityReceived}
                          onChange={(event) => updateLine(item.id, pending, { quantityReceived: event.target.value })}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <TextField
                          label="Rejected quantity"
                          hideLabel
                          value={line.rejectedQuantity}
                          onChange={(event) => updateLine(item.id, pending, { rejectedQuantity: event.target.value })}
                        />
                      </td>
                    </tr>
                  );
                })}
                {pendingItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[var(--color-text-secondary)]">
                      Every item on this order has already been fully received.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(`/purchase-orders/${purchaseOrderId}`)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createGoodsReceipt.isPending} disabled={pendingItems.length === 0}>
            {createGoodsReceipt.isPending ? 'Saving…' : 'Save Receipt'}
          </Button>
        </div>
      </form>
    </div>
  );
}
