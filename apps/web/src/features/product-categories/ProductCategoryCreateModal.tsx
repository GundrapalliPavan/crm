import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ProductCategory } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { createCategorySchema, type CreateCategoryFormValues } from './schemas/create-category.schema';
import { useCreateProductCategory, useProductCategories } from './useProductCategories';

export interface ProductCategoryCreateModalProps {
  onClose: () => void;
  onCreated: (category: ProductCategory) => void;
}

/** DATABASE.md section 39: hierarchy is optional - parent defaults to top-level. */
export function ProductCategoryCreateModal({ onClose, onCreated }: ProductCategoryCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [parentId, setParentId] = useState('');
  const { data: categories } = useProductCategories();
  const createCategory = useCreateProductCategory();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryFormValues>({ resolver: zodResolver(createCategorySchema) });

  async function onSubmit(values: CreateCategoryFormValues) {
    setFormError(null);
    try {
      const category = await createCategory.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        parentId: parentId || undefined,
      });
      onCreated(category);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Add Category" onClose={onClose} size="sm">
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

          <Select
            label="Parent category"
            placeholder="Top-level"
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            options={(categories?.data ?? []).map((category) => ({ value: category.id, label: category.name }))}
          />

          <TextField label="Description" {...register('description')} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
