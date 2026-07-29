import { useState } from 'react';
import type { AuthenticatedUser, UserStatus } from '@crm/types';
import { Badge, type BadgeTone } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/lib/auth/useAuth';
import { UserCreateModal } from './UserCreateModal';
import { UserRolesModal } from './UserRolesModal';
import { useUpdateUserStatus, useUsers } from './useUsers';

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'critical',
};

function UserRow({ user, onManageRoles }: { user: AuthenticatedUser; onManageRoles: () => void }) {
  const { can, user: currentUser } = useAuth();
  const updateStatus = useUpdateUserStatus(user.id);
  const isSelf = currentUser?.id === user.id;

  return (
    <tr className="border-b border-[var(--color-border-default)] last:border-0">
      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
        {user.firstName} {user.lastName}
      </td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{user.username ?? '—'}</td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{user.email}</td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
        {user.roles.length > 0 ? user.roles.map((role) => role.name).join(', ') : '—'}
      </td>
      <td className="px-4 py-3">
        <Badge tone={STATUS_TONE[user.status]}>{user.status}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {can('role.manage') && (
            <Button size="sm" variant="secondary" onClick={onManageRoles}>
              Roles
            </Button>
          )}
          {can('user.update') && !isSelf && (
            <Button
              size="sm"
              variant="secondary"
              isLoading={updateStatus.isPending}
              onClick={() =>
                void updateStatus.mutateAsync({ status: user.status === 'active' ? 'inactive' : 'active' })
              }
            >
              {user.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * Identity administration (Step 4 sections 37-39, 74) - creating accounts for
 * field roles (Field Sales Executive, Telecaller) alongside desk roles, and
 * assigning roles. The backend has supported this since Step 4; this page
 * closes the gap of there being no UI to reach it.
 */
export function UsersPage() {
  const { can } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rolesModalUser, setRolesModalUser] = useState<AuthenticatedUser | null>(null);
  const { data, isLoading, isError } = useUsers({ page: 1, pageSize: 100 });

  if (!can('user.read')) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-6">
        <EmptyState title="You don't have access to Users" description="Ask an administrator for access if you need it." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Users</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Accounts for desk and field roles - Sales Executive, Field Sales Executive, Telecaller and more.
          </p>
        </div>
        {can('user.create') && <Button onClick={() => setIsCreateOpen(true)}>+ Add User</Button>}
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load users. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No users yet"
          description="Add a user to give them a login for the CRM - and, in future, the field mobile app."
          action={can('user.create') ? <Button onClick={() => setIsCreateOpen(true)}>+ Add User</Button> : undefined}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                data?.data.map((user) => (
                  <UserRow key={user.id} user={user} onManageRoles={() => setRolesModalUser(user)} />
                ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen && <UserCreateModal onClose={() => setIsCreateOpen(false)} />}
      {rolesModalUser && <UserRolesModal user={rolesModalUser} onClose={() => setRolesModalUser(null)} />}
    </div>
  );
}
