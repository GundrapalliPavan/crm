import { useState } from 'react';
import { useNavigate } from 'react-router';
import { QUOTATION_STATUSES, type QuotationStatus } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useTeams } from '@/features/teams/useTeams';
import { useAuth } from '@/lib/auth/useAuth';
import { quotationStatusLabel, quotationStatusTone } from './labels';
import { useQuotationsList } from './useQuotations';

export function QuotationListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuotationStatus | ''>('');
  const [teamId, setTeamId] = useState('');
  const [page, setPage] = useState(1);
  const { data: teams } = useTeams({ isActive: true }, { enabled: can('team.manage') });

  const { data, isLoading, isError } = useQuotationsList({
    page,
    pageSize: 25,
    q: search || undefined,
    status: status || undefined,
    teamId: teamId || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Quotations</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Commercial documents sent to customers.</p>
        </div>
        <Button onClick={() => navigate('/quotations/new')}>+ New Quotation</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <TextField
            label="Search"
            placeholder="Quotation number"
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
              setStatus(event.target.value as QuotationStatus | '');
              setPage(1);
            }}
            options={QUOTATION_STATUSES.map((value) => ({ value, label: quotationStatusLabel(value) }))}
          />
        </div>
        {can('team.manage') && (
          <div className="w-48">
            <Select
              label="Team"
              placeholder="Any team"
              value={teamId}
              onChange={(event) => {
                setTeamId(event.target.value);
                setPage(1);
              }}
              options={(teams?.data ?? []).map((team) => ({ value: team.id, label: team.name }))}
            />
          </div>
        )}
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load quotations. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={search || status ? 'No quotations match these filters.' : 'No quotations yet'}
          description={
            search || status ? 'Clear filters or adjust your search.' : 'Create your first quotation to get started.'
          }
          action={<Button onClick={() => navigate('/quotations/new')}>+ New Quotation</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Quotation</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((quotation) => (
                  <tr
                    key={quotation.id}
                    onClick={() => navigate(`/quotations/${quotation.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{quotation.customer.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{quotation.quotationDate}</td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{quotation.totalAmount}</td>
                    <td className="px-4 py-3">
                      <Badge tone={quotationStatusTone(quotation.status)}>
                        {quotationStatusLabel(quotation.status)}
                      </Badge>
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
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} quotations)
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
