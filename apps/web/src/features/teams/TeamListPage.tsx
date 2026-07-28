import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Team } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/lib/auth/useAuth';
import { TeamCreateModal } from './TeamCreateModal';
import { useTeams } from './useTeams';

function TeamRow({ team, onClick }: { team: Team; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-app)]"
    >
      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{team.name}</td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
        {team.manager ? `${team.manager.firstName} ${team.manager.lastName}` : '—'}
      </td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{team.memberCount}</td>
      <td className="px-4 py-3">
        {team.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
      </td>
    </tr>
  );
}

/**
 * Team CRUD, gated by `team.manage` (API.md section 102). Member management
 * and manager reassignment live on TeamDetailPage.
 */
export function TeamListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError } = useTeams({}, { enabled: can('team.manage') });

  if (!can('team.manage')) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        <EmptyState title="You don't have access to Teams" description="Ask an administrator for access if you need it." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Teams</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Reporting structure used to assign leads and scope visibility.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Team</Button>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load teams. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No teams yet"
          description="Create a team to start assigning leads and scoping reports by reporting structure."
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Team</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && data?.data.map((team) => (
                <TeamRow key={team.id} team={team} onClick={() => navigate(`/teams/${team.id}`)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <TeamCreateModal onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
