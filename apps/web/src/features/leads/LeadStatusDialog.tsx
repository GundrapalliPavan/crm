import { useState } from 'react';
import { LEAD_LOST_REASONS, LEAD_STATUSES } from '@crm/types';
import type { Lead, LeadLostReason, LeadStatus } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { ApiError } from '@/lib/api/api-error';
import { leadStatusLabel, lostReasonLabel } from './status';
import { useTransitionLeadStatus } from './useLeads';

export interface LeadStatusDialogProps {
  lead: Lead;
  onClose: () => void;
}

/** CRM.md sections 49, 51: a lost reason is required going to `lost`; reopening clears it. */
export function LeadStatusDialog({ lead, onClose }: LeadStatusDialogProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [lostReason, setLostReason] = useState<LeadLostReason | ''>('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const transition = useTransitionLeadStatus(lead.id);

  async function handleSubmit() {
    setFormError(null);
    try {
      await transition.mutateAsync({
        status,
        lostReason: status === 'lost' ? (lostReason || undefined) : undefined,
        notes: notes || undefined,
      });
      onClose();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Change Status" onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        {formError && (
          <div
            role="alert"
            className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
          >
            {formError}
          </div>
        )}

        <Select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as LeadStatus)}
          options={LEAD_STATUSES.map((value) => ({ value, label: leadStatusLabel(value) }))}
        />

        {status === 'lost' && (
          <Select
            label="Reason"
            required
            placeholder="Select a reason"
            value={lostReason}
            onChange={(event) => setLostReason(event.target.value as LeadLostReason)}
            options={LEAD_LOST_REASONS.map((value) => ({ value, label: lostReasonLabel(value) }))}
          />
        )}

        <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={transition.isPending}>
          Cancel
        </Button>
        <Button
          isLoading={transition.isPending}
          disabled={status === 'lost' && !lostReason}
          onClick={() => void handleSubmit()}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
