import { Injectable, Logger } from '@nestjs/common';
import type { LoginResponse, RefreshResponse } from '@crm/types';
import { PrismaService } from '../../../database/prisma.service';
import { AppConfigService } from '../../../config/app-config.service';
import { NodeEnv } from '../../../config/env.validation';
import {
  AccountInactiveError,
  InvalidCredentialsError,
  SessionExpiredError,
  ValidationError,
} from '../../../common/errors/app-error';
import { AuditService } from '../../../common/audit/audit.service';
import { AccountEmailService } from './account-email.service';
import { PasswordResetService } from './password-reset.service';
import { PasswordService } from './password.service';
import { PermissionsService } from './permissions.service';
import { SessionService, type DeviceContext } from './session.service';
import { TokenService } from './token.service';

/** A login/refresh result plus the raw refresh token. For a web request the
 *  controller consumes this only to set the httpOnly cookie and it never
 *  reaches the JSON response; a mobile request (no cookie jar to use) gets
 *  it in the response body instead (see AuthController). */
export interface IssuedCredentials<TResponse> {
  response: TResponse;
  rawRefreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly passwordService: PasswordService,
    private readonly passwordResetService: PasswordResetService,
    private readonly permissionsService: PermissionsService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
    private readonly accountEmailService: AccountEmailService,
  ) {}

  /**
   * Validates credentials and, on success, issues a new session.
   *
   * Every failure path - unknown email, no password set, wrong password -
   * throws the same `InvalidCredentialsError` so a caller cannot distinguish
   * "no such account" from "wrong password" (Step 4 section 12).
   */
  async login(
    email: string,
    password: string,
    device: DeviceContext,
  ): Promise<IssuedCredentials<LoginResponse>> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.passwordHash) {
      // Runs even when there is no hash to check against, so the response
      // time for "no such user" does not measurably differ from "wrong
      // password" (a timing side channel would otherwise leak account
      // existence just as surely as an explicit error message would).
      await this.passwordService.verify(
        '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        password,
      );
      this.logger.warn({ email }, 'Login failed: unknown account or no password set');
      throw new InvalidCredentialsError();
    }

    const passwordValid = await this.passwordService.verify(user.passwordHash, password);

    if (!passwordValid) {
      this.logger.warn({ userId: user.id }, 'Login failed: incorrect password');
      throw new InvalidCredentialsError();
    }

    if (user.status !== 'active') {
      this.logger.warn({ userId: user.id, status: user.status }, 'Login rejected: inactive account');
      throw new AccountInactiveError();
    }

    const { session, rawToken } = await this.sessionService.createSession(user.id, device);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.tokenService.signAccessToken({ sub: user.id, sid: session.id });
    const authenticatedUser = await this.permissionsService.toAuthenticatedUser(user);

    this.logger.log({ userId: user.id, sessionId: session.id }, 'Login succeeded');

    return {
      response: {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt.toISOString(),
        user: authenticatedUser,
      },
      rawRefreshToken: rawToken,
    };
  }

  /**
   * Rotates a refresh token forward and mints a fresh access token.
   *
   * Every rejection path - not found, expired, or a reused/rotated token -
   * is reported as the same `SessionExpiredError`: from the client's
   * perspective all three mean exactly one thing, sign in again.
   */
  async refresh(
    rawRefreshToken: string,
    device: DeviceContext,
  ): Promise<IssuedCredentials<RefreshResponse>> {
    const validation = await this.sessionService.validateRefreshToken(rawRefreshToken);

    if (validation.status !== 'valid') {
      throw new SessionExpiredError();
    }

    const user = await this.prisma.user.findUnique({ where: { id: validation.session.userId } });

    if (!user || user.status !== 'active') {
      await this.sessionService.revokeAllForUser(validation.session.userId);
      throw new AccountInactiveError();
    }

    const { session, rawToken } = await this.sessionService.rotateSession(
      validation.session,
      device,
    );

    const accessToken = this.tokenService.signAccessToken({ sub: user.id, sid: session.id });

    return {
      response: {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt.toISOString(),
      },
      rawRefreshToken: rawToken,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revokeSession(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.revokeAllForUser(userId);
  }

  /**
   * Always succeeds from the caller's point of view, whether or not the
   * email matches an account - the alternative would let an attacker use this
   * endpoint to test which emails are registered (Step 4 section 43).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.passwordHash) {
      return;
    }

    const rawToken = await this.passwordResetService.createToken(user.id, 'password_reset');
    await this.accountEmailService.sendPasswordResetEmail(user, rawToken);

    if (this.config.nodeEnv !== NodeEnv.Production) {
      // Logged only outside production, and only here, so a developer can
      // complete the flow locally without a real vendor account configured -
      // the send above already degrades to an honest failure in that case
      // (CLAUDE.md section 31), it just does not surface as an error here.
      this.logger.log(
        { userId: user.id, devOnlyResetToken: rawToken },
        'DEV ONLY: password reset token (also emailed, if a provider is configured)',
      );
    }
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const validation = await this.passwordResetService.validateToken(rawToken, 'password_reset');

    if (validation.status !== 'valid') {
      throw new ValidationError({ token: ['This reset link is invalid or has expired.'] });
    }

    const passwordHash = await this.passwordService.hash(newPassword);

    await this.prisma.user.update({
      where: { id: validation.token.userId },
      data: { passwordHash },
    });

    await this.passwordResetService.consumeToken(validation.token.id);
    // A password reset invalidates every existing session - the whole point
    // is that the previous password (and anything authenticated under it)
    // should no longer be trusted (Step 4 section 45).
    await this.sessionService.revokeAllForUser(validation.token.userId);

    await this.auditService.record({
      actorUserId: validation.token.userId,
      action: 'user.password_reset',
      entityType: 'user',
      entityId: validation.token.userId,
    });
  }

  /**
   * Completes an admin-initiated invite: the invited account exists already
   * (created `inactive` with no password by `UsersService.create`) - this
   * just proves the recipient controls the invited email address and lets
   * them choose their own password, rather than the admin handing one out
   * (CLAUDE.md section 68's "external provider choice" reasoning applies
   * equally to "who picks the password").
   */
  async acceptInvite(rawToken: string, newPassword: string): Promise<void> {
    const validation = await this.passwordResetService.validateToken(rawToken, 'account_activation');

    if (validation.status !== 'valid') {
      throw new ValidationError({ token: ['This invitation link is invalid or has expired.'] });
    }

    const passwordHash = await this.passwordService.hash(newPassword);

    await this.prisma.user.update({
      where: { id: validation.token.userId },
      data: { passwordHash, status: 'active', emailVerifiedAt: new Date() },
    });

    await this.passwordResetService.consumeToken(validation.token.id);

    await this.auditService.record({
      actorUserId: validation.token.userId,
      action: 'user.invite_accepted',
      entityType: 'user',
      entityId: validation.token.userId,
    });
  }

  async changePassword(
    userId: string,
    currentSessionId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const currentValid =
      !!user.passwordHash && (await this.passwordService.verify(user.passwordHash, currentPassword));

    if (!currentValid) {
      throw new InvalidCredentialsError('Your current password is incorrect.');
    }

    const passwordHash = await this.passwordService.hash(newPassword);

    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    // Revoke every other session but keep the caller signed in on this one -
    // changing your password should not immediately log you out of the
    // device you changed it from.
    await this.prisma.session.updateMany({
      where: { userId, id: { not: currentSessionId }, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.auditService.record({
      actorUserId: userId,
      action: 'user.password_changed',
      entityType: 'user',
      entityId: userId,
    });
  }
}
