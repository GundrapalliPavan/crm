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
 * In-App Notifications (platform capability - PROJECT.md section 26,
 * technical/API.md sections 100-101, technical/ARCHITECTURE.md sections
 * 76-80) against a real Postgres database. Scope for this pass: five
 * trigger events that are pure, synchronous reactions to a user action -
 * Lead Assigned, Quotation Approval Required (only when a discount pushes
 * it into approval_pending), Purchase Order Approval Required, Payment
 * Received, and Low Stock (only on the false -> true crossing) - plus the
 * list/unread-count/mark-read/mark-all-read endpoints, personal-scope like
 * `/dashboard` (no `@RequirePermission`).
 */
describe('Notifications (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "notifications", ' +
        '"payment_allocations", "payments", "invoice_items", "invoices", "customer_profiles", ' +
        '"goods_receipt_items", "goods_receipts", "purchase_order_items", "purchase_orders", "supplier_profiles", ' +
        '"sales_order_items", "sales_orders", "quotation_items", "quotations", "document_sequences", ' +
        '"stock_movements", "inventory_balances", "warehouses", ' +
        '"lead_activities", "follow_ups", "leads", ' +
        '"products", "product_categories", "brands", "contacts", "companies", ' +
        '"push_tokens", "password_reset_tokens", "sessions", "user_roles", "role_permissions", "users" ' +
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

  async function notificationsFor(auth: () => Record<string, string>) {
    const response = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set(auth())
      .expect(200);
    return response.body.data as Array<{ id: string; type: string; relatedEntityId: string | null }>;
  }

  describe('Lead Assigned', () => {
    it('notifies the assignee when a lead is created pre-assigned', async () => {
      const { auth } = await authedRequest();
      const assignee = await authedRequest();

      const response = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Priya', leadType: 'other', assignedTo: assignee.user.id })
        .expect(201);

      const notifications = await notificationsFor(assignee.auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({ type: 'lead_assigned', relatedEntityId: response.body.id });
    });

    it('notifies the new assignee on reassignment, not the previous one', async () => {
      const { auth } = await authedRequest();
      const first = await authedRequest();
      const second = await authedRequest();

      const lead = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Rahul', leadType: 'other', assignedTo: first.user.id })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/leads/${lead.body.id}/assign`)
        .set(auth())
        .send({ userId: second.user.id })
        .expect(200);

      expect(await notificationsFor(first.auth)).toHaveLength(1);
      expect(await notificationsFor(second.auth)).toHaveLength(1);
    });
  });

  describe('Quotation Approval Required', () => {
    async function seedCompany() {
      return testPrisma.company.create({ data: { name: `Customer-${randomUUID()}`, isCustomer: true } });
    }

    async function seedProduct() {
      const category = await testPrisma.productCategory.create({ data: { name: `Category-${randomUUID()}` } });
      const unit = await testPrisma.unit.findFirstOrThrow();
      return testPrisma.product.create({
        data: { sku: `SKU-${randomUUID()}`, name: `Product ${randomUUID()}`, categoryId: category.id, unitId: unit.id, taxRate: '18' },
      });
    }

    async function createDraftQuotation(auth: () => Record<string, string>, discountPercentage: string) {
      const company = await seedCompany();
      const product = await seedProduct();
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          quotationDate: '2026-07-27',
          items: [{ productId: product.id, quantity: '10', unitPrice: '2500.00', discountPercentage }],
        })
        .expect(201);
      return response.body;
    }

    it('notifies quotation.approve holders only when a discount pushes it into approval_pending', async () => {
      const { auth } = await authedRequest();

      const noDiscount = await createDraftQuotation(auth, '0');
      await request(app.getHttpServer()).post(`/api/v1/quotations/${noDiscount.id}/submit`).set(auth()).expect(200);
      expect(await notificationsFor(auth)).toHaveLength(0);

      const withDiscount = await createDraftQuotation(auth, '10');
      await request(app.getHttpServer()).post(`/api/v1/quotations/${withDiscount.id}/submit`).set(auth()).expect(200);

      const notifications = await notificationsFor(auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        type: 'quotation_approval_required',
        relatedEntityId: withDiscount.id,
      });
    });
  });

  describe('Purchase Order Approval Required', () => {
    it('notifies purchase_order.approve holders on submit', async () => {
      const { auth } = await authedRequest();
      const supplier = await testPrisma.company.create({ data: { name: `Supplier-${randomUUID()}`, isSupplier: true } });
      const category = await testPrisma.productCategory.create({ data: { name: `Category-${randomUUID()}` } });
      const unit = await testPrisma.unit.findFirstOrThrow();
      const product = await testPrisma.product.create({
        data: { sku: `SKU-${randomUUID()}`, name: `Product ${randomUUID()}`, categoryId: category.id, unitId: unit.id, taxRate: '18' },
      });

      const po = await request(app.getHttpServer())
        .post('/api/v1/purchase-orders')
        .set(auth())
        .send({
          supplierCompanyId: supplier.id,
          poDate: '2026-07-27',
          items: [{ productId: product.id, orderedQuantity: '10', unitPrice: '100' }],
        })
        .expect(201);

      await request(app.getHttpServer()).post(`/api/v1/purchase-orders/${po.body.id}/submit`).set(auth()).expect(200);

      const notifications = await notificationsFor(auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        type: 'purchase_order_approval_required',
        relatedEntityId: po.body.id,
      });
    });
  });

  describe('Payment Received', () => {
    it("notifies the customer company's owner when a payment is recorded", async () => {
      const { auth } = await authedRequest();
      const owner = await authedRequest();
      const company = await testPrisma.company.create({
        data: { name: `Customer-${randomUUID()}`, isCustomer: true, ownerId: owner.user.id },
      });

      const payment = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({ customerCompanyId: company.id, paymentDate: '2026-07-28', amount: '5000', paymentMethod: 'bank_transfer' })
        .expect(201);

      const notifications = await notificationsFor(owner.auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({ type: 'payment_received', relatedEntityId: payment.body.id });
    });

    it('does not notify anyone when the customer company has no owner', async () => {
      const { auth } = await authedRequest();
      const company = await testPrisma.company.create({ data: { name: `Customer-${randomUUID()}`, isCustomer: true } });

      await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({ customerCompanyId: company.id, paymentDate: '2026-07-28', amount: '5000', paymentMethod: 'bank_transfer' })
        .expect(201);

      expect(await notificationsFor(auth)).toHaveLength(0);
    });
  });

  describe('Low Stock', () => {
    async function createWarehouse(auth: () => Record<string, string>) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/warehouses')
        .set(auth())
        .send({ code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' })
        .expect(201);
      return response.body;
    }

    it('notifies inventory.adjust holders only on the false -> true crossing, not on every movement that keeps it low', async () => {
      const { auth } = await authedRequest();
      const warehouse = await createWarehouse(auth);
      const category = await testPrisma.productCategory.create({ data: { name: `Category-${randomUUID()}` } });
      const unit = await testPrisma.unit.findFirstOrThrow();
      const product = await testPrisma.product.create({
        data: {
          sku: `SKU-${randomUUID()}`,
          name: `Product ${randomUUID()}`,
          categoryId: category.id,
          unitId: unit.id,
          minimumStockLevel: '10',
        },
      });

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '20', reason: 'opening_balance_correction' })
        .expect(201);
      expect(await notificationsFor(auth)).toHaveLength(0);

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '-15', reason: 'damage' })
        .expect(201);
      const afterCrossing = await notificationsFor(auth);
      expect(afterCrossing).toHaveLength(1);
      expect(afterCrossing[0]).toMatchObject({ type: 'low_stock', relatedEntityId: product.id });

      await request(app.getHttpServer())
        .post('/api/v1/inventory/adjustments')
        .set(auth())
        .send({ productId: product.id, warehouseId: warehouse.id, quantityDelta: '-1', reason: 'damage' })
        .expect(201);
      expect(await notificationsFor(auth)).toHaveLength(1);
    });
  });

  describe('List, unread count, mark read', () => {
    it('scopes notifications to the current user only', async () => {
      const { auth } = await authedRequest();
      const other = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Lead', leadType: 'other', assignedTo: other.user.id })
        .expect(201);

      expect(await notificationsFor(other.auth)).toHaveLength(1);
      expect(await notificationsFor(auth)).toHaveLength(0);
    });

    it('reports an unread count, marks one read, and marks all read', async () => {
      const { auth } = await authedRequest();
      const assignee = await authedRequest();

      for (let i = 0; i < 2; i += 1) {
        await request(app.getHttpServer())
          .post('/api/v1/leads')
          .set(auth())
          .send({ firstName: `Lead-${i}`, leadType: 'other', assignedTo: assignee.user.id })
          .expect(201);
      }

      const unreadBefore = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set(assignee.auth())
        .expect(200);
      expect(unreadBefore.body.count).toBe(2);

      const [first] = await notificationsFor(assignee.auth);
      const markedRead = await request(app.getHttpServer())
        .post(`/api/v1/notifications/${first.id}/read`)
        .set(assignee.auth())
        .expect(200);
      expect(markedRead.body.isRead).toBe(true);

      const unreadOnly = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query({ status: 'unread' })
        .set(assignee.auth())
        .expect(200);
      expect(unreadOnly.body.data).toHaveLength(1);

      await request(app.getHttpServer()).post('/api/v1/notifications/read-all').set(assignee.auth()).expect(200);

      const unreadAfter = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set(assignee.auth())
        .expect(200);
      expect(unreadAfter.body.count).toBe(0);
    });

    it('rejects marking another user\'s notification as read', async () => {
      const { auth } = await authedRequest();
      const assignee = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set(auth())
        .send({ firstName: 'Lead', leadType: 'other', assignedTo: assignee.user.id })
        .expect(201);

      const [notification] = await notificationsFor(assignee.auth);
      const response = await request(app.getHttpServer())
        .post(`/api/v1/notifications/${notification.id}/read`)
        .set(auth())
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('Push token registration', () => {
    it('registers a token for the current session', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/notifications/push-token')
        .set(auth())
        .send({ expoPushToken: 'not-a-real-token', platform: 'ios' })
        .expect(200);

      const tokens = await testPrisma.pushToken.findMany();
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ expoPushToken: 'not-a-real-token', platform: 'ios' });
    });

    it('upserts by session rather than creating duplicate rows', async () => {
      const { auth } = await authedRequest();

      await request(app.getHttpServer())
        .post('/api/v1/notifications/push-token')
        .set(auth())
        .send({ expoPushToken: 'token-1', platform: 'ios' })
        .expect(200);
      await request(app.getHttpServer())
        .post('/api/v1/notifications/push-token')
        .set(auth())
        .send({ expoPushToken: 'token-2', platform: 'android' })
        .expect(200);

      const tokens = await testPrisma.pushToken.findMany();
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ expoPushToken: 'token-2', platform: 'android' });
    });
  });

  describe('Quotation Decided', () => {
    async function seedCompany() {
      return testPrisma.company.create({ data: { name: `Customer-${randomUUID()}`, isCustomer: true } });
    }

    async function seedProduct() {
      const category = await testPrisma.productCategory.create({ data: { name: `Category-${randomUUID()}` } });
      const unit = await testPrisma.unit.findFirstOrThrow();
      return testPrisma.product.create({
        data: { sku: `SKU-${randomUUID()}`, name: `Product ${randomUUID()}`, categoryId: category.id, unitId: unit.id, taxRate: '18' },
      });
    }

    async function createSentQuotation(auth: () => Record<string, string>) {
      const company = await seedCompany();
      const product = await seedProduct();
      const created = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          quotationDate: '2026-07-27',
          items: [{ productId: product.id, quantity: '10', unitPrice: '2500.00', discountPercentage: '0' }],
        })
        .expect(201);
      await request(app.getHttpServer()).post(`/api/v1/quotations/${created.body.id}/submit`).set(auth()).expect(200);
      await request(app.getHttpServer()).post(`/api/v1/quotations/${created.body.id}/send`).set(auth()).expect(200);
      return created.body;
    }

    it('notifies the quotation owner (the creator) when accepted', async () => {
      const { auth } = await authedRequest();
      const quotation = await createSentQuotation(auth);

      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/accept`).set(auth()).expect(200);

      const notifications = await notificationsFor(auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({ type: 'quotation_decided', relatedEntityId: quotation.id });
    });

    it('notifies the quotation owner when rejected', async () => {
      const { auth } = await authedRequest();
      const quotation = await createSentQuotation(auth);

      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/reject`).set(auth()).expect(200);

      const notifications = await notificationsFor(auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({ type: 'quotation_decided', relatedEntityId: quotation.id });
    });

    it('does not notify anyone when the quotation has no owner', async () => {
      const { auth } = await authedRequest();
      const quotation = await createSentQuotation(auth);
      await testPrisma.quotation.update({ where: { id: quotation.id }, data: { ownerId: null } });

      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/accept`).set(auth()).expect(200);

      expect(await notificationsFor(auth)).toHaveLength(0);
    });
  });

  describe('Sales Order Status Changed', () => {
    async function seedCompany() {
      return testPrisma.company.create({ data: { name: `Customer-${randomUUID()}`, isCustomer: true } });
    }

    async function seedProduct() {
      const category = await testPrisma.productCategory.create({ data: { name: `Category-${randomUUID()}` } });
      const unit = await testPrisma.unit.findFirstOrThrow();
      return testPrisma.product.create({
        data: { sku: `SKU-${randomUUID()}`, name: `Product ${randomUUID()}`, categoryId: category.id, unitId: unit.id, taxRate: '18' },
      });
    }

    async function createSalesOrder(auth: () => Record<string, string>) {
      const company = await seedCompany();
      const product = await seedProduct();
      const created = await request(app.getHttpServer())
        .post('/api/v1/sales-orders')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          orderDate: '2026-07-27',
          items: [{ productId: product.id, quantity: '10', unitPrice: '2500.00' }],
        })
        .expect(201);
      return created.body;
    }

    it('notifies the order owner (the creator) when confirmed', async () => {
      const { auth } = await authedRequest();
      const order = await createSalesOrder(auth);

      await request(app.getHttpServer()).post(`/api/v1/sales-orders/${order.id}/confirm`).set(auth()).expect(200);

      const notifications = await notificationsFor(auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({ type: 'sales_order_status_changed', relatedEntityId: order.id });
    });

    it('notifies the order owner when cancelled', async () => {
      const { auth } = await authedRequest();
      const order = await createSalesOrder(auth);

      await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${order.id}/cancel`)
        .set(auth())
        .send({ reason: 'Customer changed their mind' })
        .expect(200);

      const notifications = await notificationsFor(auth);
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({ type: 'sales_order_status_changed', relatedEntityId: order.id });
    });

    it('does not notify anyone when the order has no owner', async () => {
      const { auth } = await authedRequest();
      const order = await createSalesOrder(auth);
      await testPrisma.salesOrder.update({ where: { id: order.id }, data: { ownerId: null } });

      await request(app.getHttpServer()).post(`/api/v1/sales-orders/${order.id}/confirm`).set(auth()).expect(200);

      expect(await notificationsFor(auth)).toHaveLength(0);
    });
  });
});
