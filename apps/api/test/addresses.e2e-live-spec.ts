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
 * Addresses (platform capability - technical/DATABASE.md sections 36-37)
 * against a real Postgres database. `Address` existed in the schema since
 * Phase 0 and was completely unused - no migration was needed. An address
 * attaches to exactly one of Company/Contact/Warehouse via dedicated
 * nullable foreign keys plus a database CHECK constraint, not a generic
 * relatedEntityType/relatedEntityId pair. Wiring the billing/shipping/
 * supplier address snapshot JSON columns already present on Quotation/
 * SalesOrder/PurchaseOrder/Invoice is a deliberate follow-up, not covered
 * here.
 */
describe('Addresses (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "addresses", "contacts", "companies", "warehouses", ' +
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

  function createCompany() {
    return testPrisma.company.create({ data: { name: `Company-${randomUUID().slice(0, 8)}` } });
  }

  function createContact() {
    return testPrisma.contact.create({ data: { firstName: `Contact-${randomUUID().slice(0, 8)}` } });
  }

  function createWarehouse() {
    return testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });
  }

  function addressPayload(overrides: Record<string, unknown> = {}) {
    return {
      addressType: 'billing',
      line1: '221B Baker Street',
      city: 'Hyderabad',
      state: 'Telangana',
      stateCode: '36',
      postalCode: '500001',
      ...overrides,
    };
  }

  describe('Create', () => {
    it('creates an address for a company', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();

      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id }))
        .expect(201);

      expect(response.body).toMatchObject({
        companyId: company.id,
        contactId: null,
        warehouseId: null,
        addressType: 'billing',
        line1: '221B Baker Street',
        countryCode: 'IN',
        isDefault: false,
      });
    });

    it('creates an address for a contact', async () => {
      const { auth } = await authedRequest();
      const contact = await createContact();

      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ contactId: contact.id, addressType: 'shipping' }))
        .expect(201);

      expect(response.body).toMatchObject({ contactId: contact.id, companyId: null, addressType: 'shipping' });
    });

    it('creates an address for a warehouse', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse();

      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ warehouseId: warehouse.id, addressType: 'warehouse' }))
        .expect(201);

      expect(response.body).toMatchObject({ warehouseId: warehouse.id, addressType: 'warehouse' });
    });

    it('rejects an address with no owner', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload())
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects an address with more than one owner', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();
      const contact = await createContact();

      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, contactId: contact.id }))
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects an address for a company that does not exist', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: randomUUID() }))
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('rejects an invalid addressType', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();
      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, addressType: 'not-a-type' }))
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('treats blank optional fields as absent rather than storing them literally', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();

      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, line2: '', stateCode: '', postalCode: '', countryCode: '' }))
        .expect(201);

      expect(response.body).toMatchObject({ line2: null, stateCode: null, postalCode: null, countryCode: 'IN' });
    });

    it('resets a blanked countryCode to the database default on update, and nulls other blanked optional fields', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();
      const created = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, stateCode: '36', countryCode: 'US' }))
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/addresses/${created.body.id}`)
        .set(auth())
        .send({ stateCode: '', countryCode: '' })
        .expect(200);

      expect(updated.body).toMatchObject({ stateCode: null, countryCode: 'IN' });
    });

    it('unsets the previous default of the same owner and type when a new default is created', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();

      const first = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, isDefault: true }))
        .expect(201);
      expect(first.body.isDefault).toBe(true);

      const second = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, isDefault: true, line1: 'Second Address' }))
        .expect(201);
      expect(second.body.isDefault).toBe(true);

      const refreshedFirst = await testPrisma.address.findUniqueOrThrow({ where: { id: first.body.id } });
      expect(refreshedFirst.isDefault).toBe(false);
    });

    it('does not affect the default of a different addressType for the same owner', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();

      const billing = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, addressType: 'billing', isDefault: true }))
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, addressType: 'shipping', isDefault: true }))
        .expect(201);

      const refreshedBilling = await testPrisma.address.findUniqueOrThrow({ where: { id: billing.body.id } });
      expect(refreshedBilling.isDefault).toBe(true);
    });

    it('denies address management without address.manage', async () => {
      const { auth } = await authedRequest('Sales Executive');
      const company = await createCompany();
      const response = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id }))
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('List', () => {
    it('lists addresses scoped to one owner, defaults first', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();
      const otherCompany = await createCompany();

      await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id }))
        .expect(201);
      const defaultAddress = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, addressType: 'shipping', isDefault: true }))
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: otherCompany.id }))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/v1/addresses')
        .query({ companyId: company.id })
        .set(auth())
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].id).toBe(defaultAddress.body.id);
    });

    it('rejects a list request with no owner filter', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer()).get('/api/v1/addresses').set(auth()).expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Update', () => {
    it('updates address fields', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();
      const created = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id }))
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/addresses/${created.body.id}`)
        .set(auth())
        .send({ city: 'Bengaluru', postalCode: '560001' })
        .expect(200);

      expect(updated.body).toMatchObject({ city: 'Bengaluru', postalCode: '560001', line1: '221B Baker Street' });
    });

    it('unsets sibling defaults when isDefault is set to true on an existing address', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();
      const first = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, isDefault: true }))
        .expect(201);
      const second = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id, line1: 'Second' }))
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/addresses/${second.body.id}`)
        .set(auth())
        .send({ isDefault: true })
        .expect(200);

      const refreshedFirst = await testPrisma.address.findUniqueOrThrow({ where: { id: first.body.id } });
      expect(refreshedFirst.isDefault).toBe(false);
    });

    it('returns 404 for an address that does not exist', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/addresses/${randomUUID()}`)
        .set(auth())
        .send({ city: 'Bengaluru' })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('Delete', () => {
    it('deletes an address', async () => {
      const { auth } = await authedRequest();
      const company = await createCompany();
      const created = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(auth())
        .send(addressPayload({ companyId: company.id }))
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/v1/addresses/${created.body.id}`).set(auth()).expect(200);

      const found = await testPrisma.address.findUnique({ where: { id: created.body.id } });
      expect(found).toBeNull();
    });

    it('denies deletion without address.manage', async () => {
      const { auth: adminAuth } = await authedRequest();
      const company = await createCompany();
      const created = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set(adminAuth())
        .send(addressPayload({ companyId: company.id }))
        .expect(201);

      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/addresses/${created.body.id}`)
        .set(auth())
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
