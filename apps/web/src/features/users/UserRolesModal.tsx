import { useState } from 'react';
import type { AuthenticatedUser } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ApiError } from '@/lib/api/api-error';
import { useAssignUserRoles, useRoles } from './useUsers';

export interface UserRolesModalProps {
  user: AuthenticatedUser;
  onClose: () => void;
}

export function UserRolesModal({ user, onClose }: UserRolesModalProps) {
  const { data: roles, isLoading } = useRoles();
  const assignRoles = useAssignUserRoles(user.id);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    () => new Set(user.roles.map((role) => role.id)),
  );
  const [formError, setFormError] = useState<string | null>(null);

  function toggleRole(roleId: string) {
    setSelectedRoleIds((current) => {
      const next = new Set(current);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  }

  async function handleSave() {
    setFormError(null);
    try {
      await assignRoles.mutateAsync({ roleIds: [...selectedRoleIds] });
      onClose();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title={`Roles - ${user.firstName} ${user.lastName}`} onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        {formError && (
          <div
            role="alert"
            className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
          >
            {formError}
          </div>
        )}

        {isLoading && <p className="text-sm text-[var(--color-text-secondary)]">Loading roles…</p>}

        {roles && (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Roles</legend>
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.has(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="h-4 w-4 rounded border-[var(--color-border-default)]"
                />
                {role.name}
              </label>
            ))}
          </fieldset>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={assignRoles.isPending}>
          Cancel
        </Button>
        <Button type="button" isLoading={assignRoles.isPending} onClick={() => void handleSave()}>
          {assignRoles.isPending ? 'Saving…' : 'Save Roles'}
        </Button>
      </div>
    </Modal>
  );
}
