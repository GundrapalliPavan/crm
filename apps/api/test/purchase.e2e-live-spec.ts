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
 * Purchase (Module 5 - PURCHASE.md section 118, DATABASE.md sections 61-65,
 * API.md sections 69-74) against a real Postgres database. Scope for this
 * pass: Supplier profile (a thin extension of Company), Purchase Orders
 * (creation, calculations, the draft/approval/send workflow - every PO
 * requires approval), and Goods Receipts (recording a delivery, which
 * credits real Inventory stock via InventoryService.receiveStock and rolls
 * up PO status). Every test gets its own application instance, matching the
 * other suites' pattern.
 */
describe('Purchase (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "goods_receipt_items", "goods_receipts", ' +
        '"purchase_order_items", "purchase_orders", "supplier_profiles", "document_sequences", ' +
        '"stock_movements", "inventory_balances", "warehouses", ' +
        '"products", "product_categories", "brands", "contacts", "companies", ' +
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

  async function seedSupplier() {
    return testPrisma.company.create({ data: { name: `Supplier-${randomUUID()}`, isSupplier: true } });
  }

  async function seedProduct(options: { taxRate?: string } = {}) {
    const category = await testPrisma.productCategory.create({ data: { name: `Category-${randomUUID()}` } });
    const unit = await testPrisma.unit.findFirstOrThrow();
    return testPrisma.product.create({
      data: {
        sku: `SKU-${randomUUID()}`,
        name: `Product ${randomUUID()}`,
        categoryId: category.id,
        unitId: unit.id,
        taxRate: options.taxRate ?? '18',
      },
    });
  }

  async function createDraftPO(
    auth: () => Record<string, string>,
    overrides: { supplierCompanyId?: string; productId?: string; quantity?: string; unitPrice?: string } = {},
  ) {
    const supplierCompanyId = overrides.supplierCompanyId ?? (await seedSupplier()).id;
    const productId = overrides.productId ?? (await seedProduct()).id;

    const response = await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set(auth())
      .send({
        supplierCompanyId,
        poDate: '2026-07-27',
        items: [
          {
            productId,
            orderedQuantity: overrides.quantity ?? '100',
            unitPrice: overrides.unitPrice ?? '850',
          },
        ],
      })
      .expect(201);
    return { order: response.body, supplierCompanyId, productId };
  }

  /** Progresses a fresh draft PO all the way to `sent`, ready to receive against. */
  async function createSentPO(auth: () => Record<string, string>, overrides: Parameters<typeof createDraftPO>[1] = {}) {
    const { order, productId } = await createDraftPO(auth, overrides);
    await request(app.getHttpServer()).post(`/api/v1/purchase-orders/${order.id}/submit`).set(auth()).expect(200);
    await request(app.getHttpServer()).post(`/api/v1/purchase-orders/${order.id}/approve`).set(auth()).expect(200);
    const sent = await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${order.id}/send`)
      .set(auth())
      .expect(200);
    return { order: sent.body, productId };
  }

  describe('Supplier Profile', () => {
    it('returns null before a profile is created, then upserts and returns it', async () => {
      const { auth } = await authedRequest();
      const supplier = await seedSupplier();

      const before = await request(app.getHttpServer())
        .get(`/api/v1/companies/${supplier.id}/supplier-profile`)
        .set(auth())
        .expect(200);
      expect(before.body.data).toBeNull();

      const upserted = await request(app.getHttpServer())
        .patch(`/api/v1/companies/${supplier.id}/supplier-profile`)
        .set(auth())
        .send({ supplierCode: 'SUP-001', paymentTermsDays: 30 })
        .expect(200);
      expect(upserted.body).toMatchObject({ supplierCode: 'SUP-001', paymentTermsDays: 30 });

      const after = await request(app.getHttpServer())
        .get(`/api/v1/companies/${supplier.id}/supplier-profile`)
        .set(auth())
        .expect(200);
      expect(after.body.data).toMatchObject({ supplierCode: 'SUP-001' });
    });

    it('rejects a supplier profile for a company that is not a supplier', async () => {
      const { auth } = await authedRequest();
      const nonSupplier = await testPrisma.company.create({ data: { name: `Customer-${randomUUID()}` } });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/companies/${nonSupplier.id}/supplier-profile`)
        .set(auth())
        .send({ supplierCode: 'X' })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });
  });

  describe('Purchase Orders', () => {
    it('creates a purchase order and calculates authoritative totals', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftPO(auth, { quantity: '100', unitPrice: '850' });

      // 100 * 850 = 85000 subtotal; no discount; 18% tax = 15300; total 100300.
      expect(order).toMatchObject({
        status: 'draft',
        subtotal: '85000',
        discountAmount: '0',
        taxAmount: '15300',
        totalAmount: '100300',
      });
      expect(order.poNumber).toMatch(/^PO\/\d{4}-\d{2}\/\d+$/);
    });

    it('rejects a purchase order referencing a company that is not a supplier', async () => {
      const { auth } = await authedRequest();
      const nonSupplier = await testPrisma.company.create({ data: { name: `Customer-${randomUUID()}` } });
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/purchase-orders')
        .set(auth())
        .send({
          supplierCompanyId: nonSupplier.id,
          poDate: '2026-07-27',
          items: [{ productId: product.id, orderedQuantity: '1', unitPrice: '100' }],
        })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('only allows editing a draft purchase order', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftPO(auth);
      await request(app.getHttpServer()).post(`/api/v1/purchase-orders/${order.id}/submit`).set(auth()).expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/purchase-orders/${order.id}`)
        .set(auth())
        .send({ notes: 'too late' })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('always requires approval, even with no discount', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftPO(auth);

      const submitted = await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/submit`)
        .set(auth())
        .expect(200);
      expect(submitted.body.status).toBe('approval_pending');
    });

    it('approves, sends, and marks a purchase order supplier-confirmed', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftPO(auth);
      await request(app.getHttpServer()).post(`/api/v1/purchase-orders/${order.id}/submit`).set(auth()).expect(200);

      const approved = await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/approve`)
        .set(auth())
        .expect(200);
      expect(approved.body.status).toBe('approved');
      expect(approved.body.approvedAt).not.toBeNull();

      const sent = await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/send`)
        .set(auth())
        .expect(200);
      expect(sent.body.status).toBe('sent');

      const confirmed = await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/supplier-confirm`)
        .set(auth())
        .expect(200);
      expect(confirmed.body.status).toBe('supplier_confirmed');
    });

    it('sends an approval-pending purchase order back to draft on rejection', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftPO(auth);
      await request(app.getHttpServer()).post(`/api/v1/purchase-orders/${order.id}/submit`).set(auth()).expect(200);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/reject-approval`)
        .set(auth())
        .expect(200);
      expect(response.body.status).toBe('draft');
    });

    it('cancels a purchase order with a reason', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftPO(auth);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/cancel`)
        .set(auth())
        .send({ reason: 'Supplier out of stock' })
        .expect(200);
      expect(response.body.status).toBe('cancelled');
    });

    it('denies approval without the purchase_order.approve permission', async () => {
      const admin = await authedRequest();
      const { order } = await createDraftPO(admin.auth);
      await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/submit`)
        .set(admin.auth())
        .expect(200);

      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .post(`/api/v1/purchase-orders/${order.id}/approve`)
        .set(auth())
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('Goods Receipts', () => {
    it('fully receives a PO, credits inventory, and marks it received', async () => {
      const { auth } = await authedRequest();
      const { order, productId } = await createSentPO(auth, { quantity: '100', unitPrice: '850' });
      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });

      const response = await request(app.getHttpServer())
        .post('/api/v1/goods-receipts')
        .set(auth())
        .send({
          purchaseOrderId: order.id,
          warehouseId: warehouse.id,
          receiptDate: '2026-07-28',
          items: [{ purchaseOrderItemId: order.items[0].id, quantityReceived: '100' }],
        })
        .expect(201);

      expect(response.body).toMatchObject({
        purchaseOrderId: order.id,
        warehouse: { id: warehouse.id },
      });
      expect(response.body.receiptNumber).toMatch(/^GRN\/\d{4}-\d{2}\/\d+$/);
      expect(response.body.items[0]).toMatchObject({
        quantityReceived: '100',
        acceptedQuantity: '100',
        rejectedQuantity: '0',
      });

      const balance = await testPrisma.inventoryBalance.findUnique({
        where: { productId_warehouseId: { productId, warehouseId: warehouse.id } },
      });
      expect(balance?.onHandQuantity.toString()).toBe('100');

      const movement = await testPrisma.stockMovement.findFirst({ where: { productId, warehouseId: warehouse.id } });
      expect(movement).toMatchObject({ movementType: 'purchase_receipt', referenceType: 'goods_receipt' });

      const updatedOrder = await request(app.getHttpServer())
        .get(`/api/v1/purchase-orders/${order.id}`)
        .set(auth())
        .expect(200);
      expect(updatedOrder.body.status).toBe('received');
      expect(updatedOrder.body.items[0].receivedQuantity).toBe('100');
    });

    it('partially receives a PO across two receipts, then completes it', async () => {
      const { auth } = await authedRequest();
      const { order } = await createSentPO(auth, { quantity: '100', unitPrice: '850' });
      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });

      await request(app.getHttpServer())
        .post('/api/v1/goods-receipts')
        .set(auth())
        .send({
          purchaseOrderId: order.id,
          warehouseId: warehouse.id,
          receiptDate: '2026-07-28',
          items: [{ purchaseOrderItemId: order.items[0].id, quantityReceived: '40' }],
        })
        .expect(201);

      const afterFirst = await request(app.getHttpServer())
        .get(`/api/v1/purchase-orders/${order.id}`)
        .set(auth())
        .expect(200);
      expect(afterFirst.body.status).toBe('partially_received');

      await request(app.getHttpServer())
        .post('/api/v1/goods-receipts')
        .set(auth())
        .send({
          purchaseOrderId: order.id,
          warehouseId: warehouse.id,
          receiptDate: '2026-07-29',
          items: [{ purchaseOrderItemId: order.items[0].id, quantityReceived: '60' }],
        })
        .expect(201);

      const afterSecond = await request(app.getHttpServer())
        .get(`/api/v1/purchase-orders/${order.id}`)
        .set(auth())
        .expect(200);
      expect(afterSecond.body.status).toBe('received');
      expect(afterSecond.body.items[0].receivedQuantity).toBe('100');
    });

    it('excludes rejected quantity from inventory but still counts it as received', async () => {
      const { auth } = await authedRequest();
      const { order, productId } = await createSentPO(auth, { quantity: '100', unitPrice: '850' });
      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });

      const response = await request(app.getHttpServer())
        .post('/api/v1/goods-receipts')
        .set(auth())
        .send({
          purchaseOrderId: order.id,
          warehouseId: warehouse.id,
          receiptDate: '2026-07-28',
          items: [{ purchaseOrderItemId: order.items[0].id, quantityReceived: '100', rejectedQuantity: '10' }],
        })
        .expect(201);
      expect(response.body.items[0]).toMatchObject({ acceptedQuantity: '90', rejectedQuantity: '10' });

      const balance = await testPrisma.inventoryBalance.findUnique({
        where: { productId_warehouseId: { productId, warehouseId: warehouse.id } },
      });
      expect(balance?.onHandQuantity.toString()).toBe('90');
    });

    it('rejects an over-receipt beyond the pending quantity', async () => {
      const { auth } = await authedRequest();
      const { order } = await createSentPO(auth, { quantity: '100', unitPrice: '850' });
      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });

      const response = await request(app.getHttpServer())
        .post('/api/v1/goods-receipts')
        .set(auth())
        .send({
          purchaseOrderId: order.id,
          warehouseId: warehouse.id,
          receiptDate: '2026-07-28',
          items: [{ purchaseOrderItemId: order.items[0].id, quantityReceived: '150' }],
        })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('refuses to receive against a purchase order that has not been sent', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftPO(auth);
      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });

      const response = await request(app.getHttpServer())
        .post('/api/v1/goods-receipts')
        .set(auth())
        .send({
          purchaseOrderId: order.id,
          warehouseId: warehouse.id,
          receiptDate: '2026-07-28',
          items: [{ purchaseOrderItemId: order.items[0].id, quantityReceived: '10' }],
        })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('denies goods receipt creation without goods_receipt.create', async () => {
      const admin = await authedRequest();
      const { order } = await createSentPO(admin.auth, { quantity: '100', unitPrice: '850' });
      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });

      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .post('/api/v1/goods-receipts')
        .set(auth())
        .send({
          purchaseOrderId: order.id,
          warehouseId: warehouse.id,
          receiptDate: '2026-07-28',
          items: [{ purchaseOrderItemId: order.items[0].id, quantityReceived: '10' }],
        })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
