import { PrismaService } from '../../database/prisma.service';

/**
 * Resolves a team to its active members' user IDs, for filtering records that
 * only carry an owner/assignee (no direct team column) by `?teamId=`.
 * An unknown or empty team simply yields no matches, same as any other
 * optional filter narrowing to nothing - it is not treated as an error.
 */
export async function resolveTeamMemberUserIds(prisma: PrismaService, teamId: string): Promise<string[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId, isActive: true },
    select: { userId: true },
  });
  return members.map((member) => member.userId);
}
