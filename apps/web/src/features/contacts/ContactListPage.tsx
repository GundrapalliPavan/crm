import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { TextField } from '@/components/common/TextField';
import { ContactCreateModal } from './ContactCreateModal';
import { useContactsList } from './useContacts';

/** CRM.md section 56, UX.md section 29: name, company, role, phone, email at a glance. */
export function ContactListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError } = useContactsList({ page, pageSize: 25, search: search || undefined });

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Contacts</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">People, with or without a company.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Contact</Button>
      </div>

      <div className="mb-4 w-64">
        <TextField
          label="Search"
          placeholder="Name, phone, email"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load contacts. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title={search ? 'No contacts match this search.' : 'No contacts yet'}
          description={search ? 'Clear the search and try again.' : 'Add your first contact to start building relationships.'}
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Contact</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                    className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {contact.firstName} {contact.lastName ?? ''}
                      </div>
                      {contact.jobTitle && (
                        <div className="text-[13px] text-[var(--color-text-secondary)]">{contact.jobTitle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{contact.company?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{contact.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{contact.email ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} contacts)
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

      {isCreateOpen && (
        <ContactCreateModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(contact) => {
            setIsCreateOpen(false);
            navigate(`/contacts/${contact.id}`);
          }}
        />
      )}
    </div>
  );
}
