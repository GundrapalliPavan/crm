import { useState } from 'react';
import { useParams } from 'react-router';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/lib/auth/useAuth';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { TeamEditModal } from './TeamEditModal';
import { useRemoveTeamMember, useTeam, useTeamMembers, useUpdateTeam } from './useTeams';

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { can } = useAuth();
  const { data: team, isLoading, isError } = useTeam(teamId ?? '');
  const { data: members } = useTeamMembers(teamId ?? '');
  const updateTeam = useUpdateTeam(teamId ?? '');
  const removeMember = useRemoveTeamMember(teamId ?? '');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<{ userId: string; name: string } | null>(null);

  if (!can('team.manage')) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-6">
        <EmptyState title="You don't have access to Teams" description="Ask an administrator for access if you need it." />
      </div>
    );
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)]">Loading team…</p>;
  }

  if (isError || !team) {
    return (
      <div role="alert" className="p-6 text-sm text-[var(--color-danger-text)]">
        Unable to load this team. Check your connection and try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">{team.name}</h1>
            {team.description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{team.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">
                Manager: {team.manager ? `${team.manager.firstName} ${team.manager.lastName}` : 'Unassigned'}
              </Badge>
              {team.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              isLoading={updateTeam.isPending}
              onClick={() => void updateTeam.mutateAsync({ isActive: !team.isActive })}
            >
              {team.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">Members</h2>
          <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
            + Add Member
          </Button>
        </div>

        {members?.data.length === 0 && (
          <EmptyState title="No members yet" description="Add team members to assign leads and scope reports to this team." />
        )}

        {members && members.data.length > 0 && (
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)]">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {members.data.map((member) => (
                  <tr key={member.id} className="border-b border-[var(--color-border-default)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {member.user.firstName} {member.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{member.membershipRole ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setMemberPendingRemoval({
                            userId: member.user.id,
                            name: `${member.user.firstName} ${member.user.lastName}`,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditOpen && <TeamEditModal team={team} onClose={() => setIsEditOpen(false)} onUpdated={() => setIsEditOpen(false)} />}
      {isAddMemberOpen && (
        <AddTeamMemberModal
          teamId={team.id}
          onClose={() => setIsAddMemberOpen(false)}
          onAdded={() => setIsAddMemberOpen(false)}
        />
      )}
      {memberPendingRemoval && (
        <ConfirmDialog
          title="Remove team member"
          description={`Remove ${memberPendingRemoval.name} from ${team.name}? They will no longer count toward this team's assignments.`}
          confirmLabel="Remove"
          destructive
          isConfirming={removeMember.isPending}
          onCancel={() => setMemberPendingRemoval(null)}
          onConfirm={() =>
            void removeMember.mutateAsync(memberPendingRemoval.userId).then(() => setMemberPendingRemoval(null))
          }
        />
      )}
    </div>
  );
}
