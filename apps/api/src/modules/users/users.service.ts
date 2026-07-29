import { Injectable, Logger } from '@nestjs/common';
import type {
  ApiCollectionResponse,
  AssignUserRolesRequest,
  AuthenticatedUser,
  CreateUserResponse,
  UserStatus,
} from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AppConfigService } from '../../config/app-config.service';
import { NodeEnv } from '../../config/env.validation';
import { ConflictError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { AccountEmailService } from '../auth/services/account-email.service';
import { PasswordResetService } from '../auth/services/password-reset.service';
import { PermissionsService } from '../auth/services/permissions.service';
import { SessionService } from '../auth/services/session.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { ListUsersQuery } from './dto/list-users.query';

/**
 * Identity administration only (Step 4 section 38) - list, create, activate/
 * deactivate, and role assignment. Sales performance, territories and similar
 * Team Management concerns belong to a later, dedicated module.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly passwordResetService: PasswordResetService,
    private readonly accountEmailService: AccountEmailService,
    private readonly config: AppConfigService,
  ) {}

  async list(query: ListUsersQuery): Promise<ApiCollectionResponse<AuthenticatedUser>> {
    const [rows, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.user.count(),
    ]);

    const data = await Promise.all(
      rows.map((user) => this.permissionsService.toAuthenticatedUser(user)),
    );

    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return this.permissionsService.toAuthenticatedUser(user);
  }

  /**
   * Provisions an invited user (Step 4 section 39: admin-gated, not public
   * self-registration - section 40 is not applicable to an internal
   * distributor CRM). The account is created `inactive` with no password;
   * an invite email carries a verification link, and the account activates
   * itself when the recipient completes `POST /auth/accept-invite`.
   */
  async create(dto: CreateUserDto, actorUserId: string): Promise<CreateUserResponse> {
    await this.assertEmailAndUsernameAvailable(dto.email, dto.username);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        status: 'inactive',
      },
    });

    const rawToken = await this.passwordResetService.createToken(user.id, 'account_activation');
    await this.accountEmailService.sendInviteEmail(user, rawToken);

    if (this.config.nodeEnv !== NodeEnv.Production) {
      // Logged only outside production, and only here, so an administrator
      // can complete the flow locally without a real vendor account
      // configured - the send above already degrades to an honest failure
      // in that case (CLAUDE.md section 31), it just does not surface as an
      // error here.
      this.logger.log(
        { userId: user.id, devOnlyInviteToken: rawToken },
        'DEV ONLY: invite token (also emailed, if a provider is configured)',
      );
    }

    await this.auditService.record({
      actorUserId,
      action: 'user.created',
      entityType: 'user',
      entityId: user.id,
      afterData: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });

    return { user: await this.permissionsService.toAuthenticatedUser(user) };
  }

  private async assertEmailAndUsernameAvailable(email: string, username: string): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
      select: { email: true, username: true },
    });

    if (!existing) {
      return;
    }
    if (existing.email === email.toLowerCase()) {
      throw new ConflictError('A user with this email already exists.');
    }
    throw new ConflictError('This username is already taken.');
  }

  /**
   * Deactivation must take effect immediately, not just block future logins
   * (Step 4 section 82) - every existing session for the user is revoked in
   * the same operation.
   */
  async updateStatus(id: string, status: UserStatus, actorUserId: string): Promise<AuthenticatedUser> {
    const existing = await this.prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError('User not found.');
    }

    const user = await this.prisma.user.update({ where: { id }, data: { status } });

    if (status !== 'active') {
      await this.sessionService.revokeAllForUser(id);
    }

    await this.auditService.record({
      actorUserId,
      action: 'user.status_changed',
      entityType: 'user',
      entityId: id,
      beforeData: { status: existing.status },
      afterData: { status },
    });

    return this.permissionsService.toAuthenticatedUser(user);
  }

  /** Replaces the user's complete role set with the one supplied. */
  async assignRoles(
    id: string,
    request: AssignUserRolesRequest,
    actorUserId: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const roles = await this.prisma.role.findMany({ where: { id: { in: request.roleIds } } });

    if (roles.length !== request.roleIds.length) {
      throw new ValidationError({ roleIds: ['One or more roles do not exist.'] });
    }

    const before = await this.prisma.userRole.findMany({
      where: { userId: id },
      include: { role: { select: { name: true } } },
    });

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      this.prisma.userRole.createMany({
        data: request.roleIds.map((roleId) => ({ userId: id, roleId })),
      }),
    ]);

    await this.auditService.record({
      actorUserId,
      action: 'user.roles_assigned',
      entityType: 'user',
      entityId: id,
      beforeData: { roles: before.map(({ role }) => role.name) },
      afterData: { roles: roles.map((role) => role.name) },
    });

    return this.permissionsService.toAuthenticatedUser(user);
  }
}
