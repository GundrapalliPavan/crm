import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CancelWithReasonDialog } from '@/components/common/CancelWithReasonDialog';
import { useAuth } from '@/lib/auth/useAuth';
import { ApiError } from '@/lib/api/api-error';
import { quotationStatusLabel, quotationStatusTone } from './labels';
import {
  useAcceptQuotation,
  useApproveQuotation,
  useCancelQuotation,
  useConvertQuotationToOrder,
  useQuotation,
  useRejectQuotation,
  useRejectQuotationApproval,
  useSendQuotation,
  useSubmitQuotation,
} from './useQuotations';

/** UX.md section 41: only show actions valid for the current status. */
export function QuotationDetailPage() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const { data: quotation, isLoading, isError } = useQuotation(quotationId ?? '');
  const submit = useSubmitQuotation(quotationId ?? '');
  const approve = useApproveQuotation(quotationId ?? '');
  const rejectApproval = useRejectQuotationApproval(quotationId ?? '');
  const send = useSendQuotation(quotationId ?? '');
  const accept = useAcceptQuotation(quotationId ?? '');
  const reject = useRejectQuotation(quotationId ?? '');
  const cancel = useCancelQuotation(quotationId ?? '');
  const convertToOrder = useConvertQuotationToOrder(quotationId ?? '');

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading quotation…</p>;
  }
  if (isError || !quotation) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this quotation. Check your connection and try again.
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

  const status = quotation.status;
  const canCancel = ['draft', 'approval_pending', 'approved', 'sent', 'negotiation'].includes(status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">
              {quotation.quotationNumber}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {quotation.customer.name}
              {quotation.contact && ` · ${quotation.contact.firstName} ${quotation.contact.lastName ?? ''}`.trim()}
            </p>
            <div className="mt-2">
              <Badge tone={quotationStatusTone(status)}>{quotationStatusLabel(status)}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {status === 'draft' && (
              <Button variant="secondary" size="sm" onClick={() => navigate(`/quotations/${quotation.id}/edit`)}>
                Edit
              </Button>
            )}
            {status === 'draft' && (
              <Button size="sm" isLoading={submit.isPending} onClick={() => runAction(() => submit.mutateAsync())}>
                Submit
              </Button>
            )}
            {status === 'approval_pending' && can('quotation.approve') && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={rejectApproval.isPending}
                  onClick={() => runAction(() => rejectApproval.mutateAsync())}
                >
                  Send Back
                </Button>
                <Button size="sm" isLoading={approve.isPending} onClick={() => runAction(() => approve.mutateAsync())}>
                  Approve
                </Button>
              </>
            )}
            {status === 'approved' && can('quotation.send') && (
              <Button size="sm" isLoading={send.isPending} onClick={() => runAction(() => send.mutateAsync())}>
                Send
              </Button>
            )}
            {(status === 'sent' || status === 'negotiation') && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={reject.isPending}
                  onClick={() => runAction(() => reject.mutateAsync())}
                >
                  Mark Rejected
                </Button>
                <Button size="sm" isLoading={accept.isPending} onClick={() => runAction(() => accept.mutateAsync())}>
                  Mark Accepted
                </Button>
              </>
            )}
            {status === 'accepted' && (
              <Button
                size="sm"
                isLoading={convertToOrder.isPending}
                onClick={() =>
                  runAction(
                    () => convertToOrder.mutateAsync(),
                    (order) => navigate(`/sales-orders/${order.id}`),
                  )
                }
              >
                Convert to Sales Order
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
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Tax</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-border-default)] last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-text-primary)]">{item.productName}</div>
                  <div className="text-[13px] text-[var(--color-text-secondary)]">{item.sku}</div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.unitPrice}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {item.discountPercentage}% ({item.discountAmount})
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {item.taxRate}% ({item.taxAmount})
                </td>
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-64 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Subtotal</span>
          <span>{quotation.subtotal}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Discount</span>
          <span>{quotation.discountAmount}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Tax</span>
          <span>{quotation.taxAmount}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-[var(--color-border-default)] pt-2 font-semibold">
          <span>Total</span>
          <span>{quotation.totalAmount}</span>
        </div>
      </div>

      {isCancelOpen && (
        <CancelWithReasonDialog
          title="Cancel quotation?"
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
