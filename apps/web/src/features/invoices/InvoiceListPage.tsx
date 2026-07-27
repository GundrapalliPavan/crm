import { useState } from 'react';
import { useNavigate } from 'react-router';
import { INVOICE_STATUSES, type InvoiceStatus } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { invoiceStatusLabel, invoiceStatusTone } from './labels';
import { useInvoicesList } from './useInvoices';

/** Standalone invoice creation is deferred - invoices are raised from a confirmed Sales Order. */
export function InvoiceListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useInvoicesList({
    page,
    pageSize: 25,
    q: search || undefined,
    status: status || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Invoices</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Raised against confirmed sales orders.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <TextField
            label="Search"
            placeholder="Invoice number"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-48">
          <Select
            label="Status"
            placeholder="Any status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as InvoiceStatus | '');
              setPage(1);
            }}
            options={INVOICE_STATUSES.map((value) => ({ value, label: invoiceStatusLabel(value) }))}
          />
        </div>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load invoices. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={search || status ? 'No invoices match these filters.' : 'No invoices yet'}
          description={
            search || status
              ? 'Clear filters or adjust your search.'
              : 'Invoices appear here once one is raised from a confirmed sales order.'
          }
          action={<Button onClick={() => navigate('/sales-orders')}>View Sales Orders</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Outstanding</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{invoice.customer.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{invoice.invoiceDate}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{invoice.dueDate ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{invoice.totalAmount}</td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{invoice.outstandingAmount}</td>
                    <td className="px-4 py-3">
                      <Badge tone={invoiceStatusTone(invoice.status)}>{invoiceStatusLabel(invoice.status)}</Badge>
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
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} invoices)
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
