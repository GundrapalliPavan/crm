import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Team } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { TextField } from '@/components/common/TextField';
import { useAssignableUsers } from '@/features/users/useUsers';
import { ApiError } from '@/lib/api/api-error';
import { createTeamSchema, type CreateTeamFormValues } from './schemas/create-team.schema';
import { useUpdateTeam } from './useTeams';

export interface TeamEditModalProps {
  team: Team;
  onClose: () => void;
  onUpdated: (team: Team) => void;
}

export function TeamEditModal({ team, onClose, onUpdated }: TeamEditModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [managerId, setManagerId] = useState(team.manager?.id ?? '');
  const updateTeam = useUpdateTeam(team.id);
  const { data: users } = useAssignableUsers();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: team.name, description: team.description ?? undefined },
  });

  async function onSubmit(values: CreateTeamFormValues) {
    setFormError(null);
    try {
      const updated = await updateTeam.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        managerId: managerId || undefined,
      });
      onUpdated(updated);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Edit Team" onClose={onClose} size="sm">
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
          <Textarea label="Description" error={errors.description?.message} {...register('description')} />

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
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
