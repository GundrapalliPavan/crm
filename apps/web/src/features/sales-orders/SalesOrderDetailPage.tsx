import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { CreditLimitWarning, SalesOrderStockWarning } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CancelWithReasonDialog } from '@/components/common/CancelWithReasonDialog';
import { FileAttachmentsSection } from '@/features/files/FileAttachmentsSection';
import { useCreateInvoiceFromSalesOrder } from '@/features/invoices/useInvoices';
import { ApiError } from '@/lib/api/api-error';
import { useAuth } from '@/lib/auth/useAuth';
import { salesOrderStatusLabel, salesOrderStatusTone } from './labels';
import { useCancelSalesOrder, useCompleteSalesOrder, useConfirmSalesOrder, useSalesOrder } from './useSalesOrders';

const INVOICEABLE_STATUSES = ['confirmed', 'processing', 'partially_fulfilled', 'fulfilled'];

/** UX.md sections 42-43: Customer/Status/Products/Quantity/Stock/Value/Delivery/Source Quotation, workflow visually clear. */
export function SalesOrderDetailPage() {
  const { salesOrderId } = useParams<{ salesOrderId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<SalesOrderStockWarning[] | null>(null);
  const [creditWarning, setCreditWarning] = useState<{ invoiceId: string; warning: CreditLimitWarning } | null>(null);

  const { data: order, isLoading, isError } = useSalesOrder(salesOrderId ?? '');
  const confirm = useConfirmSalesOrder(salesOrderId ?? '');
  const createInvoice = useCreateInvoiceFromSalesOrder(salesOrderId ?? '');
  const cancel = useCancelSalesOrder(salesOrderId ?? '');
  const complete = useCompleteSalesOrder(salesOrderId ?? '');

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading sales order…</p>;
  }
  if (isError || !order) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this sales order. Check your connection and try again.
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
  const canCancel = ['draft', 'confirmation_pending', 'confirmed', 'processing'].includes(status);
  const canConfirm = status === 'draft' || status === 'confirmation_pending';
  const canComplete = status === 'confirmed' || status === 'processing' || status === 'partially_fulfilled';
  const canInvoice = INVOICEABLE_STATUSES.includes(status) && can('invoice.create');

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">
              {order.salesOrderNumber}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {order.customer.name}
              {order.contact && ` · ${order.contact.firstName} ${order.contact.lastName ?? ''}`.trim()}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={salesOrderStatusTone(status)}>{salesOrderStatusLabel(status)}</Badge>
              {order.quotationId && (
                <button
                  type="button"
                  onClick={() => navigate(`/quotations/${order.quotationId}`)}
                  className="text-[13px] font-medium text-[var(--color-info-text)] underline"
                >
                  View source quotation
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {canConfirm && (
              <Button
                size="sm"
                isLoading={confirm.isPending}
                onClick={() =>
                  runAction(
                    () => confirm.mutateAsync(),
                    (response) => setStockWarnings(response.stockWarnings),
                  )
                }
              >
                Confirm
              </Button>
            )}
            {canComplete && (
              <Button size="sm" isLoading={complete.isPending} onClick={() => runAction(() => complete.mutateAsync())}>
                Mark Fulfilled
              </Button>
            )}
            {canInvoice && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={createInvoice.isPending}
                onClick={() =>
                  runAction(
                    () => createInvoice.mutateAsync({}),
                    (response) => {
                      if (response.creditWarning) {
                        setCreditWarning({ invoiceId: response.invoice.id, warning: response.creditWarning });
                      } else {
                        navigate(`/invoices/${response.invoice.id}`);
                      }
                    },
                  )
                }
              >
                Create Invoice
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

        {stockWarnings && stockWarnings.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-[var(--radius-input)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]"
          >
            <p className="font-medium">Confirmed, but stock is short for:</p>
            <ul className="mt-1 list-inside list-disc">
              {stockWarnings.map((warning) => (
                <li key={warning.productId}>
                  {warning.productName} - ordered {warning.orderedQuantity}, available {warning.availableQuantity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {creditWarning && (
          <div
            role="alert"
            className="mt-4 rounded-[var(--radius-input)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]"
          >
            <p className="font-medium">
              Invoice created, but this puts the customer over their credit limit of {creditWarning.warning.creditLimit}{' '}
              (outstanding would become {creditWarning.warning.outstandingAfter}).
            </p>
            <button
              type="button"
              onClick={() => navigate(`/invoices/${creditWarning.invoiceId}`)}
              className="mt-2 font-medium underline"
            >
              View Invoice
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Fulfilled</th>
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
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.fulfilledQuantity}</td>
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

      <FileAttachmentsSection relatedEntityType="sales_order" relatedEntityId={order.id} />

      {isCancelOpen && (
        <CancelWithReasonDialog
          title="Cancel sales order?"
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
