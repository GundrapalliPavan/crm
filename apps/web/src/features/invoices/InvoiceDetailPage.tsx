import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CancelWithReasonDialog } from '@/components/common/CancelWithReasonDialog';
import { CommunicationLogSection } from '@/features/communications/CommunicationLogSection';
import { ApiError } from '@/lib/api/api-error';
import { useAuth } from '@/lib/auth/useAuth';
import { invoiceStatusLabel, invoiceStatusTone } from './labels';
import { useCancelInvoice, useInvoice, useIssueInvoice } from './useInvoices';

/** UX.md - Invoice Detail: header/status, GST-broken-down items, commercial summary, workflow actions. */
export function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const { data: invoice, isLoading, isError } = useInvoice(invoiceId ?? '');
  const issue = useIssueInvoice(invoiceId ?? '');
  const cancel = useCancelInvoice(invoiceId ?? '');

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading invoice…</p>;
  }
  if (isError || !invoice) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this invoice. Check your connection and try again.
      </div>
    );
  }

  async function runAction<T>(action: () => Promise<T>, onDone?: (result: T) => void) {
    setActionError(null);
    try {
      const result = await action();
      onDone?.(result);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setActionError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  const status = invoice.status;
  const canIssue = status === 'draft' && can('invoice.issue');
  const canCancel = (status === 'draft' || status === 'issued') && can('invoice.cancel');
  const canRecordPayment = (status === 'issued' || status === 'partially_paid') && can('payment.record');

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {invoice.customerNameSnapshot} · {invoice.invoiceDate}
              {invoice.dueDate && ` · Due ${invoice.dueDate}`}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={invoiceStatusTone(status)}>{invoiceStatusLabel(status)}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {canRecordPayment && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  navigate(`/payments/new?customerCompanyId=${invoice.customer.id}&invoiceId=${invoice.id}`)
                }
              >
                Record Payment
              </Button>
            )}
            {canIssue && (
              <Button size="sm" isLoading={issue.isPending} onClick={() => runAction(() => issue.mutateAsync())}>
                Issue
              </Button>
            )}
            {canCancel && (
              <Button variant="secondary" size="sm" onClick={() => setIsCancelOpen(true)}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mt-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
          >
            {actionError}
          </div>
        )}
      </div>

      <div className="mb-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Taxable</th>
              <th className="px-4 py-3">CGST</th>
              <th className="px-4 py-3">SGST</th>
              <th className="px-4 py-3">IGST</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-border-default)] last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-text-primary)]">{item.productName}</div>
                  <div className="text-[13px] text-[var(--color-text-secondary)]">
                    {item.sku}
                    {item.hsnCode && ` · HSN ${item.hsnCode}`}
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.unitPrice}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.taxableAmount}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.cgstAmount}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.sgstAmount}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.igstAmount}</td>
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-72 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Subtotal</span>
          <span>{invoice.subtotal}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Discount</span>
          <span>{invoice.discountAmount}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Taxable Value</span>
          <span>{invoice.taxableAmount}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">CGST + SGST + IGST</span>
          <span>{invoice.taxAmount}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-[var(--color-border-default)] pt-2 font-semibold">
          <span>Total</span>
          <span>{invoice.totalAmount}</span>
        </div>
        <div className="mt-2 flex justify-between py-1 text-[var(--color-text-secondary)]">
          <span>Paid</span>
          <span>{invoice.paidAmount}</span>
        </div>
        <div className="flex justify-between py-1 font-semibold">
          <span>Outstanding</span>
          <span>{invoice.outstandingAmount}</span>
        </div>
      </div>

      <CommunicationLogSection relatedEntityType="invoice" relatedEntityId={invoice.id} />

      {isCancelOpen && (
        <CancelWithReasonDialog
          title="Cancel invoice?"
          isCancelling={cancel.isPending}
          onClose={() => setIsCancelOpen(false)}
          onConfirm={(reason) =>
            runAction(
              () => cancel.mutateAsync({ reason }),
              () => setIsCancelOpen(false),
            )
          }
        />
      )}
    </div>
  );
}
