import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PAYMENT_METHODS, type PaymentMethod } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { useCompaniesList } from '@/features/companies/useCompanies';
import { useOutstandingInvoices } from '@/features/invoices/useInvoices';
import { ApiError } from '@/lib/api/api-error';
import { paymentMethodLabel } from './labels';
import { useCreatePayment } from './usePayments';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** API.md sections 80-82 - allocations may sum to less than the payment amount (advance/unallocated). */
export function PaymentCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInvoiceId = searchParams.get('invoiceId') ?? '';

  const [formError, setFormError] = useState<string | null>(null);
  const [customerCompanyId, setCustomerCompanyId] = useState(searchParams.get('customerCompanyId') ?? '');
  const [paymentDate, setPaymentDate] = useState(today());
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<Record<string, string>>(
    preselectedInvoiceId ? { [preselectedInvoiceId]: '' } : {},
  );

  const { data: companies } = useCompaniesList({ isCustomer: true, pageSize: 100 });
  const { data: outstanding } = useOutstandingInvoices(customerCompanyId, { enabled: Boolean(customerCompanyId) });
  const createPayment = useCreatePayment();

  const invoices = outstanding?.data ?? [];
  const allocatedTotal = Object.values(allocations).reduce((sum, value) => sum + (Number(value) || 0), 0);

  function updateAllocation(invoiceId: string, value: string) {
    setAllocations((current) => ({ ...current, [invoiceId]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!customerCompanyId || !amount || !paymentMethod) {
      setFormError('Choose a customer, amount, and payment method.');
      return;
    }

    const allocationRequests = Object.entries(allocations)
      .filter(([, value]) => Number(value) > 0)
      .map(([invoiceId, value]) => ({ invoiceId, amount: value }));

    try {
      const payment = await createPayment.mutateAsync({
        customerCompanyId,
        paymentDate,
        amount,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
        allocations: allocationRequests.length > 0 ? allocationRequests : undefined,
      });
      navigate(`/payments/${payment.id}`);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [...apiError.fieldErrors('allocations'), ...apiError.fieldErrors('amount')]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <h1 className="mb-1 font-serif text-2xl font-bold text-[var(--color-text-primary)]">Record Payment</h1>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        Allocate across one or more outstanding invoices, or leave unallocated as an advance.
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
              label="Customer"
              required
              placeholder="Select a customer"
              value={customerCompanyId}
              onChange={(event) => {
                setCustomerCompanyId(event.target.value);
                setAllocations({});
              }}
              options={(companies?.data ?? []).map((company) => ({ value: company.id, label: company.name }))}
            />
            <TextField
              label="Payment date"
              type="date"
              required
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
            <TextField
              label="Amount"
              required
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Select
              label="Payment method"
              required
              placeholder="Select a method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              options={PAYMENT_METHODS.map((value) => ({ value, label: paymentMethodLabel(value) }))}
            />
            <TextField
              label="Reference number"
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
            />
          </div>

          {customerCompanyId && (
            <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)]">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-app)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                    <th className="px-3 py-2">Invoice</th>
                    <th className="px-3 py-2">Due</th>
                    <th className="px-3 py-2">Outstanding</th>
                    <th className="w-40 px-3 py-2">Allocate</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-[var(--color-border-default)] last:border-0">
                      <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">{invoice.invoiceNumber}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{invoice.dueDate ?? '—'}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{invoice.outstandingAmount}</td>
                      <td className="px-3 py-2">
                        <TextField
                          label={`Allocate to ${invoice.invoiceNumber}`}
                          hideLabel
                          inputMode="decimal"
                          value={allocations[invoice.id] ?? ''}
                          onChange={(event) => updateAllocation(invoice.id, event.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-[var(--color-text-secondary)]">
                        This customer has no outstanding invoices.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-between border-t border-[var(--color-border-default)] px-3 py-2 text-sm">
                <span className="text-[var(--color-text-secondary)]">Allocated</span>
                <span className="font-medium text-[var(--color-text-primary)]">{allocatedTotal}</span>
              </div>
            </div>
          )}

          <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/payments')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createPayment.isPending}>
            {createPayment.isPending ? 'Saving…' : 'Save Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
