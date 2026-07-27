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
 * Communication (Module 8 - PROJECT.md sections 20-27, technical/API.md
 * sections 84-93) against a real Postgres database. Scope for this pass:
 * Communication Templates (CRUD) and Communications (send/record, either
 * from a template with variable substitution or ad-hoc, plus filtered
 * history). No real WhatsApp/Email/SMS provider exists yet, so every send
 * honestly ends up `failed` with a clear reason via
 * `UnconfiguredCommunicationProvider` - this suite asserts that behavior
 * directly rather than pretending delivery succeeds.
 */
describe('Communication (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "communication_events", "communications", "communication_templates", ' +
        '"leads", "contacts", "companies", ' +
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

  async function createTemplate(
    auth: () => Record<string, string>,
    overrides: { channel?: string; bodyTemplate?: string; subjectTemplate?: string } = {},
  ) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/communication-templates')
      .set(auth())
      .send({
        name: `Template-${randomUUID().slice(0, 8)}`,
        channel: overrides.channel ?? 'whatsapp',
        purpose: 'invoice',
        bodyTemplate: overrides.bodyTemplate ?? 'Hi {{customer_name}}, your invoice {{invoice_number}} is ready.',
        subjectTemplate: overrides.subjectTemplate,
      })
      .expect(201);
    return response.body;
  }

  describe('Communication Templates', () => {
    it('creates and updates a template', async () => {
      const { auth } = await authedRequest();
      const template = await createTemplate(auth);
      expect(template).toMatchObject({ status: 'draft', languageCode: 'en' });

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/communication-templates/${template.id}`)
        .set(auth())
        .send({ status: 'active' })
        .expect(200);
      expect(updated.body.status).toBe('active');
    });

    it('rejects a duplicate name+channel', async () => {
      const { auth } = await authedRequest();
      const name = `Template-${randomUUID().slice(0, 8)}`;
      await request(app.getHttpServer())
        .post('/api/v1/communication-templates')
        .set(auth())
        .send({ name, channel: 'email', purpose: 'invoice', bodyTemplate: 'Body' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/communication-templates')
        .set(auth())
        .send({ name, channel: 'email', purpose: 'invoice', bodyTemplate: 'Body 2' })
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('denies template management without communication_template.manage', async () => {
      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .post('/api/v1/communication-templates')
        .set(auth())
        .send({ name: 'X', channel: 'sms', purpose: 'reminder', bodyTemplate: 'Body' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('Communications', () => {
    it('sends from a template, substituting variables, and honestly reports failure with no provider configured', async () => {
      const { auth } = await authedRequest();
      const template = await createTemplate(auth, {
        bodyTemplate: 'Hi {{customer_name}}, your invoice {{invoice_number}} is ready.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({
          channel: 'whatsapp',
          recipient: '+919876543210',
          templateId: template.id,
          variables: { customer_name: 'Rajesh', invoice_number: 'INV-001' },
        })
        .expect(201);

      expect(response.body).toMatchObject({
        status: 'failed',
        messageBody: 'Hi Rajesh, your invoice INV-001 is ready.',
        template: { id: template.id },
      });
      expect(response.body.failureReason).toContain('No whatsapp provider is configured');
      expect(response.body.failedAt).not.toBeNull();
    });

    it('sends an ad-hoc message without a template', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({ channel: 'email', recipient: 'customer@example.com', subject: 'Hello', messageBody: 'Ad-hoc message' })
        .expect(201);

      expect(response.body).toMatchObject({ status: 'failed', messageBody: 'Ad-hoc message', template: null });
    });

    it('rejects a send with neither templateId nor messageBody', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({ channel: 'sms', recipient: '+919876543210' })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a template whose channel does not match the requested channel', async () => {
      const { auth } = await authedRequest();
      const template = await createTemplate(auth, { channel: 'email' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({ channel: 'sms', recipient: '+919876543210', templateId: template.id, variables: {} })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('rejects a send missing a required template variable', async () => {
      const { auth } = await authedRequest();
      const template = await createTemplate(auth);

      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({ channel: 'whatsapp', recipient: '+919876543210', templateId: template.id, variables: { customer_name: 'Rajesh' } })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects relatedEntityId given without relatedEntityType', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({ channel: 'sms', recipient: '+919876543210', messageBody: 'Hi', relatedEntityId: randomUUID() })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a relatedEntityId that does not exist', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({
          channel: 'sms',
          recipient: '+919876543210',
          messageBody: 'Hi',
          relatedEntityType: 'lead',
          relatedEntityId: randomUUID(),
        })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('links a communication to a real lead and filters history by it', async () => {
      const { auth } = await authedRequest();
      const lead = await testPrisma.lead.create({ data: { firstName: `Lead-${randomUUID().slice(0, 8)}` } });

      await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({
          channel: 'sms',
          recipient: '+919876543210',
          messageBody: 'Following up',
          relatedEntityType: 'lead',
          relatedEntityId: lead.id,
        })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({ channel: 'sms', recipient: '+910000000000', messageBody: 'Unrelated' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/v1/communications')
        .query({ relatedEntityType: 'lead', relatedEntityId: lead.id })
        .set(auth())
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({ relatedEntityType: 'lead', relatedEntityId: lead.id });
    });

    it('denies sending without communication.send', async () => {
      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .post('/api/v1/communications')
        .set(auth())
        .send({ channel: 'sms', recipient: '+919876543210', messageBody: 'Hi' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
