import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CancelWithReasonDialog } from '@/components/common/CancelWithReasonDialog';
import { FileAttachmentsSection } from '@/features/files/FileAttachmentsSection';
import { ApiError } from '@/lib/api/api-error';
import { useAuth } from '@/lib/auth/useAuth';
import { paymentMethodLabel, paymentStatusLabel, paymentStatusTone } from './labels';
import { useCancelPayment, usePayment } from './usePayments';

/** BILLING.md section 39: incorrect payments are reversed with a reason, not deleted. */
export function PaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const { data: payment, isLoading, isError } = usePayment(paymentId ?? '');
  const cancel = useCancelPayment(paymentId ?? '');

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading payment…</p>;
  }
  if (isError || !payment) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this payment. Check your connection and try again.
      </div>
    );
  }

  const canCancel = payment.status === 'recorded' && can('payment.record');

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{payment.paymentNumber}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {payment.customer.name} · {payment.paymentDate} · {paymentMethodLabel(payment.paymentMethod)}
              {payment.referenceNumber && ` · Ref ${payment.referenceNumber}`}
            </p>
            <div className="mt-2">
              <Badge tone={paymentStatusTone(payment.status)}>{paymentStatusLabel(payment.status)}</Badge>
            </div>
          </div>
          {canCancel && (
            <Button variant="secondary" size="sm" onClick={() => setIsCancelOpen(true)}>
              Cancel Payment
            </Button>
          )}
        </div>

        {actionError && (
          <div
            role="alert"
            className="mt-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
          >
            {actionError}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-secondary)]">Amount</p>
            <p className="font-medium text-[var(--color-text-primary)]">{payment.amount}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Unallocated</p>
            <p className="font-medium text-[var(--color-text-primary)]">{payment.unallocatedAmount}</p>
          </div>
          {payment.notes && (
            <div className="col-span-2">
              <p className="text-[var(--color-text-secondary)]">Notes</p>
              <p className="whitespace-pre-wrap text-[var(--color-text-primary)]">{payment.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Allocated Amount</th>
            </tr>
          </thead>
          <tbody>
            {payment.allocations.map((allocation) => (
              <tr
                key={allocation.id}
                onClick={() => navigate(`/invoices/${allocation.invoiceId}`)}
                className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
              >
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{allocation.invoiceNumber}</td>
                <td className="px-4 py-3 text-[var(--color-text-primary)]">{allocation.allocatedAmount}</td>
              </tr>
            ))}
            {payment.allocations.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-[var(--color-text-secondary)]">
                  This payment has not been allocated to any invoice yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FileAttachmentsSection relatedEntityType="payment" relatedEntityId={payment.id} />

      {isCancelOpen && (
        <CancelWithReasonDialog
          title="Cancel this payment?"
          isCancelling={cancel.isPending}
          onClose={() => setIsCancelOpen(false)}
          onConfirm={async (reason) => {
            setActionError(null);
            try {
              await cancel.mutateAsync({ reason });
              setIsCancelOpen(false);
            } catch (error) {
              const apiError = error instanceof ApiError ? error : null;
              setActionError(apiError?.message ?? 'Something went wrong. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}
