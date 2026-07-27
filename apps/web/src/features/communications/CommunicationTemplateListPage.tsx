import { useState } from 'react';
import type { CommunicationTemplate } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { CommunicationTemplateCreateModal } from './CommunicationTemplateCreateModal';
import { communicationChannelLabel, templateStatusLabel, templateStatusTone } from './labels';
import { useCommunicationTemplatesList, useUpdateCommunicationTemplate } from './useCommunications';

function TemplateRow({ template }: { template: CommunicationTemplate }) {
  const updateTemplate = useUpdateCommunicationTemplate(template.id);
  const nextStatus = template.status === 'active' ? 'inactive' : 'active';

  return (
    <tr className="border-b border-[var(--color-border-default)] last:border-0">
      <td className="px-4 py-3">
        <div className="font-medium text-[var(--color-text-primary)]">{template.name}</div>
        <div className="text-[13px] text-[var(--color-text-secondary)]">{template.purpose}</div>
      </td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{communicationChannelLabel(template.channel)}</td>
      <td className="px-4 py-3">
        <Badge tone={templateStatusTone(template.status)}>{templateStatusLabel(template.status)}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="secondary"
          isLoading={updateTemplate.isPending}
          onClick={() => void updateTemplate.mutateAsync({ status: nextStatus })}
        >
          {template.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
      </td>
    </tr>
  );
}

export function CommunicationTemplateListPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError } = useCommunicationTemplatesList({ page: 1, pageSize: 100 });

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Communication Templates</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Reusable WhatsApp, email, and SMS message templates with {'{{variable}}'} placeholders.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ New Template</Button>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load templates. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No templates yet"
          description="Create a template to reuse consistent wording across leads, customers, and invoices."
          action={<Button onClick={() => setIsCreateOpen(true)}>+ New Template</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>{!isLoading && data?.data.map((template) => <TemplateRow key={template.id} template={template} />)}</tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <CommunicationTemplateCreateModal onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
