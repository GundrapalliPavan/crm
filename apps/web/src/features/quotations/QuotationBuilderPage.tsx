import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { useCompaniesList, useCompanyContacts } from '@/features/companies/useCompanies';
import { useProductsList } from '@/features/products/useProducts';
import { ApiError } from '@/lib/api/api-error';
import { previewTotals } from './calculations';
import { QuotationItemsEditor } from './QuotationItemsEditor';
import { EMPTY_LINE, type QuotationLineDraft } from './quotation-line-draft';
import { useCreateQuotation, useQuotation, useUpdateQuotation } from './useQuotations';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * UX.md sections 38-40: Customer -> Products -> Pricing -> Tax/Discount ->
 * Terms -> Review, totals always visible. Doubles as the edit form for a
 * `draft` quotation (SALES.md section 29: drafts must remain editable) -
 * `quotationId` present in the route means edit mode.
 */
export function QuotationBuilderPage() {
  const navigate = useNavigate();
  const { quotationId } = useParams<{ quotationId?: string }>();
  const isEditing = Boolean(quotationId);

  const [formError, setFormError] = useState<string | null>(null);
  const [customerCompanyId, setCustomerCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [quotationDate, setQuotationDate] = useState(today());
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lines, setLines] = useState<QuotationLineDraft[]>([EMPTY_LINE]);
  const [hasLoadedExisting, setHasLoadedExisting] = useState(false);

  const { data: existing, isLoading: isLoadingExisting } = useQuotation(quotationId ?? '');
  const { data: companies } = useCompaniesList({ isCustomer: true, pageSize: 100 });
  const { data: contacts } = useCompanyContacts(customerCompanyId);
  const { data: products } = useProductsList({ pageSize: 100, isActive: true });
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation(quotationId ?? '');

  useEffect(() => {
    if (!existing || hasLoadedExisting) return;
    setCustomerCompanyId(existing.customer.id);
    setContactId(existing.contact?.id ?? '');
    setQuotationDate(existing.quotationDate);
    setValidUntil(existing.validUntil ?? '');
    setNotes(existing.notes ?? '');
    setTerms(existing.terms ?? '');
    setLines(
      existing.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
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

    const validLines = lines.filter((line) => line.productId && line.quantity);
    if (!customerCompanyId || validLines.length === 0) {
      setFormError('Choose a customer and add at least one product line.');
      return;
    }

    const items = validLines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice || undefined,
      discountPercentage: line.discountPercentage || undefined,
    }));

    try {
      if (isEditing && quotationId) {
        await updateQuotation.mutateAsync({
          customerCompanyId,
          contactId: contactId || undefined,
          quotationDate,
          validUntil: validUntil || undefined,
          items,
          notes: notes || undefined,
          terms: terms || undefined,
        });
        navigate(`/quotations/${quotationId}`);
      } else {
        const quotation = await createQuotation.mutateAsync({
          customerCompanyId,
          contactId: contactId || undefined,
          quotationDate,
          validUntil: validUntil || undefined,
          items,
          notes: notes || undefined,
          terms: terms || undefined,
        });
        navigate(`/quotations/${quotation.id}`);
      }
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [...apiError.fieldErrors('quantity'), ...apiError.fieldErrors('unitPrice'), ...apiError.fieldErrors('discountPercentage')]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  if (isEditing && isLoadingExisting) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading quotation…</p>;
  }

  const isSaving = createQuotation.isPending || updateQuotation.isPending;

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <h1 className="mb-4 font-serif text-2xl font-bold text-[var(--color-text-primary)]">
        {isEditing ? `Edit Quotation ${existing?.quotationNumber ?? ''}` : 'New Quotation'}
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
              label="Customer"
              required
              placeholder="Select a customer"
              value={customerCompanyId}
              onChange={(event) => {
                setCustomerCompanyId(event.target.value);
                setContactId('');
              }}
              options={(companies?.data ?? []).map((company) => ({ value: company.id, label: company.name }))}
            />
            <Select
              label="Contact"
              placeholder={customerCompanyId ? 'Select a contact' : 'Choose a customer first'}
              disabled={!customerCompanyId}
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
              options={(contacts?.data ?? []).map((contact) => ({
                value: contact.id,
                label: [contact.firstName, contact.lastName].filter(Boolean).join(' '),
              }))}
            />
            <TextField
              label="Quotation date"
              type="date"
              required
              value={quotationDate}
              onChange={(event) => setQuotationDate(event.target.value)}
            />
            <TextField
              label="Valid until"
              type="date"
              value={validUntil}
              onChange={(event) => setValidUntil(event.target.value)}
            />
          </div>

          <QuotationItemsEditor lines={lines} onChange={setLines} products={products?.data ?? []} />

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
            onClick={() => navigate(isEditing && quotationId ? `/quotations/${quotationId}` : '/quotations')}
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
