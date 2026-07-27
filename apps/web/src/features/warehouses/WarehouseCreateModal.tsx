import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Warehouse } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useAssignableUsers } from '@/features/users/useUsers';
import { ApiError } from '@/lib/api/api-error';
import { createWarehouseSchema, type CreateWarehouseFormValues } from './schemas/create-warehouse.schema';
import { useCreateWarehouse } from './useWarehouses';

export interface WarehouseCreateModalProps {
  onClose: () => void;
  onCreated: (warehouse: Warehouse) => void;
}

export function WarehouseCreateModal({ onClose, onCreated }: WarehouseCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [managerId, setManagerId] = useState('');
  const createWarehouse = useCreateWarehouse();
  const { data: users } = useAssignableUsers();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWarehouseFormValues>({ resolver: zodResolver(createWarehouseSchema) });

  async function onSubmit(values: CreateWarehouseFormValues) {
    setFormError(null);
    try {
      const warehouse = await createWarehouse.mutateAsync({
        code: values.code,
        name: values.name,
        managerId: managerId || undefined,
      });
      onCreated(warehouse);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Add Warehouse" onClose={onClose} size="sm">
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

          <TextField label="Code" autoFocus required error={errors.code?.message} {...register('code')} />
          <TextField label="Name" required error={errors.name?.message} {...register('name')} />

          <Select
            label="Manager"
            placeholder="Unassigned"
            value={managerId}
            onChange={(event) => setManagerId(event.target.value)}
            options={(users ?? []).map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName}`,
            }))}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
