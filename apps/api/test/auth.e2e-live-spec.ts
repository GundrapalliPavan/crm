import { createHash, randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { UserStatus } from '@crm/types';
import request from 'supertest';
import { APP_CREATE_OPTIONS, configureApp } from '../src/app';
import { AppModule } from '../src/app.module';
import { REFRESH_TOKEN_COOKIE_NAME } from '../src/modules/auth/auth.constants';
import { PasswordResetService } from '../src/modules/auth/services/password-reset.service';
import { PasswordService } from '../src/modules/auth/services/password.service';
import { seedReferenceData } from '../prisma/seed';
import { testPrisma } from './database/helpers';

/**
 * Exercises authentication, session lifecycle and RBAC against a real
 * Postgres database (Step 4 sections 87-92). The guards under test perform
 * genuine DB round trips (session and permission lookups) that a mocked
 * Prisma client would not exercise honestly.
 *
 * Every test gets its own application instance. The login endpoint is
 * rate-limited to 5 attempts/minute, and Nest's in-memory throttler storage
 * lives for the lifetime of one app instance - sharing an app across tests
 * would make later tests fail from earlier tests' login attempts rather than
 * their own.
 */
describe('Authentication, Users & RBAC (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;
  let passwordResetService: PasswordResetService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "password_reset_tokens", "sessions", ' +
        '"user_roles", "role_permissions", "users" RESTART IDENTITY CASCADE;',
    );
    // Restores permissions, seeded roles and the Administrator grant that the
    // truncate above just wiped (all upserts - safe to run every test).
    await seedReferenceData(testPrisma);

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>(APP_CREATE_OPTIONS);
    configureApp(app);
    await app.init();

    passwordService = app.get(PasswordService);
    passwordResetService = app.get(PasswordResetService);
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function createUser(
    options: {
      email?: string;
      password?: string;
      status?: UserStatus;
      roleName?: string;
    } = {},
  ) {
    const email = options.email ?? `user-${randomUUID()}@example.com`;
    const passwordHash = options.password ? await passwordService.hash(options.password) : null;

    const user = await testPrisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email,
        passwordHash,
        status: options.status ?? 'active',
      },
    });

    if (options.roleName) {
      const role = await testPrisma.role.findUniqueOrThrow({ where: { name: options.roleName } });
      await testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    }

    return user;
  }

  function login(email: string, password: string) {
    return request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password });
  }

  function refreshCookieFrom(response: request.Response): string {
    const setCookie = (response.headers['set-cookie'] ?? []) as unknown as string[];
    const cookie = setCookie.find((value) => value.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`));

    if (!cookie) {
      throw new Error('Response did not set a refresh token cookie.');
    }

    return cookie.split(';')[0];
  }

  describe('login', () => {
    it('issues an access token and refresh cookie for valid credentials', async () => {
      await createUser({ email: 'valid@example.com', password: 'Str0ngPassphrase!' });

      const response = await login('valid@example.com', 'Str0ngPassphrase!').expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.accessTokenExpiresAt).toEqual(expect.any(String));
      expect(response.body.user).toMatchObject({ email: 'valid@example.com' });
      expect(refreshCookieFrom(response)).toMatch(new RegExp(`^${REFRESH_TOKEN_COOKIE_NAME}=`));
    });

    it('rejects an incorrect password without revealing which part was wrong', async () => {
      await createUser({ email: 'wrongpass@example.com', password: 'Str0ngPassphrase!' });

      const response = await login('wrongpass@example.com', 'not-the-password').expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects an unknown account with the identical error as a wrong password', async () => {
      const response = await login('nobody@example.com', 'whatever123').expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.error.message).toBe('The email or password you entered is incorrect.');
    });

    it('rejects an inactive account even with the correct password', async () => {
      await createUser({
        email: 'inactive@example.com',
        password: 'Str0ngPassphrase!',
        status: 'inactive',
      });

      const response = await login('inactive@example.com', 'Str0ngPassphrase!').expect(401);

      expect(response.body.error.code).toBe('ACCOUNT_INACTIVE');
    });
  });

  describe('mobile client (X-Client-Type: mobile)', () => {
    it('returns the refresh token in the body instead of a cookie on login', async () => {
      await createUser({ email: 'mobile-login@example.com', password: 'Str0ngPassphrase!' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Client-Type', 'mobile')
        .send({ email: 'mobile-login@example.com', password: 'Str0ngPassphrase!' })
        .expect(200);

      expect(response.body.refreshToken).toEqual(expect.any(String));
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('refreshes using a body-supplied token and rotates it in the body, not a cookie', async () => {
      await createUser({ email: 'mobile-refresh@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Client-Type', 'mobile')
        .send({ email: 'mobile-refresh@example.com', password: 'Str0ngPassphrase!' })
        .expect(200);

      const refreshResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(200);

      expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);
      expect(refreshResponse.body.refreshToken).toEqual(expect.any(String));
      expect(refreshResponse.body.refreshToken).not.toBe(loginResponse.body.refreshToken);
      expect(refreshResponse.headers['set-cookie']).toBeUndefined();
    });

    it('rejects reuse of an already-rotated body-supplied refresh token', async () => {
      await createUser({ email: 'mobile-reuse@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Client-Type', 'mobile')
        .send({ email: 'mobile-reuse@example.com', password: 'Str0ngPassphrase!' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(401);
    });

    it('still honours the web cookie unchanged when no client-type header is sent', async () => {
      await createUser({ email: 'still-web@example.com', password: 'Str0ngPassphrase!' });

      const response = await login('still-web@example.com', 'Str0ngPassphrase!').expect(200);

      expect(response.body.refreshToken).toBeUndefined();
      expect(refreshCookieFrom(response)).toMatch(new RegExp(`^${REFRESH_TOKEN_COOKIE_NAME}=`));
    });
  });

  describe('protected routes and current user', () => {
    it('rejects a request with no access token', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('rejects a request with a malformed bearer token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('returns the authenticated user for a valid access token', async () => {
      await createUser({ email: 'me@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await login('me@example.com', 'Str0ngPassphrase!').expect(200);

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({ email: 'me@example.com' });
    });
  });

  describe('session lifecycle', () => {
    it('rotates the refresh token and mints a new access token on refresh', async () => {
      await createUser({ email: 'refresh@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await login('refresh@example.com', 'Str0ngPassphrase!').expect(200);
      const firstCookie = refreshCookieFrom(loginResponse);

      const refreshResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', firstCookie)
        .expect(200);

      expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);
      expect(refreshCookieFrom(refreshResponse)).not.toBe(firstCookie);
    });

    it('rejects reuse of an already-rotated refresh token and revokes the whole lineage', async () => {
      await createUser({ email: 'reuse@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await login('reuse@example.com', 'Str0ngPassphrase!').expect(200);
      const firstCookie = refreshCookieFrom(loginResponse);

      const rotated = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', firstCookie)
        .expect(200);

      // Reusing the original (now-rotated-away) token is treated as theft.
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', firstCookie)
        .expect(401);

      // The whole lineage is burned, including the token reuse detection
      // itself just issued moments before.
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookieFrom(rotated))
        .expect(401);
    });

    it('rejects an expired refresh token', async () => {
      await createUser({ email: 'expired@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await login('expired@example.com', 'Str0ngPassphrase!').expect(200);
      const cookie = refreshCookieFrom(loginResponse);
      const rawToken = cookie.split('=')[1];

      await testPrisma.session.updateMany({
        where: { refreshTokenHash: createHash('sha256').update(rawToken).digest('hex') },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookie)
        .expect(401);

      expect(response.body.error.code).toBe('SESSION_EXPIRED');
    });

    it('logs out, revoking the session so neither the access token nor the cookie work again', async () => {
      await createUser({ email: 'logout@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await login('logout@example.com', 'Str0ngPassphrase!').expect(200);
      const accessToken = loginResponse.body.accessToken;
      const cookie = refreshCookieFrom(loginResponse);

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookie)
        .expect(401);
    });
  });

  describe('RBAC', () => {
    it('denies an authenticated user with no roles', async () => {
      await createUser({ email: 'noroles@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await login('noroles@example.com', 'Str0ngPassphrase!').expect(200);

      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(403);

      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('allows the seeded Administrator role, which is granted every permission explicitly', async () => {
      await createUser({
        email: 'admin@example.com',
        password: 'Str0ngPassphrase!',
        roleName: 'Administrator',
      });
      const loginResponse = await login('admin@example.com', 'Str0ngPassphrase!').expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
    });

    it('applies a role change on the very next request, without requiring re-login', async () => {
      const user = await createUser({ email: 'promoted@example.com', password: 'Str0ngPassphrase!' });
      const loginResponse = await login('promoted@example.com', 'Str0ngPassphrase!').expect(200);
      const accessToken = loginResponse.body.accessToken;

      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      const administrator = await testPrisma.role.findUniqueOrThrow({
        where: { name: 'Administrator' },
      });
      await testPrisma.userRole.create({ data: { userId: user.id, roleId: administrator.id } });

      // Same access token, same session - permissions are resolved fresh from
      // the database on every request, never cached in the JWT (section 34).
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('user status enforcement', () => {
    it('immediately revokes access when an administrator deactivates the user', async () => {
      const target = await createUser({ email: 'target@example.com', password: 'Str0ngPassphrase!' });
      await createUser({
        email: 'statusadmin@example.com',
        password: 'Str0ngPassphrase!',
        roleName: 'Administrator',
      });

      const targetLogin = await login('target@example.com', 'Str0ngPassphrase!').expect(200);
      const adminLogin = await login('statusadmin@example.com', 'Str0ngPassphrase!').expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/users/${target.id}/status`)
        .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
        .send({ status: 'inactive' })
        .expect(200);

      // The deactivated user's still-unexpired access token is rejected
      // immediately - not merely blocked from a future login (section 82).
      // The code is AUTHENTICATION_REQUIRED, not ACCOUNT_INACTIVE: deactivation
      // proactively revokes every session for the user (users.service.ts), so
      // the guard's session-revoked check rejects the request before it ever
      // reaches the user-status check below.
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${targetLogin.body.accessToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('rejects a non-active user even when their session was not separately revoked', async () => {
      const target = await createUser({ email: 'stillsessioned@example.com', password: 'Str0ngPassphrase!' });
      const targetLogin = await login('stillsessioned@example.com', 'Str0ngPassphrase!').expect(200);

      // Flips status directly, bypassing UsersService's proactive session
      // revocation, to prove the guard enforces user status as its own
      // independent defence, not only via session revocation as a side effect.
      await testPrisma.user.update({ where: { id: target.id }, data: { status: 'suspended' } });

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${targetLogin.body.accessToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('ACCOUNT_INACTIVE');
    });
  });

  describe('password security', () => {
    it('never exposes the password hash through any auth or user response', async () => {
      await createUser({
        email: 'nohash@example.com',
        password: 'Str0ngPassphrase!',
        roleName: 'Administrator',
      });
      const loginResponse = await login('nohash@example.com', 'Str0ngPassphrase!').expect(200);

      const meResponse = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      const usersResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(JSON.stringify(loginResponse.body)).not.toContain('passwordHash');
      expect(JSON.stringify(meResponse.body)).not.toContain('passwordHash');
      expect(JSON.stringify(usersResponse.body)).not.toContain('passwordHash');
    });

    it('creates an inactive, passwordless account and sends an invite rather than a temporary password', async () => {
      await createUser({
        email: 'creator@example.com',
        password: 'Str0ngPassphrase!',
        roleName: 'Administrator',
      });
      const loginResponse = await login('creator@example.com', 'Str0ngPassphrase!').expect(200);

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ firstName: 'New', lastName: 'Hire', username: 'newhire', email: 'newhire@example.com' })
        .expect(201);

      expect(response.body).not.toHaveProperty('temporaryPassword');
      expect(response.body.user).toMatchObject({ status: 'inactive', username: 'newhire' });
      expect(JSON.stringify(response.body)).not.toContain('passwordHash');

      const created = await testPrisma.user.findUniqueOrThrow({ where: { email: 'newhire@example.com' } });
      expect(created.passwordHash).toBeNull();
      expect(created.status).toBe('inactive');
    });

    it('rejects a duplicate email or username on creation', async () => {
      await createUser({
        email: 'creator2@example.com',
        password: 'Str0ngPassphrase!',
        roleName: 'Administrator',
      });
      const loginResponse = await login('creator2@example.com', 'Str0ngPassphrase!').expect(200);
      const auth = { Authorization: `Bearer ${loginResponse.body.accessToken}` };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set(auth)
        .send({ firstName: 'A', lastName: 'B', username: 'taken', email: 'taken@example.com' })
        .expect(201);

      const duplicateEmail = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set(auth)
        .send({ firstName: 'C', lastName: 'D', username: 'different', email: 'taken@example.com' })
        .expect(409);
      expect(duplicateEmail.body.error.code).toBe('DUPLICATE_RESOURCE');

      const duplicateUsername = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set(auth)
        .send({ firstName: 'E', lastName: 'F', username: 'taken', email: 'different@example.com' })
        .expect(409);
      expect(duplicateUsername.body.error.code).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('invite acceptance', () => {
    async function createInvitedUser(email = 'invited@example.com') {
      return testPrisma.user.create({
        data: { firstName: 'Invited', lastName: 'User', username: `invited-${randomUUID().slice(0, 8)}`, email, status: 'inactive' },
      });
    }

    it('activates the account and lets the new password log in', async () => {
      const user = await createInvitedUser();
      const rawToken = await passwordResetService.createToken(user.id, 'account_activation');

      await request(app.getHttpServer())
        .post('/api/v1/auth/accept-invite')
        .send({ token: rawToken, password: 'NewPassphrase2' })
        .expect(204);

      const activated = await testPrisma.user.findUniqueOrThrow({ where: { id: user.id } });
      expect(activated.status).toBe('active');
      expect(activated.emailVerifiedAt).not.toBeNull();

      await login('invited@example.com', 'NewPassphrase2').expect(200);
    });

    it('rejects an invalid or expired invite token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/accept-invite')
        .send({ token: 'not-a-real-token', password: 'NewPassphrase2' })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a password-reset token at accept-invite, and an invite token at reset-password', async () => {
      const activeUser = await createUser({ email: 'active-user@example.com', password: 'OldPassphrase1' });
      const resetToken = await passwordResetService.createToken(activeUser.id, 'password_reset');

      const invitedUser = await createInvitedUser('invited2@example.com');
      const inviteToken = await passwordResetService.createToken(invitedUser.id, 'account_activation');

      await request(app.getHttpServer())
        .post('/api/v1/auth/accept-invite')
        .send({ token: resetToken, password: 'NewPassphrase2' })
        .expect(422);

      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: inviteToken, newPassword: 'NewPassphrase2' })
        .expect(422);
    });
  });

  describe('password reset', () => {
    it('accepts forgot-password identically whether or not the email exists', async () => {
      await createUser({ email: 'known@example.com', password: 'Str0ngPassphrase!' });

      const knownResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'known@example.com' })
        .expect(202);

      const unknownResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'unknown@example.com' })
        .expect(202);

      expect(knownResponse.body).toEqual(unknownResponse.body);
    });

    it('resets the password with a valid token and revokes every existing session', async () => {
      const user = await createUser({ email: 'reset@example.com', password: 'OldPassphrase1' });
      const loginResponse = await login('reset@example.com', 'OldPassphrase1').expect(200);
      const rawToken = await passwordResetService.createToken(user.id);

      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: rawToken, newPassword: 'NewPassphrase2' })
        .expect(204);

      await login('reset@example.com', 'OldPassphrase1').expect(401);
      await login('reset@example.com', 'NewPassphrase2').expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(401);
    });

    it('rejects an invalid or expired reset token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: 'not-a-real-token', newPassword: 'NewPassphrase2' })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('change password', () => {
    it('changes the password and revokes other sessions while keeping the current one', async () => {
      await createUser({ email: 'change@example.com', password: 'OldPassphrase1' });
      const sessionA = await login('change@example.com', 'OldPassphrase1').expect(200);
      const sessionB = await login('change@example.com', 'OldPassphrase1').expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${sessionA.body.accessToken}`)
        .send({ currentPassword: 'OldPassphrase1', newPassword: 'NewPassphrase2' })
        .expect(204);

      // The session used to change the password stays valid.
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionA.body.accessToken}`)
        .expect(200);

      // Every other session for the same user is revoked.
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionB.body.accessToken}`)
        .expect(401);
    });

    it('rejects an incorrect current password', async () => {
      await createUser({ email: 'wrongcurrent@example.com', password: 'OldPassphrase1' });
      const loginResponse = await login('wrongcurrent@example.com', 'OldPassphrase1').expect(200);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ currentPassword: 'not-the-password', newPassword: 'NewPassphrase2' })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('audit trail', () => {
    it('records an audit entry for a password reset', async () => {
      const user = await createUser({ email: 'audited@example.com', password: 'OldPassphrase1' });
      const rawToken = await passwordResetService.createToken(user.id);

      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: rawToken, newPassword: 'NewPassphrase2' })
        .expect(204);

      const entries = await testPrisma.auditLog.findMany({
        where: { entityId: user.id, action: 'user.password_reset' },
      });

      expect(entries).toHaveLength(1);
      expect(entries[0].actorUserId).toBe(user.id);
    });

    it('records an audit entry for a user status change', async () => {
      const target = await createUser({
        email: 'auditedtarget@example.com',
        password: 'Str0ngPassphrase!',
      });
      await createUser({
        email: 'auditor@example.com',
        password: 'Str0ngPassphrase!',
        roleName: 'Administrator',
      });
      const adminLogin = await login('auditor@example.com', 'Str0ngPassphrase!').expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/users/${target.id}/status`)
        .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
        .send({ status: 'inactive' })
        .expect(200);

      const entries = await testPrisma.auditLog.findMany({
        where: { entityId: target.id, action: 'user.status_changed' },
      });

      expect(entries).toHaveLength(1);
    });
  });

  describe('rate limiting', () => {
    it('throttles repeated login attempts from the same client', async () => {
      await createUser({ email: 'throttle@example.com', password: 'Str0ngPassphrase!' });

      for (let attempt = 0; attempt < 5; attempt += 1) {
        await login('throttle@example.com', 'wrong-password').expect(401);
      }

      const response = await login('throttle@example.com', 'wrong-password');
      expect(response.status).toBe(429);
    });
  });
});
