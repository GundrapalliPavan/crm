import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Brand } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { createBrandSchema, type CreateBrandFormValues } from './schemas/create-brand.schema';
import { useCreateBrand } from './useBrands';

export interface BrandCreateModalProps {
  onClose: () => void;
  onCreated: (brand: Brand) => void;
}

export function BrandCreateModal({ onClose, onCreated }: BrandCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const createBrand = useCreateBrand();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBrandFormValues>({ resolver: zodResolver(createBrandSchema) });

  async function onSubmit(values: CreateBrandFormValues) {
    setFormError(null);
    try {
      const brand = await createBrand.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });
      onCreated(brand);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Add Brand" onClose={onClose} size="sm">
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

          <TextField label="Name" autoFocus required error={errors.name?.message} {...register('name')} />
          <TextField label="Description" {...register('description')} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
