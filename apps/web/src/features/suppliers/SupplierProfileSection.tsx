import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { useSupplierProfile, useUpsertSupplierProfile } from './useSupplierProfile';

export interface SupplierProfileSectionProps {
  companyId: string;
}

/** Shown on a Company's detail page when `isSupplier` - a thin extension, not a separate entity (DATABASE.md section 62). */
export function SupplierProfileSection({ companyId }: SupplierProfileSectionProps) {
  const { data, isLoading } = useSupplierProfile(companyId);
  const upsert = useUpsertSupplierProfile(companyId);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [supplierCode, setSupplierCode] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState('');
  const [supplierSince, setSupplierSince] = useState('');
  const [notes, setNotes] = useState('');

  const profile = data?.data ?? null;

  useEffect(() => {
    if (!profile) return;
    setSupplierCode(profile.supplierCode ?? '');
    setPaymentTermsDays(profile.paymentTermsDays?.toString() ?? '');
    setSupplierSince(profile.supplierSince ?? '');
    setNotes(profile.notes ?? '');
  }, [profile]);

  async function onSave() {
    setFormError(null);
    try {
      await upsert.mutateAsync({
        supplierCode: supplierCode || undefined,
        paymentTermsDays: paymentTermsDays ? Number(paymentTermsDays) : undefined,
        supplierSince: supplierSince || undefined,
        notes: notes || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      const [fieldMessage] = apiError?.isValidationError
        ? [
            ...apiError.fieldErrors('supplierCode'),
            ...apiError.fieldErrors('paymentTermsDays'),
            ...apiError.fieldErrors('supplierSince'),
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
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Supplier Details</h2>
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
            <TextField label="Supplier code" value={supplierCode} onChange={(event) => setSupplierCode(event.target.value)} />
            <TextField
              label="Payment terms (days)"
              type="number"
              min={0}
              value={paymentTermsDays}
              onChange={(event) => setPaymentTermsDays(event.target.value)}
            />
            <TextField
              label="Supplier since"
              type="date"
              value={supplierSince}
              onChange={(event) => setSupplierSince(event.target.value)}
            />
          </div>
          <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
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
            <p className="text-[var(--color-text-secondary)]">Supplier code</p>
            <p className="text-[var(--color-text-primary)]">{profile.supplierCode ?? '—'}</p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Payment terms</p>
            <p className="text-[var(--color-text-primary)]">
              {profile.paymentTermsDays !== null ? `${profile.paymentTermsDays} days` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)]">Supplier since</p>
            <p className="text-[var(--color-text-primary)]">{profile.supplierSince ?? '—'}</p>
          </div>
          {profile.notes && (
            <div className="col-span-2">
              <p className="text-[var(--color-text-secondary)]">Notes</p>
              <p className="text-[var(--color-text-primary)]">{profile.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-secondary)]">
          No supplier details recorded yet - add a supplier code and payment terms to use in purchase orders.
        </p>
      )}
    </section>
  );
}
