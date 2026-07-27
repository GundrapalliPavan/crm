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
 * Product Catalog (Module 2 - ARCHITECTURE.md section 19, DATABASE.md
 * sections 38-45, API.md sections 49-54) against a real Postgres database.
 * Every test gets its own application instance, matching the auth/CRM
 * suites' pattern.
 */
describe('Product Catalog (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "products", "product_categories", "brands", ' +
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

  async function seedCategory(name = `Lights-${randomUUID()}`) {
    return testPrisma.productCategory.create({ data: { name } });
  }

  async function seedUnitId(): Promise<string> {
    const unit = await testPrisma.unit.findFirstOrThrow();
    return unit.id;
  }

  describe('Units', () => {
    it('lists the seeded units, read-only', async () => {
      const { auth } = await authedRequest();

      const response = await request(app.getHttpServer())
        .get('/api/v1/units')
        .set(auth())
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toMatchObject({ name: expect.any(String), symbol: expect.any(String) });
    });
  });

  describe('Product Categories', () => {
    it('creates, lists and updates a category', async () => {
      const { auth } = await authedRequest();

      const created = await request(app.getHttpServer())
        .post('/api/v1/product-categories')
        .set(auth())
        .send({ name: 'Fans' })
        .expect(201);
      expect(created.body).toMatchObject({ name: 'Fans', isActive: true, parent: null });

      const list = await request(app.getHttpServer())
        .get('/api/v1/product-categories')
        .set(auth())
        .expect(200);
      expect(list.body.data.some((category: { id: string }) => category.id === created.body.id)).toBe(true);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/product-categories/${created.body.id}`)
        .set(auth())
        .send({ isActive: false })
        .expect(200);
      expect(updated.body.isActive).toBe(false);
    });

    it('supports a parent/child hierarchy', async () => {
      const { auth } = await authedRequest();
      const parent = await request(app.getHttpServer())
        .post('/api/v1/product-categories')
        .set(auth())
        .send({ name: 'Lights' })
        .expect(201);

      const child = await request(app.getHttpServer())
        .post('/api/v1/product-categories')
        .set(auth())
        .send({ name: 'LED Bulbs', parentId: parent.body.id })
        .expect(201);

      expect(child.body.parent).toMatchObject({ id: parent.body.id, name: 'Lights' });
    });

    it('rejects a duplicate name at the same level', async () => {
      const { auth } = await authedRequest();
      await request(app.getHttpServer())
        .post('/api/v1/product-categories')
        .set(auth())
        .send({ name: 'Switches' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/product-categories')
        .set(auth())
        .send({ name: 'Switches' })
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('rejects a category referencing a nonexistent parent', async () => {
      const { auth } = await authedRequest();

      const response = await request(app.getHttpServer())
        .post('/api/v1/product-categories')
        .set(auth())
        .send({ name: 'Orphan', parentId: randomUUID() })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('Brands', () => {
    it('creates, lists and updates a brand', async () => {
      const { auth } = await authedRequest();

      const created = await request(app.getHttpServer())
        .post('/api/v1/brands')
        .set(auth())
        .send({ name: 'Atomberg' })
        .expect(201);
      expect(created.body).toMatchObject({ name: 'Atomberg', isActive: true });

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/brands/${created.body.id}`)
        .set(auth())
        .send({ description: 'Premium fans and lighting' })
        .expect(200);
      expect(updated.body.description).toBe('Premium fans and lighting');
    });

    it('rejects a duplicate brand name', async () => {
      const { auth } = await authedRequest();
      await request(app.getHttpServer()).post('/api/v1/brands').set(auth()).send({ name: 'Havells' }).expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/brands')
        .set(auth())
        .send({ name: 'havells' })
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('Products', () => {
    it('creates a product and returns expanded category/brand/unit', async () => {
      const { auth } = await authedRequest();
      const category = await seedCategory();
      const unitId = await seedUnitId();
      const brand = await request(app.getHttpServer())
        .post('/api/v1/brands')
        .set(auth())
        .send({ name: `Crompton-${randomUUID()}` })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({
          sku: 'FAN-REN-1200-WHT',
          name: 'Renesa 1200mm Ceiling Fan',
          categoryId: category.id,
          brandId: brand.body.id,
          unitId,
          taxRate: '18',
          sellingPriceReference: '2499.00',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        sku: 'FAN-REN-1200-WHT',
        name: 'Renesa 1200mm Ceiling Fan',
        category: { id: category.id },
        brand: { id: brand.body.id },
        unit: { id: unitId },
        isActive: true,
      });
    });

    it('rejects a product referencing a nonexistent category', async () => {
      const { auth } = await authedRequest();
      const unitId = await seedUnitId();

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({ sku: 'X-1', name: 'X', categoryId: randomUUID(), unitId })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('rejects a duplicate SKU', async () => {
      const { auth } = await authedRequest();
      const category = await seedCategory();
      const unitId = await seedUnitId();

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({ sku: 'DUP-1', name: 'First', categoryId: category.id, unitId })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({ sku: 'dup-1', name: 'Second', categoryId: category.id, unitId })
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('searches by name or SKU and filters by category', async () => {
      const { auth } = await authedRequest();
      const category = await seedCategory();
      const otherCategory = await seedCategory();
      const unitId = await seedUnitId();

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({ sku: 'FAN-1', name: 'Ceiling Fan', categoryId: category.id, unitId })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({ sku: 'WIRE-1', name: 'Copper Wire', categoryId: otherCategory.id, unitId })
        .expect(201);

      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ q: 'fan' })
        .set(auth())
        .expect(200);
      expect(searchResponse.body.data).toHaveLength(1);
      expect(searchResponse.body.data[0].sku).toBe('FAN-1');

      const filterResponse = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({ categoryId: otherCategory.id })
        .set(auth())
        .expect(200);
      expect(filterResponse.body.data).toHaveLength(1);
      expect(filterResponse.body.data[0].sku).toBe('WIRE-1');
    });

    it('archives a product (soft delete) so it drops out of the default list', async () => {
      const { auth } = await authedRequest();
      const category = await seedCategory();
      const unitId = await seedUnitId();

      const created = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({ sku: 'ARCH-1', name: 'To Archive', categoryId: category.id, unitId })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/products/${created.body.id}`)
        .set(auth())
        .expect(204);

      const list = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set(auth())
        .expect(200);
      expect(list.body.data.some((product: { id: string }) => product.id === created.body.id)).toBe(false);
    });

    it('denies product creation without the product.create permission', async () => {
      const { auth } = await authedRequest('Sales Executive');
      const category = await seedCategory();
      const unitId = await seedUnitId();

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth())
        .send({ sku: 'DENY-1', name: 'Denied', categoryId: category.id, unitId })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
