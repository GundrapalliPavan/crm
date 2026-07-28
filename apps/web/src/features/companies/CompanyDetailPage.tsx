import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AddressesSection } from '@/features/addresses/AddressesSection';
import { CommunicationLogSection } from '@/features/communications/CommunicationLogSection';
import { ContactCreateModal } from '@/features/contacts/ContactCreateModal';
import { CustomerProfileSection } from '@/features/customers/CustomerProfileSection';
import { FileAttachmentsSection } from '@/features/files/FileAttachmentsSection';
import { SupplierProfileSection } from '@/features/suppliers/SupplierProfileSection';
import { CompanyEditModal } from './CompanyEditModal';
import { companyTypeLabel } from './labels';
import { useArchiveCompany, useCompany, useCompanyContacts } from './useCompanies';

/**
 * CRM.md section 95 (Account Detail IA): header + overview + contacts. Sales/
 * Finance summary sections are omitted - those modules don't exist yet, and
 * the CRM should link to them rather than duplicate their data once they do.
 */
export function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading, isError } = useCompany(companyId ?? '');
  const { data: contacts } = useCompanyContacts(companyId ?? '');
  const archiveCompany = useArchiveCompany();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading company…</p>;
  }

  if (isError || !company) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this company. Check your connection and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{company.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{companyTypeLabel(company.companyType)}</Badge>
              {company.isCustomer && <Badge tone="info">Customer</Badge>}
              {company.isSupplier && <Badge tone="neutral">Supplier</Badge>}
              {!company.isActive && <Badge tone="critical">Inactive</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsArchiveOpen(true)}>
              Archive
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5 text-sm">
        <div>
          <p className="text-[var(--color-text-secondary)]">Phone</p>
          <p className="text-[var(--color-text-primary)]">{company.phone ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Email</p>
          <p className="text-[var(--color-text-primary)]">{company.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">GSTIN</p>
          <p className="text-[var(--color-text-primary)]">{company.gstin ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">GST state code</p>
          <p className="text-[var(--color-text-primary)]">{company.stateCode ?? '—'}</p>
        </div>
        <div>
          <p className="text-[var(--color-text-secondary)]">Owner</p>
          <p className="text-[var(--color-text-primary)]">
            {company.owner ? `${company.owner.firstName} ${company.owner.lastName}` : '—'}
          </p>
        </div>
      </div>

      {company.isCustomer && <CustomerProfileSection companyId={company.id} />}
      {company.isSupplier && <SupplierProfileSection companyId={company.id} />}

      <AddressesSection ownerType="company" ownerId={company.id} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Contacts</h2>
          <Button size="sm" variant="secondary" onClick={() => setIsContactModalOpen(true)}>
            + Add Contact
          </Button>
        </div>
        <ul className="flex flex-col gap-2">
          {contacts?.data.map((contact) => (
            <li
              key={contact.id}
              onClick={() => navigate(`/contacts/${contact.id}`)}
              className="cursor-pointer rounded-[var(--radius-card)] border border-[var(--color-border-default)] px-3 py-2 hover:bg-[var(--color-bg-app)]"
            >
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {contact.firstName} {contact.lastName ?? ''}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {contact.jobTitle ?? '—'} {contact.phone ? `· ${contact.phone}` : ''}
              </p>
            </li>
          ))}
          {contacts?.data.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)]">No contacts linked to this company yet.</p>
          )}
        </ul>
      </section>

      <FileAttachmentsSection relatedEntityType="company" relatedEntityId={company.id} />

      <CommunicationLogSection relatedEntityType="company" relatedEntityId={company.id} />

      {isArchiveOpen && (
        <ConfirmDialog
          title="Archive company?"
          description="This company will no longer appear in the default list. Its history is kept."
          confirmLabel="Archive"
          destructive
          isConfirming={archiveCompany.isPending}
          onConfirm={() => void archiveCompany.mutateAsync(company.id).then(() => navigate('/companies'))}
          onCancel={() => setIsArchiveOpen(false)}
        />
      )}

      {isEditOpen && (
        <CompanyEditModal company={company} onClose={() => setIsEditOpen(false)} onUpdated={() => setIsEditOpen(false)} />
      )}

      {isContactModalOpen && (
        <ContactCreateModal
          defaultCompanyId={company.id}
          onClose={() => setIsContactModalOpen(false)}
          onCreated={(contact) => {
            setIsContactModalOpen(false);
            navigate(`/contacts/${contact.id}`);
          }}
        />
      )}
    </div>
  );
}
