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
 * Inventory (Module 3 - INVENTORY.md section 116, DATABASE.md sections
 * 46-53, API.md sections 55-61) against a real Postgres database. Scope for
 * this pass: Warehouses, Stock Balances, Stock Movement Ledger, Adjustments
 * and Transfers. Every test gets its own application instance, matching the
 * auth/CRM/Product suites' pattern.
 */
describe('Inventory (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "stock_movements", "inventory_balances", "warehouses", ' +
        '"products", "product_categories", "brands", ' +
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

  async function seedProduct(options: { minimumStockLevel?: string } = {}) {
    const category = await testPrisma.productCategory.create({
      data: { name: `Category-${randomUUID()}` },
    });
    const unit = await testPrisma.unit.findFirstOrThrow();
    return testPrisma.product.create({
      data: {
        sku: `SKU-${randomUUID()}`,
        name: `Product ${randomUUID()}`,
        categoryId: category.id,
        unitId: unit.id,
        minimumStockLevel: options.minimumStockLevel,
      },
    });
  }

  async function createWarehouse(auth: () => Record<string, string>, code = `W-${randomUUID().slice(0, 8)}`) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/warehouses')
      .set(auth())
      .send({ code, name: `Warehouse ${code}` })
      .expect(201);
    return response.body;
  }

  describe('Warehouses', () => {
    it('creates, lists, gets and updates a warehouse', async () => {
      const { auth } = await authedRequest();

      const created = await createWarehouse(auth, 'MAIN');
      expect(created).toMatchObject({ code: 'MAIN', name: 'Warehouse MAIN', isActive: true, manager: null });

      const list = await request(app.getHttpServer()).get('/api/v1/warehouses').set(auth()).expect(200);
      expect(list.body.data.some((w: { id: string }) => w.id === created.id)).toBe(true);

      const fetched = await request(app.getHttpServer())
        .get(`/api/v1/warehouses/${created.id}`)
        .set(auth())
        .expect(200);
      expect(fetched.body.id).toBe(created.id);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/warehouses/${created.id}`)
        .set(auth())
        .send({ isActive: false })
        .expect(200);
      expect(updated.body.isActive).toBe(false);
    });

    it('rejects a duplicate warehouse code', async () => {
      const { auth } = await authedRequest();
      await createWarehouse(auth, 'DUP');

      const response = await request(app.getHttpServer())
        .post('/api/v1/warehouses')
        .set(auth())
        .send({ code: 'dup', name: 'Duplicate' })
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('denies warehouse creation without warehouse.manage', async () => {
      const { auth } = await authedRequest('Sales Executive');

      const response = await request(app.getHttpServer())
        .post('/api/v1/warehouses')
        .set(auth())
        .send({ code: 'DENY', name: 'Denied' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('Adjustments', () => {
    it('increases stock and records an adjustment_in movement', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse(auth);
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({
          productId: product.id,
          warehouseId: warehouse.id,
          quantityDelta: '25',
          reason: 'opening_balance_correction',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        productId: product.id,
        warehouseId: warehouse.id,
        onHandQuantity: '25',
        availableQuantity: '25',
      });

      const movements = await request(app.getHttpServer())
        .get('/api/v1/stock-movements')
        .query({ productId: product.id })
        .set(auth())
        .expect(200);
      expect(movements.body.data).toHaveLength(1);
      expect(movements.body.data[0]).toMatchObject({ movementType: 'adjustment_in', quantityDelta: '25' });
    });

    it('decreases stock and records an adjustment_out movement', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse(auth);
      const product = await seedProduct();

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '10', reason: 'data_correction' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '-4', reason: 'damage' })
        .expect(201);

      expect(response.body.onHandQuantity).toBe('6');
    });

    it('rejects an adjustment that would make available stock negative', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse(auth);
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '-1', reason: 'damage' })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a zero-quantity adjustment', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse(auth);
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '0', reason: 'damage' })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('denies adjustment without inventory.adjust', async () => {
      const { auth } = await authedRequest('Sales Executive');
      const admin = await authedRequest();
      const warehouse = await createWarehouse(admin.auth);
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '5', reason: 'damage' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('Transfers', () => {
    it('moves stock between warehouses with paired ledger entries', async () => {
      const { auth } = await authedRequest();
      const source = await createWarehouse(auth, 'SRC');
      const destination = await createWarehouse(auth, 'DST');
      const product = await seedProduct();

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: source.id, quantityDelta: '20', reason: 'opening_balance_correction' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/transfers')
        .set(auth())
        .send({ productId: product.id, fromWarehouseId: source.id, toWarehouseId: destination.id, quantity: '8' })
        .expect(201);

      expect(response.body.from.onHandQuantity).toBe('12');
      expect(response.body.to.onHandQuantity).toBe('8');

      const movements = await request(app.getHttpServer())
        .get('/api/v1/stock-movements')
        .query({ productId: product.id })
        .set(auth())
        .expect(200);
      const types = movements.body.data.map((m: { movementType: string }) => m.movementType).sort();
      expect(types).toEqual(['adjustment_in', 'transfer_in', 'transfer_out']);
    });

    it('rejects a transfer that exceeds available stock at the source', async () => {
      const { auth } = await authedRequest();
      const source = await createWarehouse(auth, 'SRC2');
      const destination = await createWarehouse(auth, 'DST2');
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/transfers')
        .set(auth())
        .send({ productId: product.id, fromWarehouseId: source.id, toWarehouseId: destination.id, quantity: '5' })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a transfer to the same warehouse', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse(auth);
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/transfers')
        .set(auth())
        .send({ productId: product.id, fromWarehouseId: warehouse.id, toWarehouseId: warehouse.id, quantity: '1' })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('denies transfer without inventory.transfer', async () => {
      const { auth } = await authedRequest('Sales Executive');
      const admin = await authedRequest();
      const source = await createWarehouse(admin.auth, 'SRC3');
      const destination = await createWarehouse(admin.auth, 'DST3');
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/inventory/transfers')
        .set(auth())
        .send({ productId: product.id, fromWarehouseId: source.id, toWarehouseId: destination.id, quantity: '1' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('Stock Balances', () => {
    it('lists balances filterable by warehouse, category and search', async () => {
      const { auth } = await authedRequest();
      const warehouseA = await createWarehouse(auth, 'A1');
      const warehouseB = await createWarehouse(auth, 'B1');
      const productA = await seedProduct();
      const productB = await seedProduct();

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: productA.id, warehouseId: warehouseA.id, quantityDelta: '10', reason: 'data_correction' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: productB.id, warehouseId: warehouseB.id, quantityDelta: '15', reason: 'data_correction' })
        .expect(201);

      const byWarehouse = await request(app.getHttpServer())
        .get('/api/v1/inventory')
        .query({ warehouseId: warehouseA.id })
        .set(auth())
        .expect(200);
      expect(byWarehouse.body.data).toHaveLength(1);
      expect(byWarehouse.body.data[0].productId).toBe(productA.id);

      const bySearch = await request(app.getHttpServer())
        .get('/api/v1/inventory')
        .query({ q: productB.sku })
        .set(auth())
        .expect(200);
      expect(bySearch.body.data).toHaveLength(1);
      expect(bySearch.body.data[0].productId).toBe(productB.id);
    });

    it('flags low stock once available quantity drops to or below the minimum', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse(auth);
      const lowProduct = await seedProduct({ minimumStockLevel: '10' });
      const healthyProduct = await seedProduct({ minimumStockLevel: '5' });

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: lowProduct.id, warehouseId: warehouse.id, quantityDelta: '10', reason: 'data_correction' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: healthyProduct.id, warehouseId: warehouse.id, quantityDelta: '50', reason: 'data_correction' })
        .expect(201);

      const lowStock = await request(app.getHttpServer())
        .get('/api/v1/inventory')
        .query({ stockStatus: 'low' })
        .set(auth())
        .expect(200);

      const productIds = lowStock.body.data.map((b: { productId: string }) => b.productId);
      expect(productIds).toContain(lowProduct.id);
      expect(productIds).not.toContain(healthyProduct.id);
      expect(lowStock.body.data.find((b: { productId: string }) => b.productId === lowProduct.id).isLowStock).toBe(
        true,
      );
    });

    it("returns a product's stock across every warehouse", async () => {
      const { auth } = await authedRequest();
      const warehouseA = await createWarehouse(auth, 'PA');
      const warehouseB = await createWarehouse(auth, 'PB');
      const product = await seedProduct();

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouseA.id, quantityDelta: '3', reason: 'data_correction' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouseB.id, quantityDelta: '7', reason: 'data_correction' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}/inventory`)
        .set(auth())
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const total = response.body.data.reduce(
        (sum: number, balance: { onHandQuantity: string }) => sum + Number(balance.onHandQuantity),
        0,
      );
      expect(total).toBe(10);
    });

    it('denies inventory listing without inventory.read', async () => {
      const { auth } = await authedRequest('Sales Executive');

      const response = await request(app.getHttpServer()).get('/api/v1/inventory').set(auth()).expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
