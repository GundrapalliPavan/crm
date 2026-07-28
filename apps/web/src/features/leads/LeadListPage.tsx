import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LEAD_PRIORITIES, LEAD_STATUSES } from '@crm/types';
import type { LeadPriority, LeadStatus } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useTeams } from '@/features/teams/useTeams';
import { useAuth } from '@/lib/auth/useAuth';
import type { ListLeadsParams } from './api';
import { LeadCreateModal } from './LeadCreateModal';
import { leadPriorityLabel, leadPriorityTone, leadStatusLabel, leadStatusTone } from './status';
import { useLeadsList } from './useLeads';

type QuickFilter = 'all' | 'mine' | 'new' | 'qualified' | 'unassigned' | 'overdue' | 'converted';

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'mine', label: 'My Leads' },
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'overdue', label: 'Follow-up Overdue' },
  { value: 'converted', label: 'Converted' },
];

/** UX.md sections 20-24, 28: prioritises name/business/stage/priority/owner/next follow-up, and
 *  the quick filters that answer "what needs my attention" without opening every lead. */
export function LeadListPage() {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [priority, setPriority] = useState<LeadPriority | ''>('');
  const [teamId, setTeamId] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: teams } = useTeams({ isActive: true }, { enabled: can('team.manage') });

  const params: ListLeadsParams = {
    page,
    pageSize: 25,
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
    teamId: teamId || undefined,
    assignedTo: quickFilter === 'mine' ? user?.id : undefined,
    unassigned: quickFilter === 'unassigned' ? true : undefined,
    overdueFollowUp: quickFilter === 'overdue' ? true : undefined,
  };
  if (quickFilter === 'new') params.status = 'new';
  if (quickFilter === 'qualified') params.status = 'qualified';
  if (quickFilter === 'converted') params.status = 'converted';

  const { data, isLoading, isError } = useLeadsList(params);

  function handleQuickFilter(value: QuickFilter) {
    setQuickFilter(value);
    setStatus('');
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Leads</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage and follow up on sales opportunities.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Lead</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleQuickFilter(filter.value)}
            className={
              quickFilter === filter.value
                ? 'rounded-full bg-[var(--color-action-primary)] px-3 py-1 text-xs font-medium text-[var(--color-text-on-primary)]'
                : 'rounded-full bg-[var(--color-neutral-bg)] px-3 py-1 text-xs font-medium text-[var(--color-neutral-text)] hover:bg-[var(--color-border-default)]'
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <TextField
            label="Search"
            placeholder="Name, business, phone, email"
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
              setStatus(event.target.value as LeadStatus | '');
              setQuickFilter('all');
              setPage(1);
            }}
            options={LEAD_STATUSES.map((value) => ({ value, label: leadStatusLabel(value) }))}
          />
        </div>
        <div className="w-40">
          <Select
            label="Priority"
            placeholder="Any priority"
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as LeadPriority | '');
              setPage(1);
            }}
            options={LEAD_PRIORITIES.map((value) => ({ value, label: leadPriorityLabel(value) }))}
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
        <div
          role="alert"
          className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
        >
          Unable to load leads. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={search || status || priority || quickFilter !== 'all' ? 'No leads match these filters.' : 'No leads yet'}
          description={
            search || status || priority || quickFilter !== 'all'
              ? 'Clear filters or adjust your search.'
              : 'Add your first lead to start tracking your sales pipeline.'
          }
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Lead</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Next Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-4" colSpan={5}>
                      <div className="h-4 w-full animate-pulse rounded bg-[var(--color-bg-app)]" />
                    </td>
                  </tr>
                ))}
              {!isLoading &&
                data?.data.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {lead.firstName} {lead.lastName ?? ''}
                      </div>
                      {lead.companyName && (
                        <div className="text-[13px] text-[var(--color-text-secondary)]">{lead.companyName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={leadStatusTone(lead.status)}>{leadStatusLabel(lead.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={leadPriorityTone(lead.priority)}>{leadPriorityLabel(lead.priority)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {lead.assignee ? `${lead.assignee.firstName} ${lead.assignee.lastName}` : 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString() : '—'}
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
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} leads)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
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

      {isCreateOpen && (
        <LeadCreateModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(lead) => {
            setIsCreateOpen(false);
            navigate(`/leads/${lead.id}`);
          }}
        />
      )}
    </div>
  );
}
