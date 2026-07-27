import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Company } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { useUpdateCompany } from './useCompanies';

export interface CompanyEditModalProps {
  company: Company;
  onClose: () => void;
  onUpdated: (company: Company) => void;
}

interface EditCompanyFormValues {
  phone: string;
  email: string;
  gstin: string;
  stateCode: string;
  creditLimit: string;
  paymentTermsDays: string;
}

/**
 * There is no general company-editing screen (Module 1 only shipped Create +
 * Archive) - this covers the fields Billing's GST and credit-limit
 * calculations depend on (state code, credit limit, payment terms), which
 * otherwise have no update path for a company created before Module 6.
 */
export function CompanyEditModal({ company, onClose, onUpdated }: CompanyEditModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const updateCompany = useUpdateCompany(company.id);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EditCompanyFormValues>({
    defaultValues: {
      phone: company.phone ?? '',
      email: company.email ?? '',
      gstin: company.gstin ?? '',
      stateCode: company.stateCode ?? '',
      creditLimit: company.creditLimit ?? '',
      paymentTermsDays: company.paymentTermsDays?.toString() ?? '',
    },
  });

  async function onSubmit(values: EditCompanyFormValues) {
    setFormError(null);
    try {
      const updated = await updateCompany.mutateAsync({
        phone: values.phone || undefined,
        email: values.email || undefined,
        gstin: values.gstin || undefined,
        stateCode: values.stateCode || undefined,
        creditLimit: values.creditLimit || undefined,
        paymentTermsDays: values.paymentTermsDays ? Number(values.paymentTermsDays) : undefined,
      });
      onUpdated(updated);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [...apiError.fieldErrors('stateCode'), ...apiError.fieldErrors('gstin'), ...apiError.fieldErrors('creditLimit')]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Edit Company Details" onClose={onClose} size="md">
      <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
            >
              {formError}
            </div>
          )}

          <TextField label="Phone" type="tel" {...register('phone')} />
          <TextField label="Email" type="email" {...register('email')} />
          <TextField label="GSTIN" {...register('gstin')} />
          <TextField
            label="GST state code"
            helperText='2-digit code, e.g. "36" for Telangana - used to determine CGST/SGST vs IGST on invoices.'
            {...register('stateCode')}
          />
          <TextField label="Credit limit" inputMode="decimal" {...register('creditLimit')} />
          <TextField label="Payment terms (days)" type="number" min={0} max={365} {...register('paymentTermsDays')} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
