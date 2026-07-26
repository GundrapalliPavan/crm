import { Controller, Get } from '@nestjs/common';
import type { PermissionSummary, RoleSummary } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

/**
 * Read access to the seeded roles and permissions (Step 4 section 75) -
 * needed so an administrator can see what exists before assigning a role to a
 * user. No custom role creation: roles are seeded, configurable role design
 * is out of scope for this step (section 76).
 */
@Controller()
export class RolesController {
  constructor(private readonly prisma: PrismaService) {}

  @RequirePermission('role.manage')
  @Get('roles')
  async listRoles(): Promise<{ data: RoleSummary[] }> {
    const roles = await this.prisma.role.findMany({ orderBy: { name: 'asc' } });
    return { data: roles.map((role) => ({ id: role.id, name: role.name })) };
  }

  @RequirePermission('role.manage')
  @Get('permissions')
  async listPermissions(): Promise<{ data: PermissionSummary[] }> {
    const permissions = await this.prisma.permission.findMany({ orderBy: { code: 'asc' } });
    return {
      data: permissions.map((permission) => ({
        id: permission.id,
        code: permission.code,
        name: permission.name,
        module: permission.module,
      })),
    };
  }
}
