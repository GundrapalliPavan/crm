import { PrismaService } from '../../database/prisma.service';

/** Active users who hold a given permission through any of their roles - used to route approval-required notifications to whoever can act on them. */
export async function findUserIdsWithPermission(prisma: PrismaService, permissionCode: string): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      status: 'active',
      roles: { some: { role: { permissions: { some: { permission: { code: permissionCode } } } } } },
    },
    select: { id: true },
  });
  return users.map((user) => user.id);
}
