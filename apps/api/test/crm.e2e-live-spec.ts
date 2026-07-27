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
 * CRM & Lead Management (Module 1 - CRM.md, API.md sections 38-48) against a
 * real Postgres database. Every test gets its own application instance,
 * matching the auth suite's pattern (auth.e2e-live-spec.ts) for the same
 * reason: no shared in-memory or database state leaking between tests.
 */
describe('CRM & Lead Management (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "follow_ups", "lead_activities", "leads", ' +
        '"contacts", "companies", "team_members", "teams", "lead_sources", ' +
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

  /** A full-access user (Administrator role) - most tests just need a working token. */
  async function authedRequest() {
    const user = await createUser({ roleName: 'Administrator' });
    const token = await accessTokenFor(user.email);
    return { user, token, auth: () => ({ Authorization: `Bearer ${token}` }) };
  }

  describe('Leads', () => {
    it('creates a lead with the minimal quick-create fields', async () => {
      const { auth } = await authedRequest();

      const response = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Rajesh', phone: '9876543210', leadType: 'dealer' })
        .expect(201);

      expect(response.body).toMatchObject({
        firstName: 'Rajesh',
        leadType: 'dealer',
        status: 'new',
        priority: 'medium',
      });
    });

    it('rejects a duplicate lead by phone unless confirmed', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Rajesh', phone: '9876543210', leadType: 'dealer' })
        .expect(201);

      const blocked = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Rajesh Kumar', phone: '9876543210', leadType: 'dealer' })
        .expect(409);
      expect(blocked.body.error.code).toBe('DUPLICATE_RESOURCE');

      await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({
          firstName: 'Rajesh Kumar',
          phone: '9876543210',
          leadType: 'dealer',
          confirmDuplicate: true,
        })
        .expect(201);
    });

    it('lists leads filtered by status and supports the unassigned quick filter', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Unassigned Lead', leadType: 'other' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/v1/leads')
        .query({ unassigned: true, status: 'new' })
        .set(auth())
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({ firstName: 'Unassigned Lead' });
    });

    it('assigns a lead and logs an activity', async () => {
      const { auth } = await authedRequest();
      const salesperson = await createUser();

      const created = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Priya', leadType: 'retailer' })
        .expect(201);

      const assigned = await request(app.getHttpServer())
        .post(`/api/v1/leads/${created.body.id}/assign`)
        .set(auth())
        .send({ userId: salesperson.id })
        .expect(200);
      expect(assigned.body.assignee).toMatchObject({ id: salesperson.id });

      const activities = await request(app.getHttpServer())
        .get(`/api/v1/leads/${created.body.id}/activities`)
        .set(auth())
        .expect(200);

      const types = activities.body.data.map((activity: { activityType: string }) => activity.activityType);
      expect(types).toEqual(expect.arrayContaining(['created', 'assigned']));
    });

    it('requires a lost reason when transitioning to lost, and clears it on reopen', async () => {
      const { auth } = await authedRequest();

      const created = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Amit', leadType: 'contractor' })
        .expect(201);

      const rejected = await request(app.getHttpServer())
        .post(`/api/v1/leads/${created.body.id}/status`)
        .set(auth())
        .send({ status: 'lost' })
        .expect(422);
      expect(rejected.body.error.code).toBe('VALIDATION_ERROR');

      const lost = await request(app.getHttpServer())
        .post(`/api/v1/leads/${created.body.id}/status`)
        .set(auth())
        .send({ status: 'lost', lostReason: 'price', notes: 'Too expensive.' })
        .expect(200);
      expect(lost.body).toMatchObject({ status: 'lost', lostReason: 'price' });
      expect(lost.body.lostAt).toEqual(expect.any(String));

      const reopened = await request(app.getHttpServer())
        .post(`/api/v1/leads/${created.body.id}/status`)
        .set(auth())
        .send({ status: 'new' })
        .expect(200);
      expect(reopened.body).toMatchObject({ status: 'new', lostReason: null, lostAt: null });
    });

    it('converts a lead into a new company and contact, and blocks converting twice', async () => {
      const { auth } = await authedRequest();

      const created = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({
          firstName: 'Sunita',
          lastName: 'Rao',
          companyName: 'Rao Electricals',
          leadType: 'dealer',
        })
        .expect(201);

      const converted = await request(app.getHttpServer())
        .post(`/api/v1/leads/${created.body.id}/convert`)
        .set(auth())
        .send({})
        .expect(200);

      expect(converted.body.status).toBe('converted');
      expect(converted.body.convertedCompany).toMatchObject({ name: 'Rao Electricals' });
      expect(converted.body.convertedContact).toMatchObject({ firstName: 'Sunita', lastName: 'Rao' });

      const companies = await testPrisma.company.findMany({ where: { name: 'Rao Electricals' } });
      expect(companies).toHaveLength(1);

      await request(app.getHttpServer())
        .post(`/api/v1/leads/${created.body.id}/convert`)
        .set(auth())
        .send({})
        .expect(409);
    });

    it('links an existing company on conversion instead of creating a duplicate', async () => {
      const { auth, user } = await authedRequest();

      const existingCompany = await testPrisma.company.create({
        data: { name: 'Existing Traders', companyType: 'dealer', createdBy: user.id },
      });

      const created = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Vikram', leadType: 'dealer' })
        .expect(201);

      const converted = await request(app.getHttpServer())
        .post(`/api/v1/leads/${created.body.id}/convert`)
        .set(auth())
        .send({ companyId: existingCompany.id })
        .expect(200);

      expect(converted.body.convertedCompany).toMatchObject({ id: existingCompany.id });

      const companies = await testPrisma.company.findMany({ where: { name: 'Existing Traders' } });
      expect(companies).toHaveLength(1);
    });

    it('archives a lead so it no longer appears in the default list', async () => {
      const { auth } = await authedRequest();

      const created = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Archive Me', leadType: 'other' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/leads/${created.body.id}`)
        .set(auth())
        .expect(204);

      const response = await request(app.getHttpServer()).get('/api/v1/leads').set(auth()).expect(200);
      expect(response.body.data.find((lead: { id: string }) => lead.id === created.body.id)).toBeUndefined();
    });

    it('denies a user without lead.read permission', async () => {
      const noRoleUser = await createUser();
      const token = await accessTokenFor(noRoleUser.email);

      const response = await request(app.getHttpServer())
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('Follow-ups', () => {
    it('requires at least one related record', async () => {
      const { auth, user } = await authedRequest();

      const response = await request(app.getHttpServer())
        .post('/api/v1/follow-ups')
        .set(auth())
        .send({ assignedTo: user.id, followUpType: 'call', scheduledAt: new Date().toISOString() })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('completes a pending follow-up and schedules the next one in the same call', async () => {
      const { auth, user } = await authedRequest();

      const lead = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Follow Target', leadType: 'other' })
        .expect(201);

      const followUp = await request(app.getHttpServer())
        .post('/api/v1/follow-ups')
        .set(auth())
        .send({
          leadId: lead.body.id,
          assignedTo: user.id,
          followUpType: 'call',
          scheduledAt: new Date().toISOString(),
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/follow-ups/${followUp.body.id}/complete`)
        .set(auth())
        .send({
          outcome: 'Connected',
          nextFollowUp: {
            assignedTo: user.id,
            followUpType: 'whatsapp',
            scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
          },
        })
        .expect(200);

      const list = await request(app.getHttpServer())
        .get('/api/v1/follow-ups')
        .query({ leadId: lead.body.id })
        .set(auth())
        .expect(200);

      expect(list.body.data).toHaveLength(2);
      const statuses = list.body.data.map((item: { status: string }) => item.status).sort();
      expect(statuses).toEqual(['completed', 'pending']);
    });

    it('rejects completing an already-completed follow-up', async () => {
      const { auth, user } = await authedRequest();

      const followUp = await request(app.getHttpServer())
        .post('/api/v1/follow-ups')
        .set(auth())
        .send({
          companyId: (
            await testPrisma.company.create({ data: { name: 'FU Co', companyType: 'other', createdBy: user.id } })
          ).id,
          assignedTo: user.id,
          followUpType: 'call',
          scheduledAt: new Date().toISOString(),
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/follow-ups/${followUp.body.id}/complete`)
        .set(auth())
        .send({})
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/follow-ups/${followUp.body.id}/complete`)
        .set(auth())
        .send({})
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('cancels a pending follow-up', async () => {
      const { auth, user } = await authedRequest();
      const company = await testPrisma.company.create({
        data: { name: 'Cancel Co', companyType: 'other', createdBy: user.id },
      });

      const followUp = await request(app.getHttpServer())
        .post('/api/v1/follow-ups')
        .set(auth())
        .send({
          companyId: company.id,
          assignedTo: user.id,
          followUpType: 'meeting',
          scheduledAt: new Date().toISOString(),
        })
        .expect(201);

      const cancelled = await request(app.getHttpServer())
        .post(`/api/v1/follow-ups/${followUp.body.id}/cancel`)
        .set(auth())
        .expect(200);
      expect(cancelled.body.status).toBe('cancelled');
    });

    it('reports only the current user\'s follow-ups via /me/follow-ups', async () => {
      const { auth: adminAuth, user: admin } = await authedRequest();
      const other = await createUser({ roleName: 'Administrator' });
      const otherToken = await accessTokenFor(other.email);

      const company = await testPrisma.company.create({
        data: { name: 'Me Co', companyType: 'other', createdBy: admin.id },
      });

      await request(app.getHttpServer())
        .post('/api/v1/follow-ups')
        .set(adminAuth())
        .send({
          companyId: company.id,
          assignedTo: admin.id,
          followUpType: 'call',
          scheduledAt: new Date().toISOString(),
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/follow-ups')
        .set(adminAuth())
        .send({
          companyId: company.id,
          assignedTo: other.id,
          followUpType: 'call',
          scheduledAt: new Date().toISOString(),
        })
        .expect(201);

      const mine = await request(app.getHttpServer())
        .get('/api/v1/me/follow-ups')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(mine.body.data).toHaveLength(1);
      expect(mine.body.data[0].assignee).toMatchObject({ id: other.id });
    });
  });

  describe('Contacts', () => {
    it('creates, lists and archives a contact', async () => {
      const { auth } = await authedRequest();

      const created = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .set(auth())
        .send({ firstName: 'Arun', phone: '9123456780' })
        .expect(201);

      const list = await request(app.getHttpServer()).get('/api/v1/contacts').set(auth()).expect(200);
      expect(list.body.data).toHaveLength(1);

      await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${created.body.id}`)
        .set(auth())
        .expect(204);

      const afterArchive = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .set(auth())
        .expect(200);
      expect(afterArchive.body.data).toHaveLength(0);
    });

    it('rejects a duplicate contact by email unless confirmed', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .set(auth())
        .send({ firstName: 'Neha', email: 'neha@example.com' })
        .expect(201);

      const blocked = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .set(auth())
        .send({ firstName: 'Neha Again', email: 'neha@example.com' })
        .expect(409);
      expect(blocked.body.error.code).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('Companies', () => {
    it('creates a company and rejects a name duplicate unless confirmed', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set(auth())
        .send({ name: 'Bright Electricals', companyType: 'dealer' })
        .expect(201);

      const blocked = await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set(auth())
        .send({ name: 'bright electricals', companyType: 'dealer' })
        .expect(409);
      expect(blocked.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('filters companies by type and customer flag', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set(auth())
        .send({ name: 'Dealer Co', companyType: 'dealer', isCustomer: true })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set(auth())
        .send({ name: 'Supplier Co', companyType: 'other', isSupplier: true })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ type: 'dealer', isCustomer: true })
        .set(auth())
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({ name: 'Dealer Co' });
    });

    it('lists contacts belonging to a company via the subresource', async () => {
      const { auth } = await authedRequest();

      const company = await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set(auth())
        .send({ name: 'Subresource Co', companyType: 'retailer' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .set(auth())
        .send({ firstName: 'Linked', companyId: company.body.id })
        .expect(201);

      const contacts = await request(app.getHttpServer())
        .get(`/api/v1/companies/${company.body.id}/contacts`)
        .set(auth())
        .expect(200);

      expect(contacts.body.data).toHaveLength(1);
      expect(contacts.body.data[0]).toMatchObject({ firstName: 'Linked' });
    });
  });
});
