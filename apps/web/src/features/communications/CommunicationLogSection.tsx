import { useState } from 'react';
import type { RelatedEntityType } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/lib/auth/useAuth';
import { LogCommunicationModal } from './LogCommunicationModal';
import { communicationChannelLabel, communicationStatusLabel, communicationStatusTone } from './labels';
import { useCommunicationsList } from './useCommunications';

export interface CommunicationLogSectionProps {
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
}

/** PROJECT.md sections 20-21 - a lightweight, per-record slice of the Unified Communication Timeline, not a separate module page. */
export function CommunicationLogSection({ relatedEntityType, relatedEntityId }: CommunicationLogSectionProps) {
  const { can } = useAuth();
  const [isLogOpen, setIsLogOpen] = useState(false);
  const { data, isLoading } = useCommunicationsList({ relatedEntityType, relatedEntityId, pageSize: 10 });

  return (
    <section className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Communication</h2>
        {can('communication.send') && (
          <Button size="sm" variant="secondary" onClick={() => setIsLogOpen(true)}>
            + Log Communication
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>}

      {!isLoading && data?.data.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)]">No communication logged yet.</p>
      )}

      {!isLoading && data && data.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.data.map((communication) => (
            <li key={communication.id} className="border-b border-[var(--color-border-default)] pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {communicationChannelLabel(communication.channel)} · {communication.recipient}
                </p>
                <Badge tone={communicationStatusTone(communication.status)}>
                  {communicationStatusLabel(communication.status)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {communication.subject ?? communication.messageBody}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                {new Date(communication.createdAt).toLocaleString()}
                {communication.failureReason && ` · ${communication.failureReason}`}
              </p>
            </li>
          ))}
        </ul>
      )}

      {isLogOpen && (
        <LogCommunicationModal
          relatedEntityType={relatedEntityType}
          relatedEntityId={relatedEntityId}
          onClose={() => setIsLogOpen(false)}
          onLogged={() => setIsLogOpen(false)}
        />
      )}
    </section>
  );
}
