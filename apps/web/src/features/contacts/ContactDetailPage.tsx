import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AddressesSection } from '@/features/addresses/AddressesSection';
import { FileAttachmentsSection } from '@/features/files/FileAttachmentsSection';
import { useArchiveContact, useContact } from './useContacts';

export function ContactDetailPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading, isError } = useContact(contactId ?? '');
  const archiveContact = useArchiveContact();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading contact…</p>;
  }

  if (isError || !contact) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this contact. Check your connection and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">
              {contact.firstName} {contact.lastName ?? ''}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {contact.jobTitle ?? 'Independent contact'}
              {contact.company ? ` · ${contact.company.name}` : ''}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsArchiveOpen(true)}>
            Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5 text-sm">
        <div>
          <p className="text-[var(--color-text-secondary)]">Phone</p>
          <p className="text-[var(--color-text-primary)]">{contact.phone ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Email</p>
          <p className="text-[var(--color-text-primary)]">{contact.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Company</p>
          <p className="text-[var(--color-text-primary)]">{contact.company?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Owner</p>
          <p className="text-[var(--color-text-primary)]">
            {contact.owner ? `${contact.owner.firstName} ${contact.owner.lastName}` : '—'}
          </p>
        </div>
      </div>

      <AddressesSection ownerType="contact" ownerId={contact.id} />

      <FileAttachmentsSection relatedEntityType="contact" relatedEntityId={contact.id} />

      {isArchiveOpen && (
        <ConfirmDialog
          title="Archive contact?"
          description="This contact will no longer appear in the default list. Its history is kept."
          confirmLabel="Archive"
          destructive
          isConfirming={archiveContact.isPending}
          onConfirm={() => void archiveContact.mutateAsync(contact.id).then(() => navigate('/contacts'))}
          onCancel={() => setIsArchiveOpen(false)}
        />
      )}
    </div>
  );
}
