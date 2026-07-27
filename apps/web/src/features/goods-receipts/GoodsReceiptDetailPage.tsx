import { useNavigate, useParams } from 'react-router';
import { useGoodsReceipt } from './useGoodsReceipts';

export function GoodsReceiptDetailPage() {
  const { goodsReceiptId } = useParams<{ goodsReceiptId: string }>();
  const navigate = useNavigate();
  const { data: receipt, isLoading, isError } = useGoodsReceipt(goodsReceiptId ?? '');

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading goods receipt…</p>;
  }
  if (isError || !receipt) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this goods receipt. Check your connection and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{receipt.receiptNumber}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{receipt.warehouse.name}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/purchase-orders/${receipt.purchaseOrderId}`)}
            className="text-sm font-medium text-[var(--color-info-text)] underline"
          >
            View purchase order
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-secondary)]">Receipt date</p>
            <p className="text-[var(--color-text-primary)]">{receipt.receiptDate}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Supplier document</p>
            <p className="text-[var(--color-text-primary)]">{receipt.supplierDocumentNumber ?? '—'}</p>
          </div>
          {receipt.notes && (
            <div className="col-span-2">
              <p className="text-[var(--color-text-secondary)]">Notes</p>
              <p className="text-[var(--color-text-primary)]">{receipt.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Accepted</th>
              <th className="px-4 py-3">Rejected</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-border-default)] last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-text-primary)]">{item.productName}</div>
                  <div className="text-[13px] text-[var(--color-text-secondary)]">{item.sku}</div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.quantityReceived}</td>
                <td className="px-4 py-3 text-[var(--color-text-primary)]">{item.acceptedQuantity}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{item.rejectedQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
