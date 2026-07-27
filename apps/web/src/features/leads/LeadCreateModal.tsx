import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LEAD_TYPES } from '@crm/types';
import type { CreateLeadRequest, Lead } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { useLeadSources } from '@/features/lead-sources/useLeadSources';
import { useAssignableUsers } from '@/features/users/useUsers';
import { createLeadSchema, type CreateLeadFormValues } from './schemas/create-lead.schema';
import { leadTypeLabel } from './status';
import { useCreateLead } from './useLeads';

export interface LeadCreateModalProps {
  onClose: () => void;
  onCreated: (lead: Lead) => void;
}

/** CRM.md section 11: capture the practical minimum now, enrich the rest later from the lead's own page. */
export function LeadCreateModal({ onClose, onCreated }: LeadCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  /** CRM.md section 45: a blocked duplicate keeps its request here so "Create anyway" can resubmit
   *  it unchanged with confirmDuplicate - the warning must have a real way past it, not just a message. */
  const [duplicateRequest, setDuplicateRequest] = useState<CreateLeadRequest | null>(null);
  const [sourceId, setSourceId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const { data: sources } = useLeadSources();
  const { data: users } = useAssignableUsers();
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadFormValues>({ resolver: zodResolver(createLeadSchema) });

  async function submitLead(request: CreateLeadRequest) {
    setFormError(null);
    try {
      const lead = await createLead.mutateAsync(request);
      onCreated(lead);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
      setDuplicateRequest(apiError?.code === 'DUPLICATE_RESOURCE' ? request : null);
    }
  }

  async function onSubmit(values: CreateLeadFormValues) {
    await submitLead({
      firstName: values.firstName,
      companyName: values.companyName || undefined,
      phone: values.phone || undefined,
      leadType: values.leadType,
      sourceId: sourceId || undefined,
      assignedTo: assignedTo || undefined,
    });
  }

  return (
    <Modal title="Add Lead" onClose={onClose} size="md">
      <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
            >
              <p>{formError}</p>
              {duplicateRequest && (
                <button
                  type="button"
                  className="mt-2 font-medium underline"
                  onClick={() => void submitLead({ ...duplicateRequest, confirmDuplicate: true })}
                >
                  Create anyway
                </button>
              )}
            </div>
          )}

          <TextField
            label="Name"
            autoFocus
            required
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <TextField label="Business name" {...register('companyName')} />

          <TextField label="Phone" type="tel" {...register('phone')} />

          <Select
            label="Lead type"
            required
            placeholder="Select a type"
            error={errors.leadType?.message}
            options={LEAD_TYPES.map((value) => ({ value, label: leadTypeLabel(value) }))}
            {...register('leadType')}
          />

          <Select
            label="Source"
            placeholder="Select a source"
            value={sourceId}
            onChange={(event) => setSourceId(event.target.value)}
            options={(sources ?? []).map((source) => ({ value: source.id, label: source.name }))}
          />

          <Select
            label="Assign to"
            placeholder="Unassigned"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            options={(users ?? []).map((assignee) => ({
              value: assignee.id,
              label: `${assignee.firstName} ${assignee.lastName}`,
            }))}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
