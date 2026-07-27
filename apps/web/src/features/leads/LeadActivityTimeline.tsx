import { useState } from 'react';
import type { LeadActivityType } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { useCreateLeadActivity, useLeadActivities } from './useLeads';

const MANUAL_ACTIVITY_TYPES: { value: LeadActivityType; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
];

/**
 * CRM.md sections 37, 40: "what happened with this relationship?" - the
 * unified timeline. Newest first, prioritising human-readable activity over
 * technical noise (only call/meeting/note/status/assignment/conversion
 * events reach here, never low-value system chatter).
 */
export function LeadActivityTimeline({ leadId }: { leadId: string }) {
  const { data, isLoading } = useLeadActivities(leadId);
  const createActivity = useCreateLeadActivity(leadId);
  const [activityType, setActivityType] = useState<LeadActivityType>('call');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function handleAdd() {
    if (!title.trim()) {
      return;
    }
    await createActivity.mutateAsync({ activityType, title, description: description || undefined });
    setTitle('');
    setDescription('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-3">
        <div className="flex gap-2">
          <div className="w-32">
            <Select
              label="Type"
              value={activityType}
              onChange={(event) => setActivityType(event.target.value as LeadActivityType)}
              options={MANUAL_ACTIVITY_TYPES}
            />
          </div>
          <div className="flex-1">
            <TextField
              label="Summary"
              placeholder="e.g. Called, discussed pricing"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
        </div>
        <Textarea
          label="Details"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            isLoading={createActivity.isPending}
            disabled={!title.trim()}
            onClick={() => void handleAdd()}
          >
            Add Activity
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-[var(--color-text-secondary)]">Loading activity…</p>}

      {!isLoading && data && (
        <ol className="flex flex-col gap-3">
          {data.data.map((activity) => (
            <li key={activity.id} className="border-l-2 border-[var(--color-border-default)] pl-3">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{activity.title}</p>
              {activity.description && (
                <p className="text-sm text-[var(--color-text-secondary)]">{activity.description}</p>
              )}
              <p className="text-xs text-[var(--color-text-placeholder)]">
                {new Date(activity.activityAt).toLocaleString()}
                {activity.performedBy ? ` · ${activity.performedBy.firstName} ${activity.performedBy.lastName}` : ''}
              </p>
            </li>
          ))}
          {data.data.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)]">No activity recorded yet.</p>
          )}
        </ol>
      )}
    </div>
  );
}
