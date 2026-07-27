import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { COMPANY_TYPES } from '@crm/types';
import type { Company, CreateCompanyRequest } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { companyTypeLabel } from './labels';
import { createCompanySchema, type CreateCompanyFormValues } from './schemas/create-company.schema';
import { useCreateCompany } from './useCompanies';

export interface CompanyCreateModalProps {
  onClose: () => void;
  onCreated: (company: Company) => void;
}

export function CompanyCreateModal({ onClose, onCreated }: CompanyCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateRequest, setDuplicateRequest] = useState<CreateCompanyRequest | null>(null);
  const createCompany = useCreateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyFormValues>({ resolver: zodResolver(createCompanySchema) });

  async function submitCompany(request: CreateCompanyRequest) {
    setFormError(null);
    try {
      const company = await createCompany.mutateAsync(request);
      onCreated(company);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
      setDuplicateRequest(apiError?.code === 'DUPLICATE_RESOURCE' ? request : null);
    }
  }

  async function onSubmit(values: CreateCompanyFormValues) {
    await submitCompany({
      name: values.name,
      companyType: values.companyType,
      phone: values.phone || undefined,
      email: values.email || undefined,
      gstin: values.gstin || undefined,
      stateCode: values.stateCode || undefined,
      isCustomer: values.isCustomer,
      isSupplier: values.isSupplier,
    });
  }

  return (
    <Modal title="Add Company" onClose={onClose} size="md">
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
                  onClick={() => void submitCompany({ ...duplicateRequest, confirmDuplicate: true })}
                >
                  Create anyway
                </button>
              )}
            </div>
          )}

          <TextField label="Company name" autoFocus required error={errors.name?.message} {...register('name')} />

          <Select
            label="Type"
            required
            placeholder="Select a type"
            error={errors.companyType?.message}
            options={COMPANY_TYPES.map((value) => ({ value, label: companyTypeLabel(value) }))}
            {...register('companyType')}
          />

          <TextField label="Phone" type="tel" {...register('phone')} />
          <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <TextField label="GSTIN" {...register('gstin')} />
          <TextField
            label="GST state code"
            helperText='2-digit code, e.g. "36" for Telangana - used to determine CGST/SGST vs IGST on invoices.'
            {...register('stateCode')}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
              <input type="checkbox" {...register('isCustomer')} />
              Customer
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
              <input type="checkbox" {...register('isSupplier')} />
              Supplier
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Company'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
