import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Contact, CreateContactRequest } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useCompaniesList } from '@/features/companies/useCompanies';
import { ApiError } from '@/lib/api/api-error';
import { createContactSchema, type CreateContactFormValues } from './schemas/create-contact.schema';
import { useCreateContact } from './useContacts';

export interface ContactCreateModalProps {
  onClose: () => void;
  onCreated: (contact: Contact) => void;
  /** Pre-selects a company when opened from a company's detail page. */
  defaultCompanyId?: string;
}

/** CRM.md section 57: a contact need not belong to a company - "Independent Contacts". */
export function ContactCreateModal({ onClose, onCreated, defaultCompanyId }: ContactCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateRequest, setDuplicateRequest] = useState<CreateContactRequest | null>(null);
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? '');
  const { data: companies } = useCompaniesList({ pageSize: 100 });
  const createContact = useCreateContact();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactFormValues>({ resolver: zodResolver(createContactSchema) });

  async function submitContact(request: CreateContactRequest) {
    setFormError(null);
    try {
      const contact = await createContact.mutateAsync(request);
      onCreated(contact);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
      setDuplicateRequest(apiError?.code === 'DUPLICATE_RESOURCE' ? request : null);
    }
  }

  async function onSubmit(values: CreateContactFormValues) {
    await submitContact({
      firstName: values.firstName,
      lastName: values.lastName || undefined,
      jobTitle: values.jobTitle || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      companyId: companyId || undefined,
    });
  }

  return (
    <Modal title="Add Contact" onClose={onClose} size="md">
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
                  onClick={() => void submitContact({ ...duplicateRequest, confirmDuplicate: true })}
                >
                  Create anyway
                </button>
              )}
            </div>
          )}

          <TextField label="First name" autoFocus required error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Last name" {...register('lastName')} />
          <TextField label="Job title" {...register('jobTitle')} />
          <TextField label="Phone" type="tel" {...register('phone')} />
          <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Select
            label="Company"
            placeholder="Independent contact"
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            options={(companies?.data ?? []).map((company) => ({ value: company.id, label: company.name }))}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
