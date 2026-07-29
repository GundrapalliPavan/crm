import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { APP_CREATE_OPTIONS, configureApp } from '../src/app';
import { AppModule } from '../src/app.module';
import { PasswordService } from '../src/modules/auth/services/password.service';
import { seedReferenceData } from '../prisma/seed';
import { testPrisma } from './database/helpers';

const TEST_UPLOADS_DIR = join(__dirname, '..', 'uploads-test');

/**
 * File Attachments (platform capability - technical/API.md sections 96-99,
 * technical/DATABASE.md sections 93-95) against a real Postgres database and
 * real local-disk storage (`LocalFilesystemStorageProvider`, redirected to
 * `apps/api/uploads-test` for this suite - see
 * test/database/point-app-at-test-db.ts). Scope for this pass: upload
 * (entity-scoped, permission-aware), list-by-entity, download, and soft
 * delete.
 */
describe('File Attachments (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "file_links", "files", "leads", ' +
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
    await rm(TEST_UPLOADS_DIR, { recursive: true, force: true });
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

  /** An authenticated actor holding no role at all, for permission-denial checks unrelated to any specific role. */
  async function noPermissionsRequest() {
    const user = await createUser();
    const token = await accessTokenFor(user.email);
    return { auth: () => ({ Authorization: `Bearer ${token}` }) };
  }

  async function createLead() {
    return testPrisma.lead.create({ data: { firstName: `Lead-${randomUUID().slice(0, 8)}` } });
  }

  function uploadRequest(auth: () => Record<string, string>, leadId: string) {
    return request(app.getHttpServer())
      .post('/api/v1/files')
      .set(auth())
      .field('relatedEntityType', 'lead')
      .field('relatedEntityId', leadId)
      .field('purpose', 'customer_document');
  }

  describe('Upload', () => {
    it('uploads a file and attaches it to a lead', async () => {
      const { auth } = await authedRequest();
      const lead = await createLead();

      const response = await uploadRequest(auth, lead.id)
        .attach('file', Buffer.from('hello world'), { filename: 'notes.txt', contentType: 'text/plain' })
        .expect(201);

      expect(response.body).toMatchObject({
        originalFilename: 'notes.txt',
        mimeType: 'text/plain',
        sizeBytes: 11,
        purpose: 'customer_document',
        relatedEntityType: 'lead',
        relatedEntityId: lead.id,
      });
      expect(response.body.uploadedBy).not.toBeNull();
    });

    it('rejects an upload with no file', async () => {
      const { auth } = await authedRequest();
      const lead = await createLead();

      const response = await uploadRequest(auth, lead.id).expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects an unsupported file type', async () => {
      const { auth } = await authedRequest();
      const lead = await createLead();

      const response = await uploadRequest(auth, lead.id)
        .attach('file', Buffer.from('#!/bin/sh\necho hi'), { filename: 'script.sh', contentType: 'application/x-sh' })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects an upload attached to an entity that does not exist', async () => {
      const { auth } = await authedRequest();

      const response = await uploadRequest(auth, randomUUID())
        .attach('file', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('denies uploading without file.upload', async () => {
      const { auth } = await noPermissionsRequest();
      const lead = await createLead();

      await uploadRequest(auth, lead.id)
        .attach('file', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' })
        .expect(403);
    });
  });

  describe('List, download and delete', () => {
    it('lists files attached to an entity, excluding deleted ones', async () => {
      const { auth } = await authedRequest();
      const lead = await createLead();
      const otherLead = await createLead();

      const uploaded = await uploadRequest(auth, lead.id)
        .attach('file', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
        .expect(201);
      await uploadRequest(auth, otherLead.id)
        .attach('file', Buffer.from('other'), { filename: 'b.txt', contentType: 'text/plain' })
        .expect(201);

      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/files')
        .query({ relatedEntityType: 'lead', relatedEntityId: lead.id })
        .set(auth())
        .expect(200);
      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].id).toBe(uploaded.body.id);

      await request(app.getHttpServer()).delete(`/api/v1/files/${uploaded.body.id}`).set(auth()).expect(200);

      const afterDelete = await request(app.getHttpServer())
        .get('/api/v1/files')
        .query({ relatedEntityType: 'lead', relatedEntityId: lead.id })
        .set(auth())
        .expect(200);
      expect(afterDelete.body.data).toHaveLength(0);
    });

    it('downloads a file with its original bytes, filename and content type', async () => {
      const { auth } = await authedRequest();
      const lead = await createLead();

      const uploaded = await uploadRequest(auth, lead.id)
        .attach('file', Buffer.from('the quick brown fox'), { filename: 'story.txt', contentType: 'text/plain' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/files/${uploaded.body.id}/download`)
        .set(auth())
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.headers['content-disposition']).toContain('story.txt');
      expect(response.text).toBe('the quick brown fox');
    });

    it('rejects downloading or deleting a file that does not exist', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .get(`/api/v1/files/${randomUUID()}/download`)
        .set(auth())
        .expect(404);
      await request(app.getHttpServer()).delete(`/api/v1/files/${randomUUID()}`).set(auth()).expect(404);
    });

    it('denies listing and deleting without the right permissions', async () => {
      const { auth: adminAuth } = await authedRequest();
      const lead = await createLead();
      const uploaded = await uploadRequest(adminAuth, lead.id)
        .attach('file', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
        .expect(201);

      const { auth } = await noPermissionsRequest();
      await request(app.getHttpServer())
        .get('/api/v1/files')
        .query({ relatedEntityType: 'lead', relatedEntityId: lead.id })
        .set(auth())
        .expect(403);
      await request(app.getHttpServer()).delete(`/api/v1/files/${uploaded.body.id}`).set(auth()).expect(403);
    });
  });
});
