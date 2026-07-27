import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { useCustomerProfile, useUpsertCustomerProfile } from './useCustomerProfile';

export interface CustomerProfileSectionProps {
  companyId: string;
}

/**
 * Shown on a Company's detail page when `isCustomer` - a thin extension, not
 * a separate entity (DATABASE.md section 34). These fields override the
 * generic Company-level credit limit / payment terms for Billing's
 * calculations (due date, credit-limit warning) when set.
 */
export function CustomerProfileSection({ companyId }: CustomerProfileSectionProps) {
  const { data, isLoading } = useCustomerProfile(companyId);
  const upsert = useUpsertCustomerProfile(companyId);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [customerCode, setCustomerCode] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState('');
  const [customerSince, setCustomerSince] = useState('');

  const profile = data?.data ?? null;

  useEffect(() => {
    if (!profile) return;
    setCustomerCode(profile.customerCode ?? '');
    setCreditLimit(profile.creditLimit ?? '');
    setPaymentTermsDays(profile.paymentTermsDays?.toString() ?? '');
    setCustomerSince(profile.customerSince ?? '');
  }, [profile]);

  async function onSave() {
    setFormError(null);
    try {
      await upsert.mutateAsync({
        customerCode: customerCode || undefined,
        creditLimit: creditLimit || undefined,
        paymentTermsDays: paymentTermsDays ? Number(paymentTermsDays) : undefined,
        customerSince: customerSince || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [
            ...apiError.fieldErrors('customerCode'),
            ...apiError.fieldErrors('creditLimit'),
            ...apiError.fieldErrors('paymentTermsDays'),
            ...apiError.fieldErrors('customerSince'),
          ]
        : [];
      setFormError(fieldMessage ?? apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  if (isLoading) {
    return null;
  }

  return (
    <section className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Billing Details</h2>
        {!isEditing && (
          <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
            {profile ? 'Edit' : '+ Add Details'}
          </Button>
        )}
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-3 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
        >
          {formError}
        </div>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Customer code" value={customerCode} onChange={(event) => setCustomerCode(event.target.value)} />
            <TextField
              label="Credit limit"
              inputMode="decimal"
              helperText="Overrides the company's general credit limit for invoicing."
              value={creditLimit}
              onChange={(event) => setCreditLimit(event.target.value)}
            />
            <TextField
              label="Payment terms (days)"
              type="number"
              min={0}
              value={paymentTermsDays}
              onChange={(event) => setPaymentTermsDays(event.target.value)}
            />
            <TextField
              label="Customer since"
              type="date"
              value={customerSince}
              onChange={(event) => setCustomerSince(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} disabled={upsert.isPending}>
              Cancel
            </Button>
            <Button size="sm" isLoading={upsert.isPending} onClick={() => void onSave()}>
              Save
            </Button>
          </div>
        </div>
      ) : profile ? (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-secondary)]">Customer code</p>
            <p className="text-[var(--color-text-primary)]">{profile.customerCode ?? '—'}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Credit limit</p>
            <p className="text-[var(--color-text-primary)]">{profile.creditLimit ?? '—'}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Payment terms</p>
            <p className="text-[var(--color-text-primary)]">
              {profile.paymentTermsDays !== null ? `${profile.paymentTermsDays} days` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Customer since</p>
            <p className="text-[var(--color-text-primary)]">{profile.customerSince ?? '—'}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No billing details recorded yet - add a credit limit and payment terms to use for invoicing.
        </p>
      )}
    </section>
  );
}
