import { useState } from 'react';
import type { AuditLogEntry } from '@crm/types';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { TextField } from '@/components/common/TextField';
import { useAuth } from '@/lib/auth/useAuth';
import { useAuditLogs } from './useAudit';

function actorLabel(entry: AuditLogEntry): string {
  if (!entry.actor) return 'System';
  return `${entry.actor.firstName} ${entry.actor.lastName}`;
}

function JsonBlock({ label, value }: { label: string; value: Record<string, unknown> | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</p>
      <pre className="overflow-x-auto rounded-[var(--radius-input)] bg-[var(--color-bg-app)] p-3 font-mono text-xs text-[var(--color-text-primary)]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function AuditDetailModal({ entry, onClose }: { entry: AuditLogEntry; onClose: () => void }) {
  return (
    <Modal title="Audit entry" onClose={onClose} size="md">
      <div className="flex flex-col gap-4 text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <dt className="text-[var(--color-text-secondary)]">Who</dt>
          <dd className="text-[var(--color-text-primary)]">
            {actorLabel(entry)}
            {entry.actor && <span className="text-[var(--color-text-secondary)]"> ({entry.actor.email})</span>}
          </dd>
          <dt className="text-[var(--color-text-secondary)]">When</dt>
          <dd className="text-[var(--color-text-primary)]">{new Date(entry.createdAt).toLocaleString()}</dd>
          <dt className="text-[var(--color-text-secondary)]">Action</dt>
          <dd className="font-mono text-[var(--color-text-primary)]">{entry.action}</dd>
          <dt className="text-[var(--color-text-secondary)]">Entity</dt>
          <dd className="font-mono text-[var(--color-text-primary)]">
            {entry.entityType}
            {entry.entityId && <span className="text-[var(--color-text-secondary)]"> / {entry.entityId}</span>}
          </dd>
          <dt className="text-[var(--color-text-secondary)]">IP address</dt>
          <dd className="font-mono text-[var(--color-text-primary)]">{entry.ipAddress ?? '—'}</dd>
          <dt className="text-[var(--color-text-secondary)]">Request ID</dt>
          <dd className="font-mono text-[var(--color-text-primary)]">{entry.requestId ?? '—'}</dd>
        </dl>

        <JsonBlock label="Before" value={entry.beforeData} />
        <JsonBlock label="After" value={entry.afterData} />
        <JsonBlock label="Metadata" value={entry.metadata} />

        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * DATABASE.md sections 99-102, PROJECT.md section 48 - a system-level trail
 * of every create/edit/delete the app records, distinct from the
 * per-record Communication log. Administrator-only (`audit.read`).
 */
export function AuditLogPage() {
  const { can } = useAuth();
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const { data, isLoading, isError } = useAuditLogs({
    page,
    pageSize: 25,
    entityType: entityType.trim() || undefined,
    action: action.trim() || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  if (!can('audit.read')) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-6">
        <EmptyState title="You don't have access to the audit log" description="Ask an administrator for access if you need it." />
      </div>
    );
  }

  const hasFilters = Boolean(entityType || action || dateFrom || dateTo);

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Audit Log</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Every create, edit, and delete recorded across the CRM - who did it, when, and what changed.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-44">
          <TextField
            label="Entity type"
            placeholder="e.g. lead, invoice"
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-52">
          <TextField
            label="Action"
            placeholder="e.g. lead.created"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-40">
          <TextField
            label="From"
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-40">
          <TextField
            label="To"
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load the audit log. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={hasFilters ? 'No entries match these filters.' : 'No audit entries yet'}
          description={
            hasFilters
              ? 'Clear filters or adjust your search.'
              : 'Entries appear here as create, edit, and delete operations happen across the CRM.'
          }
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{actorLabel(entry)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">{entry.action}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                      {entry.entityType}
                      {entry.entityId && <span className="block text-[11px] text-[var(--color-text-secondary)]">{entry.entityId}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="secondary" onClick={() => setSelected(entry)}>
                        View
                      </Button>
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
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} entries)
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

      {selected && <AuditDetailModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
