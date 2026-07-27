import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { TextField } from '@/components/common/TextField';
import { useAuth } from '@/lib/auth/useAuth';
import { paymentMethodLabel, paymentStatusLabel, paymentStatusTone } from './labels';
import { usePaymentsList } from './usePayments';

export function PaymentListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = usePaymentsList({ page, pageSize: 25, q: search || undefined });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Payments</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Customer payments and their invoice allocations.</p>
        </div>
        {can('payment.record') && <Button onClick={() => navigate('/payments/new')}>+ Record Payment</Button>}
      </div>

      <div className="mb-4 w-64">
        <TextField
          label="Search"
          placeholder="Payment number"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load payments. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={search ? 'No payments match this search.' : 'No payments recorded yet'}
          description={
            search ? 'Clear the search and try again.' : 'Record a payment against an issued invoice to see it here.'
          }
          action={can('payment.record') ? <Button onClick={() => navigate('/payments/new')}>Record Payment</Button> : undefined}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Unallocated</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => navigate(`/payments/${payment.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{payment.paymentNumber}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{payment.customer.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{payment.paymentDate}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{paymentMethodLabel(payment.paymentMethod)}</td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{payment.amount}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{payment.unallocatedAmount}</td>
                    <td className="px-4 py-3">
                      <Badge tone={paymentStatusTone(payment.status)}>{paymentStatusLabel(payment.status)}</Badge>
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
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} payments)
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
