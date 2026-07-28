import type { Team as PrismaTeam, TeamMember as PrismaTeamMember, User } from '@prisma/client';
import type { Team, TeamMember } from '@crm/types';

type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;

export const TEAM_INCLUDE = {
  manager: { select: { id: true, firstName: true, lastName: true } },
} as const;

export type TeamWithRelations = PrismaTeam & { manager: UserRef | null };

export function toTeam(team: TeamWithRelations, memberCount: number): Team {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    manager: team.manager,
    isActive: team.isActive,
    memberCount,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
  };
}

export const TEAM_MEMBER_INCLUDE = {
  user: { select: { id: true, firstName: true, lastName: true } },
} as const;

export type TeamMemberWithRelations = PrismaTeamMember & { user: UserRef };

export function toTeamMember(member: TeamMemberWithRelations): TeamMember {
  return {
    id: member.id,
    user: member.user,
    membershipRole: member.membershipRole,
    joinedAt: member.joinedAt.toISOString(),
    isActive: member.isActive,
  };
}
