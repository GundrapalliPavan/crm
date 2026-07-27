import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { leadPriorityLabel, leadPriorityTone } from '@/features/leads/status';
import { useLeadsList } from '@/features/leads/useLeads';

/**
 * SALES.md sections 8-16: "Opportunity" is not a separate entity in this
 * schema - it is simply a Lead at `status: 'opportunity'` (CRM.md's own
 * pipeline stage). This is a Sales-facing view over that same data, not a
 * new backend - opening a row goes to the Lead's own detail page.
 */
export function OpportunitiesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useLeadsList({ status: 'opportunity', page, pageSize: 25 });

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Opportunities</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Qualified leads ready to move into a quotation.
        </p>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load opportunities. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No open opportunities"
          description="A lead moves here once it's marked as an opportunity in the pipeline."
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Next Follow-up</th>
              </tr>
            </thead>
            <tbody>
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
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} opportunities)
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
