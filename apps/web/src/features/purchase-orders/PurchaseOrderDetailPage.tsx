import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CancelWithReasonDialog } from '@/components/common/CancelWithReasonDialog';
import { useAuth } from '@/lib/auth/useAuth';
import { ApiError } from '@/lib/api/api-error';
import { purchaseOrderStatusLabel, purchaseOrderStatusTone } from './labels';
import {
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  useClosePurchaseOrder,
  useMarkPurchaseOrderSupplierConfirmed,
  usePurchaseOrder,
  useRejectPurchaseOrderApproval,
  useSendPurchaseOrder,
  useSubmitPurchaseOrder,
} from './usePurchaseOrders';

const RECEIVABLE_STATUSES = ['sent', 'supplier_confirmed', 'partially_received'];

/** PURCHASE.md sections 40-43, 57: only show actions valid for the current status; ordered/received/pending always visible. */
export function PurchaseOrderDetailPage() {
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const { data: order, isLoading, isError } = usePurchaseOrder(purchaseOrderId ?? '');
  const submit = useSubmitPurchaseOrder(purchaseOrderId ?? '');
  const approve = useApprovePurchaseOrder(purchaseOrderId ?? '');
  const rejectApproval = useRejectPurchaseOrderApproval(purchaseOrderId ?? '');
  const send = useSendPurchaseOrder(purchaseOrderId ?? '');
  const markSupplierConfirmed = useMarkPurchaseOrderSupplierConfirmed(purchaseOrderId ?? '');
  const close = useClosePurchaseOrder(purchaseOrderId ?? '');
  const cancel = useCancelPurchaseOrder(purchaseOrderId ?? '');

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading purchase order…</p>;
  }
  if (isError || !order) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this purchase order. Check your connection and try again.
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

  const status = order.status;
  const canCancel = ['draft', 'approval_pending', 'approved', 'sent', 'supplier_confirmed'].includes(status);
  const canReceive = RECEIVABLE_STATUSES.includes(status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{order.poNumber}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{order.supplier.name}</p>
            <div className="mt-2">
              <Badge tone={purchaseOrderStatusTone(status)}>{purchaseOrderStatusLabel(status)}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {status === 'draft' && (
              <Button variant="secondary" size="sm" onClick={() => navigate(`/purchase-orders/${order.id}/edit`)}>
                Edit
              </Button>
            )}
            {status === 'draft' && (
              <Button size="sm" isLoading={submit.isPending} onClick={() => runAction(() => submit.mutateAsync())}>
                Submit
              </Button>
            )}
            {status === 'approval_pending' && can('purchase_order.approve') && (
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
            {status === 'approved' && can('purchase_order.send') && (
              <Button size="sm" isLoading={send.isPending} onClick={() => runAction(() => send.mutateAsync())}>
                Send
              </Button>
            )}
            {status === 'sent' && (
              <Button
                variant="secondary"
                size="sm"
                isLoading={markSupplierConfirmed.isPending}
                onClick={() => runAction(() => markSupplierConfirmed.mutateAsync())}
              >
                Mark Supplier-Confirmed
              </Button>
            )}
            {canReceive && (
              <Button size="sm" onClick={() => navigate(`/purchase-orders/${order.id}/receive`)}>
                Receive Goods
              </Button>
            )}
            {status === 'partially_received' && (
              <Button
                variant="secondary"
                size="sm"
                isLoading={close.isPending}
                onClick={() => runAction(() => close.mutateAsync())}
              >
                Close Remaining
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
              <th className="px-4 py-3">Ordered</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-border-default)] last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-text-primary)]">{item.productName}</div>
                  <div className="text-[13px] text-[var(--color-text-secondary)]">{item.sku}</div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {item.orderedQuantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.receivedQuantity}</td>
                <td className="px-4 py-3 text-[var(--color-text-primary)]">
                  {(Number(item.orderedQuantity) - Number(item.receivedQuantity)).toFixed(3)}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.unitPrice}</td>
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-64 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Subtotal</span>
          <span>{order.subtotal}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Discount</span>
          <span>{order.discountAmount}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--color-text-secondary)]">Tax</span>
          <span>{order.taxAmount}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-[var(--color-border-default)] pt-2 font-semibold">
          <span>Total</span>
          <span>{order.totalAmount}</span>
        </div>
      </div>

      {isCancelOpen && (
        <CancelWithReasonDialog
          title="Cancel purchase order?"
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
