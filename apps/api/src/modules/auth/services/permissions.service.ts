import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser, RoleSummary } from '@crm/types';
import type { User } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Resolves a user's current roles and effective permissions directly from the
 * database on every request, rather than trusting anything cached in a token.
 *
 * This is the deliberate answer to Step 4 section 34 ("avoid permanently
 * encoding stale permissions into long-lived credentials"): a role or
 * permission change takes effect on the user's very next request, because
 * there is nothing else to invalidate.
 */
@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * One query, one round trip: roles and their permission codes for a user,
   * via Prisma's nested include rather than N+1 lookups (Step 4 section 33).
   */
  async loadRolesAndPermissions(
    userId: string,
  ): Promise<{ roles: RoleSummary[]; permissions: string[] }> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: { select: { code: true } } } },
          },
        },
      },
    });

    const roles: RoleSummary[] = userRoles.map(({ role }) => ({ id: role.id, name: role.name }));

    const permissionCodes = new Set<string>();
    for (const { role } of userRoles) {
      for (const rolePermission of role.permissions) {
        permissionCodes.add(rolePermission.permission.code);
      }
    }

    return { roles, permissions: [...permissionCodes].sort() };
  }

  async userHasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const grant = await this.prisma.rolePermission.findFirst({
      where: {
        permission: { code: permissionCode },
        role: { users: { some: { userId } } },
      },
      select: { roleId: true },
    });

    return grant !== null;
  }

  /** Maps a database user plus resolved access into the API-safe shape. */
  async toAuthenticatedUser(user: User): Promise<AuthenticatedUser> {
    const { roles, permissions } = await this.loadRolesAndPermissions(user.id);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      status: user.status,
      roles,
      permissions,
    };
  }
}
