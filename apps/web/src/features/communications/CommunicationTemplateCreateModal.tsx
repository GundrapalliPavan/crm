import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { COMMUNICATION_CHANNELS, type CommunicationChannel, type CommunicationTemplate } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { communicationChannelLabel } from './labels';
import { useCreateCommunicationTemplate } from './useCommunications';

export interface CommunicationTemplateCreateModalProps {
  onClose: () => void;
  onCreated: (template: CommunicationTemplate) => void;
}

interface FormValues {
  name: string;
  channel: CommunicationChannel | '';
  purpose: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export function CommunicationTemplateCreateModal({ onClose, onCreated }: CommunicationTemplateCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const createTemplate = useCreateCommunicationTemplate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: '', channel: '', purpose: '', subjectTemplate: '', bodyTemplate: '' },
  });
  const channel = watch('channel');

  async function onSubmit(values: FormValues) {
    setFormError(null);
    if (!values.channel) {
      setFormError('Choose a channel.');
      return;
    }
    try {
      const template = await createTemplate.mutateAsync({
        name: values.name,
        channel: values.channel,
        purpose: values.purpose,
        subjectTemplate: values.subjectTemplate || undefined,
        bodyTemplate: values.bodyTemplate,
      });
      onCreated(template);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="New Communication Template" onClose={onClose} size="md">
      <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
            >
              {formError}
            </div>
          )}

          <TextField label="Name" required autoFocus error={errors.name?.message} {...register('name', { required: 'Enter a name.' })} />

          <Select
            label="Channel"
            required
            placeholder="Select a channel"
            options={COMMUNICATION_CHANNELS.map((value) => ({ value, label: communicationChannelLabel(value) }))}
            {...register('channel', { required: true })}
          />

          <TextField
            label="Purpose"
            required
            helperText='e.g. "invoice", "payment_reminder", "quotation_follow_up"'
            error={errors.purpose?.message}
            {...register('purpose', { required: 'Enter a purpose.' })}
          />

          {channel === 'email' && <TextField label="Subject" {...register('subjectTemplate')} />}

          <Textarea
            label="Body"
            required
            helperText="Use {{variable_name}} placeholders - they must be supplied whenever this template is used to send."
            error={errors.bodyTemplate?.message}
            {...register('bodyTemplate', { required: 'Enter a message body.' })}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
