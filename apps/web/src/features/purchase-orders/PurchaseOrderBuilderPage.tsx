import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { useCompaniesList } from '@/features/companies/useCompanies';
import { useProductsList } from '@/features/products/useProducts';
import { ApiError } from '@/lib/api/api-error';
import { previewTotals } from './calculations';
import { PurchaseOrderItemsEditor } from './PurchaseOrderItemsEditor';
import { EMPTY_PO_LINE, type PurchaseOrderLineDraft } from './purchase-order-line-draft';
import { useCreatePurchaseOrder, usePurchaseOrder, useUpdatePurchaseOrder } from './usePurchaseOrders';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** PURCHASE.md sections 39-40, 43: Supplier -> Products -> Terms -> Review. Doubles as the edit form for a `draft` PO. */
export function PurchaseOrderBuilderPage() {
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams<{ purchaseOrderId?: string }>();
  const isEditing = Boolean(purchaseOrderId);

  const [formError, setFormError] = useState<string | null>(null);
  const [supplierCompanyId, setSupplierCompanyId] = useState('');
  const [poDate, setPoDate] = useState(today());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lines, setLines] = useState<PurchaseOrderLineDraft[]>([EMPTY_PO_LINE]);
  const [hasLoadedExisting, setHasLoadedExisting] = useState(false);

  const { data: existing, isLoading: isLoadingExisting } = usePurchaseOrder(purchaseOrderId ?? '');
  const { data: suppliers } = useCompaniesList({ isSupplier: true, pageSize: 100 });
  const { data: products } = useProductsList({ pageSize: 100, isActive: true });
  const createPurchaseOrder = useCreatePurchaseOrder();
  const updatePurchaseOrder = useUpdatePurchaseOrder(purchaseOrderId ?? '');

  useEffect(() => {
    if (!existing || hasLoadedExisting) return;
    setSupplierCompanyId(existing.supplier.id);
    setPoDate(existing.poDate);
    setExpectedDeliveryDate(existing.expectedDeliveryDate ?? '');
    setNotes(existing.notes ?? '');
    setTerms(existing.terms ?? '');
    setLines(
      existing.items.map((item) => ({
        productId: item.productId,
        orderedQuantity: item.orderedQuantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
      })),
    );
    setHasLoadedExisting(true);
  }, [existing, hasLoadedExisting]);

  const productsById = new Map((products?.data ?? []).map((product) => [product.id, product]));
  const totals = previewTotals(
    lines
      .filter((line) => line.productId)
      .map((line) => ({ ...line, taxRate: productsById.get(line.productId)?.taxRate ?? '0' })),
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const validLines = lines.filter((line) => line.productId && line.orderedQuantity && line.unitPrice);
    if (!supplierCompanyId || validLines.length === 0) {
      setFormError('Choose a supplier and add at least one product line with a unit price.');
      return;
    }

    const items = validLines.map((line) => ({
      productId: line.productId,
      orderedQuantity: line.orderedQuantity,
      unitPrice: line.unitPrice,
      discountPercentage: line.discountPercentage || undefined,
    }));

    try {
      if (isEditing && purchaseOrderId) {
        await updatePurchaseOrder.mutateAsync({
          supplierCompanyId,
          poDate,
          expectedDeliveryDate: expectedDeliveryDate || undefined,
          items,
          notes: notes || undefined,
          terms: terms || undefined,
        });
        navigate(`/purchase-orders/${purchaseOrderId}`);
      } else {
        const order = await createPurchaseOrder.mutateAsync({
          supplierCompanyId,
          poDate,
          expectedDeliveryDate: expectedDeliveryDate || undefined,
          items,
          notes: notes || undefined,
          terms: terms || undefined,
        });
        navigate(`/purchase-orders/${order.id}`);
      }
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [
            ...apiError.fieldErrors('orderedQuantity'),
            ...apiError.fieldErrors('unitPrice'),
            ...apiError.fieldErrors('discountPercentage'),
          ]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  if (isEditing && isLoadingExisting) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading purchase order…</p>;
  }

  const isSaving = createPurchaseOrder.isPending || updatePurchaseOrder.isPending;

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <h1 className="mb-4 font-serif text-2xl font-bold text-[var(--color-text-primary)]">
        {isEditing ? `Edit Purchase Order ${existing?.poNumber ?? ''}` : 'New Purchase Order'}
      </h1>

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
              label="Supplier"
              required
              placeholder="Select a supplier"
              value={supplierCompanyId}
              onChange={(event) => setSupplierCompanyId(event.target.value)}
              options={(suppliers?.data ?? []).map((company) => ({ value: company.id, label: company.name }))}
            />
            <TextField label="PO date" type="date" required value={poDate} onChange={(event) => setPoDate(event.target.value)} />
            <TextField
              label="Expected delivery"
              type="date"
              value={expectedDeliveryDate}
              onChange={(event) => setExpectedDeliveryDate(event.target.value)}
            />
          </div>

          <PurchaseOrderItemsEditor lines={lines} onChange={setLines} products={products?.data ?? []} />

          <div className="ml-auto w-64 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span>{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--color-text-secondary)]">Discount</span>
              <span>{totals.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--color-text-secondary)]">Tax</span>
              <span>{totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-[var(--color-border-default)] pt-2 font-semibold">
              <span>Total</span>
              <span>{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <Textarea label="Terms" value={terms} onChange={(event) => setTerms(event.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(isEditing && purchaseOrderId ? `/purchase-orders/${purchaseOrderId}` : '/purchase-orders')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isSaving ? 'Saving…' : 'Save Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}
