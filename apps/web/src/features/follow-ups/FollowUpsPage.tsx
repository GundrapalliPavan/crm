import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { FollowUp, FollowUpStatus } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { useCancelFollowUp, useCompleteFollowUp, useFollowUpsList, useMyFollowUps } from './useFollowUps';

type Scope = 'mine' | 'all';

const STATUS_OPTIONS: { value: FollowUpStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function FollowUpListItem({ followUp }: { followUp: FollowUp }) {
  const navigate = useNavigate();
  const complete = useCompleteFollowUp(followUp.id);
  const cancel = useCancelFollowUp();

  return (
    <li className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-3">
      <div>
        <p className="text-sm font-medium capitalize text-[var(--color-text-primary)]">
          {followUp.followUpType}
          {followUp.leadId && (
            <button
              type="button"
              className="ml-2 text-xs font-normal text-[var(--color-action-primary)] hover:underline"
              onClick={() => navigate(`/leads/${followUp.leadId}`)}
            >
              View lead
            </button>
          )}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {new Date(followUp.scheduledAt).toLocaleString()} · {followUp.assignee.firstName}{' '}
          {followUp.assignee.lastName}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {followUp.status === 'pending' && followUp.isOverdue && <Badge tone="critical">Overdue</Badge>}
        {followUp.status === 'pending' && !followUp.isOverdue && <Badge tone="neutral">Pending</Badge>}
        {followUp.status === 'completed' && <Badge tone="success">Completed</Badge>}
        {followUp.status === 'cancelled' && <Badge tone="neutral">Cancelled</Badge>}
        {followUp.status === 'pending' && (
          <>
            <Button size="sm" isLoading={complete.isPending} onClick={() => void complete.mutateAsync({})}>
              Complete
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLoading={cancel.isPending}
              onClick={() => void cancel.mutateAsync(followUp.id)}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

/** API.md section 45: /me/follow-ups avoids manually filtering the unrestricted collection. */
export function FollowUpsPage() {
  const [scope, setScope] = useState<Scope>('mine');
  const [status, setStatus] = useState<FollowUpStatus | ''>('');

  const mine = useMyFollowUps({ status: status || undefined });
  const all = useFollowUpsList({ status: status || undefined });
  const { data, isLoading, isError } = scope === 'mine' ? mine : all;

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Follow-ups</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Scheduled calls, meetings, and other next actions.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScope('mine')}
            className={
              scope === 'mine'
                ? 'rounded-full bg-[var(--color-action-primary)] px-3 py-1 text-xs font-medium text-[var(--color-text-on-primary)]'
                : 'rounded-full bg-[var(--color-neutral-bg)] px-3 py-1 text-xs font-medium text-[var(--color-neutral-text)]'
            }
          >
            My Follow-ups
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={
              scope === 'all'
                ? 'rounded-full bg-[var(--color-action-primary)] px-3 py-1 text-xs font-medium text-[var(--color-text-on-primary)]'
                : 'rounded-full bg-[var(--color-neutral-bg)] px-3 py-1 text-xs font-medium text-[var(--color-neutral-text)]'
            }
          >
            All
          </button>
        </div>
        <div className="w-40">
          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as FollowUpStatus | '')}
            options={STATUS_OPTIONS}
            placeholder="Any status"
          />
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
        >
          Unable to load follow-ups. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState title="No follow-ups" description="Follow-ups scheduled from a lead will appear here." />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.data.map((followUp) => (
            <FollowUpListItem key={followUp.id} followUp={followUp} />
          ))}
        </ul>
      )}
    </div>
  );
}
