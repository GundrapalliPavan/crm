import { useState } from 'react';
import { COMMUNICATION_CHANNELS, COMMUNICATION_STATUSES, type CommunicationChannel, type CommunicationStatus } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Select } from '@/components/common/Select';
import { communicationChannelLabel, communicationStatusLabel, communicationStatusTone } from './labels';
import { useCommunicationsList } from './useCommunications';

/** API.md sections 84-87 - the centralized log behind the Unified Communication Timeline. */
export function CommunicationListPage() {
  const [channel, setChannel] = useState<CommunicationChannel | ''>('');
  const [status, setStatus] = useState<CommunicationStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useCommunicationsList({
    page,
    pageSize: 25,
    channel: channel || undefined,
    status: status || undefined,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Communications</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Every WhatsApp, email, and SMS attempt sent from the CRM, in one place.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Select
            label="Channel"
            placeholder="Any channel"
            value={channel}
            onChange={(event) => {
              setChannel(event.target.value as CommunicationChannel | '');
              setPage(1);
            }}
            options={COMMUNICATION_CHANNELS.map((value) => ({ value, label: communicationChannelLabel(value) }))}
          />
        </div>
        <div className="w-48">
          <Select
            label="Status"
            placeholder="Any status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as CommunicationStatus | '');
              setPage(1);
            }}
            options={COMMUNICATION_STATUSES.map((value) => ({ value, label: communicationStatusLabel(value) }))}
          />
        </div>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load communications. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={channel || status ? 'No communications match these filters.' : 'No communications yet'}
          description={
            channel || status
              ? 'Clear filters or adjust your search.'
              : 'Communications appear here once one is sent from a Lead, Company, or Invoice.'
          }
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((communication) => (
                  <tr key={communication.id} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {communicationChannelLabel(communication.channel)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{communication.recipient}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-[var(--color-text-secondary)]">
                      {communication.subject ?? communication.messageBody ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(communication.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={communicationStatusTone(communication.status)}>
                        {communicationStatusLabel(communication.status)}
                      </Badge>
                      {communication.failureReason && (
                        <p className="mt-1 text-[12px] text-[var(--color-danger-text)]">{communication.failureReason}</p>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} communications)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
