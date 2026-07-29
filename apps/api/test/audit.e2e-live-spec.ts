import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { APP_CREATE_OPTIONS, configureApp } from '../src/app';
import { AppModule } from '../src/app.module';
import { PasswordService } from '../src/modules/auth/services/password.service';
import { seedReferenceData } from '../prisma/seed';
import { testPrisma } from './database/helpers';

/**
 * Audit (DATABASE.md sections 99-102, ARCHITECTURE.md sections 60-61) - the
 * read-only `GET /audit-logs` surface over the `audit_logs` table that
 * `AuditService.record()` has been writing to since Step 4. Coverage here is
 * on the query/permission/immutability contract, not on re-testing every
 * individual module's audit call sites (those are exercised by each
 * module's own e2e suite already recording real entries as a side effect).
 */
describe('Audit (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "brands", ' +
        '"password_reset_tokens", "sessions", "user_roles", "role_permissions", "users" ' +
        'RESTART IDENTITY CASCADE;',
    );
    await seedReferenceData(testPrisma);

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>(APP_CREATE_OPTIONS);
    configureApp(app);
    await app.init();

    passwordService = app.get(PasswordService);
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function createUser(options: { roleName?: string } = {}) {
    const email = `user-${randomUUID()}@example.com`;
    const passwordHash = await passwordService.hash('Str0ngPassphrase!');

    const user = await testPrisma.user.create({
      data: { firstName: 'Test', lastName: 'User', email, passwordHash, status: 'active' },
    });

    if (options.roleName) {
      const role = await testPrisma.role.findUniqueOrThrow({ where: { name: options.roleName } });
      await testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    }

    return user;
  }

  async function accessTokenFor(email: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Str0ngPassphrase!' })
      .expect(200);
    return response.body.accessToken;
  }

  async function authedRequest(roleName = 'Administrator') {
    const user = await createUser({ roleName });
    const token = await accessTokenFor(user.email);
    return { user, token, auth: () => ({ Authorization: `Bearer ${token}` }) };
  }

  /** An authenticated actor holding no role at all - `audit.read` is Administrator-only, so this is enough for the permission-denial case. */
  async function noPermissionsRequest() {
    const user = await createUser();
    const token = await accessTokenFor(user.email);
    return { auth: () => ({ Authorization: `Bearer ${token}` }) };
  }

  async function createBrand(auth: () => Record<string, string>, name = `Brand-${randomUUID().slice(0, 8)}`) {
    return request(app.getHttpServer()).post('/api/v1/brands').set(auth()).send({ name }).expect(201);
  }

  it('records who/when/what for a create operation elsewhere in the app', async () => {
    const { user, auth } = await authedRequest();
    const created = await createBrand(auth, 'Havells');

    const entry = await testPrisma.auditLog.findFirstOrThrow({
      where: { entityType: 'brand', entityId: created.body.id },
    });
    expect(entry.actorUserId).toBe(user.id);
    expect(entry.action).toBe('brand.created');
    expect(entry.afterData).toMatchObject({ name: 'Havells' });
    expect(entry.requestId).toEqual(expect.any(String));
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it('lists audit entries with the actor resolved, newest first', async () => {
    const { user, auth } = await authedRequest();
    await createBrand(auth, 'Older');
    await createBrand(auth, 'Newer');

    const response = await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .query({ entityType: 'brand' })
      .set(auth())
      .expect(200);

    expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    expect(response.body.data[0].afterData).toMatchObject({ name: 'Newer' });
    expect(response.body.data[0].actor).toMatchObject({ id: user.id, email: user.email });
  });

  it('filters by entityId, actorUserId and action', async () => {
    const { user, auth } = await authedRequest();
    const brand = await createBrand(auth);

    const byEntity = await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .query({ entityType: 'brand', entityId: brand.body.id })
      .set(auth())
      .expect(200);
    expect(byEntity.body.data).toHaveLength(1);
    expect(byEntity.body.data[0].entityId).toBe(brand.body.id);

    const byActor = await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .query({ actorUserId: user.id, action: 'brand.created' })
      .set(auth())
      .expect(200);
    expect(byActor.body.data.length).toBeGreaterThanOrEqual(1);
    expect(byActor.body.data.every((row: { action: string }) => row.action === 'brand.created')).toBe(true);

    const noMatch = await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .query({ action: 'invoice.issued', entityType: 'brand' })
      .set(auth())
      .expect(200);
    expect(noMatch.body.data).toHaveLength(0);
  });

  it('paginates results', async () => {
    const { auth } = await authedRequest();
    await createBrand(auth);
    await createBrand(auth);
    await createBrand(auth);

    const response = await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .query({ entityType: 'brand', page: 1, pageSize: 2 })
      .set(auth())
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta).toMatchObject({ page: 1, pageSize: 2 });
    expect(response.body.meta.totalItems).toBeGreaterThanOrEqual(3);
  });

  it('denies access without audit.read', async () => {
    const { auth } = await noPermissionsRequest();
    const response = await request(app.getHttpServer()).get('/api/v1/audit-logs').set(auth()).expect(403);
    expect(response.body.error.code).toBe('PERMISSION_DENIED');
  });

  it('exposes no route to modify or delete an audit entry', async () => {
    const { auth } = await authedRequest();
    const brand = await createBrand(auth);
    const entry = await testPrisma.auditLog.findFirstOrThrow({
      where: { entityType: 'brand', entityId: brand.body.id },
    });

    await request(app.getHttpServer())
      .patch(`/api/v1/audit-logs/${entry.id}`)
      .set(auth())
      .send({ action: 'tampered' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/v1/audit-logs/${entry.id}`)
      .set(auth())
      .expect(404);
  });
});
