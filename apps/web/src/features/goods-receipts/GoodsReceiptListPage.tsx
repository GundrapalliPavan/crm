import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { useGoodsReceiptsList } from './useGoodsReceipts';

export function GoodsReceiptListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGoodsReceiptsList({ page, pageSize: 25 });

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Goods Receipts</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Deliveries recorded against purchase orders - the evidence behind every purchase stock movement.
        </p>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load goods receipts. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No goods receipts yet"
          description="Receipts appear here once goods are received against a sent purchase order."
          action={<Button onClick={() => navigate('/purchase-orders')}>View Purchase Orders</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Supplier Document</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((receipt) => (
                  <tr
                    key={receipt.id}
                    onClick={() => navigate(`/goods-receipts/${receipt.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{receipt.receiptNumber}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{receipt.warehouse.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{receipt.receiptDate}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {receipt.supplierDocumentNumber ?? '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} receipts)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
