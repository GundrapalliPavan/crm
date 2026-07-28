import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useAssignableUsers } from '@/features/users/useUsers';
import { ApiError } from '@/lib/api/api-error';
import { useAddTeamMember } from './useTeams';

export interface AddTeamMemberModalProps {
  teamId: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddTeamMemberModal({ teamId, onClose, onAdded }: AddTeamMemberModalProps) {
  const [userId, setUserId] = useState('');
  const [membershipRole, setMembershipRole] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const addMember = useAddTeamMember(teamId);
  const { data: users } = useAssignableUsers();

  async function handleSubmit() {
    if (!userId) {
      setFormError('Choose a user to add.');
      return;
    }
    setFormError(null);
    try {
      await addMember.mutateAsync({ userId, membershipRole: membershipRole || undefined });
      onAdded();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title="Add Team Member" onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        {formError && (
          <div
            role="alert"
            className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
          >
            {formError}
          </div>
        )}

        <Select
          label="User"
          placeholder="Choose a user"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          options={(users ?? []).map((user) => ({ value: user.id, label: `${user.firstName} ${user.lastName}` }))}
        />

        <TextField
          label="Role on this team"
          placeholder="e.g. Sales Rep"
          value={membershipRole}
          onChange={(event) => setMembershipRole(event.target.value)}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={addMember.isPending}>
          Cancel
        </Button>
        <Button type="button" isLoading={addMember.isPending} onClick={() => void handleSubmit()}>
          {addMember.isPending ? 'Adding…' : 'Add Member'}
        </Button>
      </div>
    </Modal>
  );
}
