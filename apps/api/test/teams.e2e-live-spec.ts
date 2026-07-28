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
 * Team Management (Module 9 - PROJECT.md section 18, technical/API.md
 * section 102) against a real Postgres database. Scope for this pass, per
 * explicit user direction: Teams & Reporting Structure only - Team CRUD,
 * membership, manager assignment, team-scoped visibility on Leads/
 * Quotations/Sales Orders, and the Team Performance report. `team.manage`
 * gates every `/teams` route (reads included), matching the `role.manage`
 * precedent already used for Roles.
 */
describe('Team Management (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "sales_order_items", "sales_orders", "quotation_items", "quotations", ' +
        '"lead_activities", "follow_ups", "leads", "team_members", "teams", "companies", ' +
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

  async function createTeam(auth: () => Record<string, string>, overrides: { managerId?: string } = {}) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/teams')
      .set(auth())
      .send({ name: `Team-${randomUUID().slice(0, 8)}`, managerId: overrides.managerId })
      .expect(201);
    return response.body;
  }

  describe('Team CRUD', () => {
    it('creates a team with a manager', async () => {
      const { auth } = await authedRequest();
      const manager = await createUser();

      const team = await createTeam(auth, { managerId: manager.id });

      expect(team).toMatchObject({
        manager: { id: manager.id },
        isActive: true,
        memberCount: 0,
      });
    });

    it('rejects a duplicate team name', async () => {
      const { auth } = await authedRequest();
      const name = `Team-${randomUUID().slice(0, 8)}`;
      await request(app.getHttpServer()).post('/api/v1/teams').set(auth()).send({ name }).expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/teams')
        .set(auth())
        .send({ name })
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('rejects a manager that does not exist', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/teams')
        .set(auth())
        .send({ name: `Team-${randomUUID().slice(0, 8)}`, managerId: randomUUID() })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('updates a team', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/teams/${team.id}`)
        .set(auth())
        .send({ isActive: false })
        .expect(200);
      expect(updated.body.isActive).toBe(false);
    });

    it('filters the list by isActive', async () => {
      const { auth } = await authedRequest();
      const active = await createTeam(auth);
      const inactive = await createTeam(auth);
      await request(app.getHttpServer())
        .patch(`/api/v1/teams/${inactive.id}`)
        .set(auth())
        .send({ isActive: false })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/api/v1/teams')
        .query({ isActive: true })
        .set(auth())
        .expect(200);

      const ids = response.body.data.map((row: { id: string }) => row.id);
      expect(ids).toContain(active.id);
      expect(ids).not.toContain(inactive.id);
    });

    it('denies team management without team.manage', async () => {
      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .post('/api/v1/teams')
        .set(auth())
        .send({ name: 'X' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('denies even reading the team list without team.manage', async () => {
      const { auth } = await authedRequest('Sales Executive');
      await request(app.getHttpServer()).get('/api/v1/teams').set(auth()).expect(403);
    });
  });

  describe('Membership', () => {
    it('adds a member and lists only active members', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);
      const member = await createUser();

      const added = await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: member.id, membershipRole: 'Sales Rep' })
        .expect(201);
      expect(added.body).toMatchObject({ user: { id: member.id }, membershipRole: 'Sales Rep', isActive: true });

      const list = await request(app.getHttpServer())
        .get(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .expect(200);
      expect(list.body.data).toHaveLength(1);
      expect(list.body.data[0].user.id).toBe(member.id);
    });

    it('rejects adding a user that does not exist', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: randomUUID() })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('rejects adding the same active member twice', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);
      const member = await createUser();
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: member.id })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: member.id })
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('removes a member, excludes them from the active list, then reactivates on re-add', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);
      const member = await createUser();
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: member.id })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/teams/${team.id}/members/${member.id}`)
        .set(auth())
        .expect(200);

      const afterRemoval = await request(app.getHttpServer())
        .get(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .expect(200);
      expect(afterRemoval.body.data).toHaveLength(0);

      await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: member.id })
        .expect(201);

      const afterReAdd = await request(app.getHttpServer())
        .get(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .expect(200);
      expect(afterReAdd.body.data).toHaveLength(1);
    });

    it('rejects removing a user who is not an active member', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);
      const nonMember = await createUser();

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/teams/${team.id}/members/${nonMember.id}`)
        .set(auth())
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('Team-scoped visibility', () => {
    it('filters the lead list by assignedTeamId via ?teamId=', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);
      const otherTeam = await createTeam(auth);
      const inTeam = await testPrisma.lead.create({
        data: { firstName: `Lead-${randomUUID().slice(0, 8)}`, assignedTeamId: team.id },
      });
      await testPrisma.lead.create({
        data: { firstName: `Lead-${randomUUID().slice(0, 8)}`, assignedTeamId: otherTeam.id },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/leads')
        .query({ teamId: team.id })
        .set(auth())
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(inTeam.id);
    });

    it('rejects creating a lead with a team that does not exist', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Jane', leadType: 'other', assignedTeamId: randomUUID() })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('rejects assigning a lead to a team that does not exist', async () => {
      const { auth } = await authedRequest();
      const lead = await testPrisma.lead.create({ data: { firstName: `Lead-${randomUUID().slice(0, 8)}` } });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/leads/${lead.id}/assign`)
        .set(auth())
        .send({ teamId: randomUUID() })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('filters quotations and sales orders by ?teamId= via team membership', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);
      const member = await createUser();
      const outsider = await createUser();
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: member.id })
        .expect(201);

      const company = await testPrisma.company.create({ data: { name: `Company-${randomUUID().slice(0, 8)}` } });
      const inTeamQuotation = await testPrisma.quotation.create({
        data: {
          quotationNumber: `QUO-${randomUUID().slice(0, 8)}`,
          customerCompanyId: company.id,
          quotationDate: new Date(),
          ownerId: member.id,
        },
      });
      await testPrisma.quotation.create({
        data: {
          quotationNumber: `QUO-${randomUUID().slice(0, 8)}`,
          customerCompanyId: company.id,
          quotationDate: new Date(),
          ownerId: outsider.id,
        },
      });
      const inTeamOrder = await testPrisma.salesOrder.create({
        data: {
          salesOrderNumber: `SO-${randomUUID().slice(0, 8)}`,
          customerCompanyId: company.id,
          orderDate: new Date(),
          ownerId: member.id,
        },
      });
      await testPrisma.salesOrder.create({
        data: {
          salesOrderNumber: `SO-${randomUUID().slice(0, 8)}`,
          customerCompanyId: company.id,
          orderDate: new Date(),
          ownerId: outsider.id,
        },
      });

      const quotationResponse = await request(app.getHttpServer())
        .get('/api/v1/quotations')
        .query({ teamId: team.id })
        .set(auth())
        .expect(200);
      expect(quotationResponse.body.data).toHaveLength(1);
      expect(quotationResponse.body.data[0].id).toBe(inTeamQuotation.id);

      const orderResponse = await request(app.getHttpServer())
        .get('/api/v1/sales-orders')
        .query({ teamId: team.id })
        .set(auth())
        .expect(200);
      expect(orderResponse.body.data).toHaveLength(1);
      expect(orderResponse.body.data[0].id).toBe(inTeamOrder.id);
    });
  });

  describe('Team Performance report', () => {
    it('aggregates leads, quotations and sales orders per team', async () => {
      const { auth } = await authedRequest();
      const team = await createTeam(auth);
      const member = await createUser();
      await request(app.getHttpServer())
        .post(`/api/v1/teams/${team.id}/members`)
        .set(auth())
        .send({ userId: member.id })
        .expect(201);

      await testPrisma.lead.create({
        data: { firstName: 'Open', assignedTeamId: team.id, status: 'new' },
      });
      await testPrisma.lead.create({
        data: { firstName: 'Won', assignedTeamId: team.id, status: 'converted' },
      });

      const company = await testPrisma.company.create({ data: { name: `Company-${randomUUID().slice(0, 8)}` } });
      await testPrisma.quotation.create({
        data: {
          quotationNumber: `QUO-${randomUUID().slice(0, 8)}`,
          customerCompanyId: company.id,
          quotationDate: new Date(),
          ownerId: member.id,
          totalAmount: '1000.00',
        },
      });
      await testPrisma.salesOrder.create({
        data: {
          salesOrderNumber: `SO-${randomUUID().slice(0, 8)}`,
          customerCompanyId: company.id,
          orderDate: new Date(),
          ownerId: member.id,
          totalAmount: '2500.00',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/team-performance')
        .query({ teamId: team.id })
        .set(auth())
        .expect(200);

      expect(response.body.teams).toHaveLength(1);
      expect(response.body.teams[0]).toMatchObject({
        teamId: team.id,
        memberCount: 1,
        leadCount: 2,
        convertedLeadCount: 1,
        conversionRate: '50',
        quotationCount: 1,
        quotationValue: '1000',
        salesOrderCount: 1,
        salesOrderValue: '2500',
      });
    });

    it('denies the team-performance report without report.view', async () => {
      const { auth } = await authedRequest('Sales Executive');
      await request(app.getHttpServer()).get('/api/v1/reports/team-performance').set(auth()).expect(403);
    });
  });
});
