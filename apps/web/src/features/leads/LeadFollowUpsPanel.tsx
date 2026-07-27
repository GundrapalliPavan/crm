import { useState } from 'react';
import type { FollowUpType } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useAssignableUsers } from '@/features/users/useUsers';
import { useAuth } from '@/lib/auth/useAuth';
import {
  useCancelFollowUp,
  useCompleteFollowUp,
  useCreateFollowUp,
  useFollowUpsList,
} from '../follow-ups/useFollowUps';

const FOLLOW_UP_TYPES: { value: FollowUpType; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'visit', label: 'Visit' },
  { value: 'other', label: 'Other' },
];

function FollowUpRow({ id, followUpType, scheduledAt, status, isOverdue, assigneeName }: {
  id: string;
  followUpType: string;
  scheduledAt: string;
  status: string;
  isOverdue: boolean;
  assigneeName: string;
}) {
  const complete = useCompleteFollowUp(id);
  const cancel = useCancelFollowUp();

  return (
    <li className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border-default)] px-3 py-2">
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] capitalize">{followUpType}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {new Date(scheduledAt).toLocaleString()} · {assigneeName}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {status === 'pending' && isOverdue && <Badge tone="critical">Overdue</Badge>}
        {status === 'pending' && !isOverdue && <Badge tone="neutral">Pending</Badge>}
        {status === 'completed' && <Badge tone="success">Completed</Badge>}
        {status === 'cancelled' && <Badge tone="neutral">Cancelled</Badge>}
        {status === 'pending' && (
          <>
            <Button size="sm" isLoading={complete.isPending} onClick={() => void complete.mutateAsync({})}>
              Complete
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLoading={cancel.isPending}
              onClick={() => void cancel.mutateAsync(id)}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

/** CRM.md sections 25-28: follow-up is the primary productivity mechanism, not just a date field. */
export function LeadFollowUpsPanel({ leadId }: { leadId: string }) {
  const { user } = useAuth();
  const { data: users } = useAssignableUsers();
  const { data, isLoading } = useFollowUpsList({ leadId });
  const createFollowUp = useCreateFollowUp();

  const [followUpType, setFollowUpType] = useState<FollowUpType>('call');
  const [scheduledAt, setScheduledAt] = useState('');
  const [assignedTo, setAssignedTo] = useState(user?.id ?? '');

  async function handleSchedule() {
    if (!scheduledAt || !assignedTo) {
      return;
    }
    await createFollowUp.mutateAsync({
      leadId,
      followUpType,
      scheduledAt: new Date(scheduledAt).toISOString(),
      assignedTo,
    });
    setScheduledAt('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-3">
        <div className="w-32">
          <Select
            label="Type"
            value={followUpType}
            onChange={(event) => setFollowUpType(event.target.value as FollowUpType)}
            options={FOLLOW_UP_TYPES}
          />
        </div>
        <div className="w-48">
          <TextField
            label="When"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            label="Assign to"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            options={(users ?? []).map((assignee) => ({
              value: assignee.id,
              label: `${assignee.firstName} ${assignee.lastName}`,
            }))}
          />
        </div>
        <Button
          size="sm"
          isLoading={createFollowUp.isPending}
          disabled={!scheduledAt || !assignedTo}
          onClick={() => void handleSchedule()}
        >
          Schedule
        </Button>
      </div>

      {isLoading && <p className="text-sm text-[var(--color-text-secondary)]">Loading follow-ups…</p>}

      {!isLoading && (
        <ul className="flex flex-col gap-2">
          {data?.data.map((followUp) => (
            <FollowUpRow
              key={followUp.id}
              id={followUp.id}
              followUpType={followUp.followUpType}
              scheduledAt={followUp.scheduledAt}
              status={followUp.status}
              isOverdue={followUp.isOverdue}
              assigneeName={`${followUp.assignee.firstName} ${followUp.assignee.lastName}`}
            />
          ))}
          {data?.data.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)]">No follow-ups scheduled.</p>
          )}
        </ul>
      )}
    </div>
  );
}
