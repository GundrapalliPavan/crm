import { useMemo, useState } from 'react';
import { COMMUNICATION_CHANNELS, type CommunicationChannel, type RelatedEntityType } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { communicationChannelLabel } from './labels';
import { useCommunicationTemplatesList, useCreateCommunication } from './useCommunications';

export interface LogCommunicationModalProps {
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
  onClose: () => void;
  onLogged: () => void;
}

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

function extractVariableNames(text: string): string[] {
  const names = new Set<string>();
  for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
    names.add(match[1]);
  }
  return [...names];
}

/** API.md section 85 - either an approved template (with its variables filled in) or an ad-hoc message. */
export function LogCommunicationModal({ relatedEntityType, relatedEntityId, onClose, onLogged }: LogCommunicationModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [channel, setChannel] = useState<CommunicationChannel>('whatsapp');
  const [recipient, setRecipient] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const { data: templates } = useCommunicationTemplatesList({ channel, status: 'active', pageSize: 100 });
  const createCommunication = useCreateCommunication();

  const selectedTemplate = templates?.data.find((template) => template.id === templateId) ?? null;
  const variableNames = useMemo(
    () => (selectedTemplate ? extractVariableNames(`${selectedTemplate.subjectTemplate ?? ''} ${selectedTemplate.bodyTemplate}`) : []),
    [selectedTemplate],
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!recipient) {
      setFormError('Enter a recipient.');
      return;
    }
    if (!templateId && !messageBody) {
      setFormError('Choose a template or write a message.');
      return;
    }

    try {
      await createCommunication.mutateAsync({
        channel,
        recipient,
        templateId: templateId || undefined,
        variables: templateId ? variables : undefined,
        subject: templateId ? undefined : subject || undefined,
        messageBody: templateId ? undefined : messageBody,
        relatedEntityType,
        relatedEntityId,
      });
      onLogged();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [...apiError.fieldErrors('variables'), ...apiError.fieldErrors('messageBody')]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Log Communication" onClose={onClose} size="md">
      <form noValidate onSubmit={(event) => void onSubmit(event)}>
        <div className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Channel"
              required
              value={channel}
              onChange={(event) => {
                setChannel(event.target.value as CommunicationChannel);
                setTemplateId('');
                setVariables({});
              }}
              options={COMMUNICATION_CHANNELS.map((value) => ({ value, label: communicationChannelLabel(value) }))}
            />
            <TextField
              label="Recipient"
              required
              placeholder={channel === 'email' ? 'name@example.com' : '+91XXXXXXXXXX'}
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>

          <Select
            label="Template"
            placeholder="No template - write a message"
            value={templateId}
            onChange={(event) => {
              setTemplateId(event.target.value);
              setVariables({});
            }}
            options={(templates?.data ?? []).map((template) => ({ value: template.id, label: template.name }))}
          />

          {templateId && variableNames.length > 0 && (
            <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-default)] p-3">
              {variableNames.map((name) => (
                <TextField
                  key={name}
                  label={name}
                  value={variables[name] ?? ''}
                  onChange={(event) => setVariables((current) => ({ ...current, [name]: event.target.value }))}
                />
              ))}
            </div>
          )}

          {!templateId && (
            <>
              {channel === 'email' && <TextField label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />}
              <Textarea label="Message" required value={messageBody} onChange={(event) => setMessageBody(event.target.value)} />
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createCommunication.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createCommunication.isPending}>
            {createCommunication.isPending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
