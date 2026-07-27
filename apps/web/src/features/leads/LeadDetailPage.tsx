import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Select } from '@/components/common/Select';
import { useAssignableUsers } from '@/features/users/useUsers';
import { LeadActivityTimeline } from './LeadActivityTimeline';
import { LeadFollowUpsPanel } from './LeadFollowUpsPanel';
import { LeadStatusDialog } from './LeadStatusDialog';
import { leadPriorityLabel, leadPriorityTone, leadStatusLabel, leadStatusTone, leadTypeLabel, lostReasonLabel } from './status';
import { useArchiveLead, useAssignLead, useConvertLead, useLead } from './useLeads';

/**
 * CRM.md section 94: header (name/business/stage/priority/owner/next
 * follow-up) + quick actions, then overview, timeline, follow-ups and
 * conversion/lost information. Section 99's test for every active lead:
 * who owns it, what happened last, what happens next.
 */
export function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading, isError } = useLead(leadId ?? '');
  const { data: users } = useAssignableUsers();
  const assignLead = useAssignLead(leadId ?? '');
  const convertLead = useConvertLead(leadId ?? '');
  const archiveLead = useArchiveLead();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading lead…</p>;
  }

  if (isError || !lead) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this lead. Check your connection and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">
              {lead.firstName} {lead.lastName ?? ''}
            </h1>
            {lead.companyName && (
              <p className="text-sm text-[var(--color-text-secondary)]">{lead.companyName}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setIsStatusOpen(true)}>
                <Badge tone={leadStatusTone(lead.status)}>{leadStatusLabel(lead.status)}</Badge>
              </button>
              <Badge tone={leadPriorityTone(lead.priority)}>{leadPriorityLabel(lead.priority)}</Badge>
              {lead.leadType && <Badge tone="neutral">{leadTypeLabel(lead.leadType)}</Badge>}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="w-48">
              <Select
                label="Owner"
                placeholder="Unassigned"
                value={lead.assignee?.id ?? ''}
                onChange={(event) => void assignLead.mutateAsync({ userId: event.target.value || undefined })}
                options={(users ?? []).map((assignee) => ({
                  value: assignee.id,
                  label: `${assignee.firstName} ${assignee.lastName}`,
                }))}
              />
            </div>
            {lead.status !== 'converted' && (
              <Button variant="secondary" size="sm" onClick={() => setIsConvertOpen(true)}>
                Convert
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsArchiveOpen(true)}>
              Archive
            </Button>
          </div>
        </div>

        {lead.status === 'lost' && lead.lostReason && (
          <div className="mt-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
            Lost: {lostReasonLabel(lead.lostReason)}
            {lead.lostNotes && ` — ${lead.lostNotes}`}
          </div>
        )}

        {lead.status === 'converted' && (lead.convertedCompany || lead.convertedContact) && (
          <div className="mt-4 rounded-[var(--radius-input)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success-text)]">
            Converted{lead.convertedCompany ? ` to ${lead.convertedCompany.name}` : ''}
            {lead.convertedContact ? ` (${lead.convertedContact.firstName} ${lead.convertedContact.lastName ?? ''})` : ''}
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5 text-sm">
        <div>
          <p className="text-[var(--color-text-secondary)]">Phone</p>
          <p className="text-[var(--color-text-primary)]">{lead.phone ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Email</p>
          <p className="text-[var(--color-text-primary)]">{lead.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Source</p>
          <p className="text-[var(--color-text-primary)]">{lead.source?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Estimated value</p>
          <p className="text-[var(--color-text-primary)]">
            {lead.estimatedValue ? `${lead.currencyCode} ${lead.estimatedValue}` : '—'}
          </p>
        </div>
        {lead.notes && (
          <div className="col-span-2">
            <p className="text-[var(--color-text-secondary)]">Notes</p>
            <p className="text-[var(--color-text-primary)]">{lead.notes}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Follow-ups</h2>
          <LeadFollowUpsPanel leadId={lead.id} />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Activity</h2>
          <LeadActivityTimeline leadId={lead.id} />
        </section>
      </div>

      {isStatusOpen && <LeadStatusDialog lead={lead} onClose={() => setIsStatusOpen(false)} />}

      {isConvertOpen && (
        <ConfirmDialog
          title="Convert lead?"
          description="This creates or links a company and contact based on the lead's details, and preserves its full activity history."
          confirmLabel="Convert"
          isConfirming={convertLead.isPending}
          onConfirm={() => void convertLead.mutateAsync({}).then(() => setIsConvertOpen(false))}
          onCancel={() => setIsConvertOpen(false)}
        />
      )}

      {isArchiveOpen && (
        <ConfirmDialog
          title="Archive lead?"
          description="This lead will no longer appear in the default list. Its history is kept."
          confirmLabel="Archive"
          destructive
          isConfirming={archiveLead.isPending}
          onConfirm={() =>
            void archiveLead.mutateAsync(lead.id).then(() => navigate('/leads'))
          }
          onCancel={() => setIsArchiveOpen(false)}
        />
      )}
    </div>
  );
}
