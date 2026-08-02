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
 * Sales (Module 4 - SALES.md section 106, DATABASE.md sections 55-59,
 * API.md sections 62-68) against a real Postgres database. Scope for this
 * pass: Quotations (creation, calculations, the draft/approval/send/accept/
 * reject workflow) and Sales Orders (creation, confirmation with a
 * non-blocking stock check, cancellation, completion). Every test gets its
 * own application instance, matching the auth/CRM/Product/Inventory suites'
 * pattern.
 */
describe('Sales (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "communications", "sales_order_items", "sales_orders", "quotation_items", ' +
        '"quotations", "document_sequences", "stock_movements", "inventory_balances", "warehouses", ' +
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

  async function seedCompany(options: { phone?: string; email?: string } = {}) {
    return testPrisma.company.create({
      data: { name: `Customer-${randomUUID()}`, isCustomer: true, phone: options.phone, email: options.email },
    });
  }

  async function seedProduct(options: { taxRate?: string; sellingPriceReference?: string } = {}) {
    const category = await testPrisma.productCategory.create({ data: { name: `Category-${randomUUID()}` } });
    const unit = await testPrisma.unit.findFirstOrThrow();
    return testPrisma.product.create({
      data: {
        sku: `SKU-${randomUUID()}`,
        name: `Product ${randomUUID()}`,
        categoryId: category.id,
        unitId: unit.id,
        taxRate: options.taxRate ?? '18',
        sellingPriceReference: options.sellingPriceReference,
      },
    });
  }

  async function createDraftQuotation(
    auth: () => Record<string, string>,
    overrides: { companyId?: string; discountPercentage?: string } = {},
  ) {
    const companyId = overrides.companyId ?? (await seedCompany()).id;
    const product = await seedProduct();

    const response = await request(app.getHttpServer())
      .post('/api/v1/quotations')
      .set(auth())
      .send({
        customerCompanyId: companyId,
        quotationDate: '2026-07-27',
        items: [
          {
            productId: product.id,
            quantity: '10',
            unitPrice: '2500.00',
            discountPercentage: overrides.discountPercentage ?? '5.00',
          },
        ],
      })
      .expect(201);
    return { quotation: response.body, companyId, product };
  }

  describe('Quotations', () => {
    it('creates a quotation and calculates authoritative totals', async () => {
      const { auth } = await authedRequest();
      const { quotation } = await createDraftQuotation(auth);

      expect(quotation).toMatchObject({
        status: 'draft',
        subtotal: '25000',
        discountAmount: '1250',
        taxAmount: '4275',
        totalAmount: '28025',
      });
      expect(quotation.quotationNumber).toMatch(/^QT\/\d{4}-\d{2}\/\d+$/);
      expect(quotation.items).toHaveLength(1);
      expect(quotation.items[0]).toMatchObject({ lineTotal: '28025' });
    });

    it('rejects a quotation referencing a nonexistent company', async () => {
      const { auth } = await authedRequest();
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: randomUUID(),
          quotationDate: '2026-07-27',
          items: [{ productId: product.id, quantity: '1', unitPrice: '100' }],
        })
        .expect(404);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('only allows editing a draft quotation', async () => {
      const { auth } = await authedRequest();
      const { quotation } = await createDraftQuotation(auth, { discountPercentage: '0' });

      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/submit`).set(auth()).expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/quotations/${quotation.id}`)
        .set(auth())
        .send({ notes: 'too late' })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('skips approval when there is no discount, and requires it when there is one', async () => {
      const { auth } = await authedRequest();

      const { quotation: noDiscount } = await createDraftQuotation(auth, { discountPercentage: '0' });
      const submittedNoDiscount = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${noDiscount.id}/submit`)
        .set(auth())
        .expect(200);
      expect(submittedNoDiscount.body.status).toBe('approved');

      const { quotation: withDiscount } = await createDraftQuotation(auth, { discountPercentage: '10' });
      const submittedWithDiscount = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${withDiscount.id}/submit`)
        .set(auth())
        .expect(200);
      expect(submittedWithDiscount.body.status).toBe('approval_pending');
    });

    it('approves, sends, and accepts a discounted quotation', async () => {
      const { auth } = await authedRequest();
      const { quotation } = await createDraftQuotation(auth, { discountPercentage: '10' });
      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/submit`).set(auth()).expect(200);

      const approved = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/approve`)
        .set(auth())
        .expect(200);
      expect(approved.body.status).toBe('approved');

      const sent = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/send`)
        .set(auth())
        .expect(200);
      expect(sent.body.status).toBe('sent');

      const accepted = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/accept`)
        .set(auth())
        .expect(200);
      expect(accepted.body.status).toBe('accepted');
    });

    it('sends an approval-pending quotation back to draft on rejection', async () => {
      const { auth } = await authedRequest();
      const { quotation } = await createDraftQuotation(auth, { discountPercentage: '10' });
      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/submit`).set(auth()).expect(200);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/reject-approval`)
        .set(auth())
        .expect(200);
      expect(response.body.status).toBe('draft');
    });

    it('cancels a quotation with a reason, and refuses to cancel a terminal one', async () => {
      const { auth } = await authedRequest();
      const { quotation } = await createDraftQuotation(auth, { discountPercentage: '0' });

      const cancelled = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/cancel`)
        .set(auth())
        .send({ reason: 'Customer went quiet' })
        .expect(200);
      expect(cancelled.body.status).toBe('cancelled');

      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/cancel`)
        .set(auth())
        .send({ reason: 'again' })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('converts an accepted quotation into a sales order, and refuses a second conversion', async () => {
      const { auth } = await authedRequest();
      const { quotation } = await createDraftQuotation(auth, { discountPercentage: '0' });
      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/submit`).set(auth()).expect(200);
      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/send`).set(auth()).expect(200);
      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.id}/accept`).set(auth()).expect(200);

      const order = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/convert-to-order`)
        .set(auth())
        .expect(201);
      expect(order.body).toMatchObject({
        quotationId: quotation.id,
        totalAmount: quotation.totalAmount,
        status: 'draft',
      });
      expect(order.body.items).toHaveLength(1);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/convert-to-order`)
        .set(auth())
        .expect(409);
      expect(response.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('refuses to convert a quotation that has not been accepted', async () => {
      const { auth } = await authedRequest();
      const { quotation } = await createDraftQuotation(auth, { discountPercentage: '0' });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/convert-to-order`)
        .set(auth())
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('denies approval without the quotation.approve permission', async () => {
      const admin = await authedRequest();
      const { quotation } = await createDraftQuotation(admin.auth, { discountPercentage: '10' });
      await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/submit`)
        .set(admin.auth())
        .expect(200);

      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/approve`)
        .set(auth())
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  /**
   * MOBILE_PRD.md section 7.6 - a text summary sent through the existing
   * Communications module (Twilio WhatsApp / SendGrid Email), not a PDF.
   * No provider is configured in this test environment, so a successful
   * request still returns `status: 'failed'` with a clear failureReason
   * (Communication (e2e)'s own established pattern) - the assertions here
   * are about the Communication record being created correctly (recipient
   * resolution, relatedEntityType/Id), not about a real send succeeding.
   */
  describe('Share Quotation', () => {
    it('shares via WhatsApp using the customer company phone on file', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany({ phone: '+911234567890', email: 'company@example.com' });
      const { quotation } = await createDraftQuotation(auth, { companyId: company.id });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/share`)
        .set(auth())
        .send({ channel: 'whatsapp' })
        .expect(201);

      expect(response.body).toMatchObject({
        channel: 'whatsapp',
        recipient: '+911234567890',
        relatedEntityType: 'quotation',
        relatedEntityId: quotation.id,
      });
      expect(response.body.messageBody).toContain(quotation.quotationNumber);
    });

    it('prefers the contact phone/email over the company when both are on file', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany({ phone: '+911111111111', email: 'company@example.com' });
      const contact = await testPrisma.contact.create({
        data: {
          firstName: 'Priya',
          lastName: 'Sharma',
          companyId: company.id,
          phone: '+912222222222',
          email: 'contact@example.com',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          contactId: contact.id,
          quotationDate: '2026-07-27',
          items: [{ customProductName: 'Cable Drum', quantity: '1', unitPrice: '100' }],
        })
        .expect(201);

      const shareResponse = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${response.body.id}/share`)
        .set(auth())
        .send({ channel: 'email' })
        .expect(201);

      expect(shareResponse.body.recipient).toBe('contact@example.com');
    });

    it('uses an explicit recipient override instead of the one on file', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany({ phone: '+911234567890' });
      const { quotation } = await createDraftQuotation(auth, { companyId: company.id });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/share`)
        .set(auth())
        .send({ channel: 'whatsapp', recipient: '+919999999999' })
        .expect(201);

      expect(response.body.recipient).toBe('+919999999999');
    });

    it('rejects sharing when no recipient is on file and none is provided', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany();
      const { quotation } = await createDraftQuotation(auth, { companyId: company.id });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/share`)
        .set(auth())
        .send({ channel: 'email' })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('denies sharing without the quotation.send permission', async () => {
      const admin = await authedRequest();
      const company = await seedCompany({ phone: '+911234567890' });
      const { quotation } = await createDraftQuotation(admin.auth, { companyId: company.id });

      const { auth } = await authedRequest('Inventory Manager');
      const response = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.id}/share`)
        .set(auth())
        .send({ channel: 'whatsapp' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  /**
   * An ad-hoc line item has no catalog product (mobile Field Sales Executive
   * scope) - `customProductName` instead of `productId`. It is priced like
   * any other line (Unit Price/Discount), but its tax rate is always 0% since
   * there is no product to read a GST rate from.
   */
  describe('Ad-hoc line items', () => {
    it('creates a quotation with a custom (non-catalog) item and calculates totals at 0% tax', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany();

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          quotationDate: '2026-07-27',
          items: [{ customProductName: 'Custom Widget', quantity: '2', unitPrice: '500', discountPercentage: '10' }],
        })
        .expect(201);

      expect(response.body).toMatchObject({
        subtotal: '1000',
        discountAmount: '100',
        taxAmount: '0',
        totalAmount: '900',
      });
      expect(response.body.items[0]).toMatchObject({
        productId: null,
        sku: null,
        productName: 'Custom Widget',
        unit: null,
        taxRate: '0',
        lineTotal: '900',
      });
    });

    it('rejects an item with neither productId nor customProductName', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany();

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          quotationDate: '2026-07-27',
          items: [{ quantity: '1', unitPrice: '100' }],
        })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects an item with both productId and customProductName', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany();
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          quotationDate: '2026-07-27',
          items: [{ productId: product.id, customProductName: 'Custom Widget', quantity: '1', unitPrice: '100' }],
        })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a custom item with no unitPrice - there is no product to default one from', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany();

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          quotationDate: '2026-07-27',
          items: [{ customProductName: 'Custom Widget', quantity: '1' }],
        })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('carries a custom item through Convert to Order', async () => {
      const { auth } = await authedRequest();
      const company = await seedCompany();

      const quotation = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          quotationDate: '2026-07-27',
          items: [{ customProductName: 'Custom Widget', quantity: '2', unitPrice: '500' }],
        })
        .expect(201);

      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.body.id}/submit`).set(auth()).expect(200);
      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.body.id}/send`).set(auth()).expect(200);
      await request(app.getHttpServer()).post(`/api/v1/quotations/${quotation.body.id}/accept`).set(auth()).expect(200);

      const order = await request(app.getHttpServer())
        .post(`/api/v1/quotations/${quotation.body.id}/convert-to-order`)
        .set(auth())
        .expect(201);
      expect(order.body.items[0]).toMatchObject({
        productId: null,
        productName: 'Custom Widget',
        lineTotal: '1000',
      });
    });
  });

  describe('Sales Orders', () => {
    async function createDraftOrder(auth: () => Record<string, string>) {
      const company = await seedCompany();
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/sales-orders')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          orderDate: '2026-07-27',
          items: [{ productId: product.id, quantity: '5', unitPrice: '1000', discountPercentage: '0' }],
        })
        .expect(201);
      return { order: response.body, company, product };
    }

    it('creates a sales order and calculates authoritative totals', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftOrder(auth);

      expect(order).toMatchObject({ status: 'draft', subtotal: '5000', totalAmount: '5900' });
      expect(order.salesOrderNumber).toMatch(/^SO\/\d{4}-\d{2}\/\d+$/);
    });

    it('only allows editing a draft sales order', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftOrder(auth);
      await request(app.getHttpServer()).post(`/api/v1/sales-orders/${order.id}/confirm`).set(auth()).expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/sales-orders/${order.id}`)
        .set(auth())
        .send({ notes: 'too late' })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('confirms with no stock warnings when stock is sufficient', async () => {
      const { auth } = await authedRequest();
      const { order, product } = await createDraftOrder(auth);

      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });
      await testPrisma.inventoryBalance.create({
        data: { id: randomUUID(), productId: product.id, warehouseId: warehouse.id, onHandQuantity: '50' },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${order.id}/confirm`)
        .set(auth())
        .expect(200);
      expect(response.body.salesOrder.status).toBe('confirmed');
      expect(response.body.stockWarnings).toEqual([]);
    });

    it('confirms with a non-blocking stock warning when stock is insufficient', async () => {
      const { auth } = await authedRequest();
      const { order, product } = await createDraftOrder(auth);
      // No inventory balance seeded at all - available stock is zero, ordered quantity is 5.

      const response = await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${order.id}/confirm`)
        .set(auth())
        .expect(200);
      expect(response.body.salesOrder.status).toBe('confirmed');
      expect(response.body.stockWarnings).toHaveLength(1);
      expect(response.body.stockWarnings[0]).toMatchObject({
        productId: product.id,
        orderedQuantity: '5',
        availableQuantity: '0',
      });
    });

    it('cancels a sales order with a reason', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftOrder(auth);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${order.id}/cancel`)
        .set(auth())
        .send({ reason: 'Customer cancelled' })
        .expect(200);
      expect(response.body.status).toBe('cancelled');
    });

    it('completes a confirmed sales order', async () => {
      const { auth } = await authedRequest();
      const { order } = await createDraftOrder(auth);
      await request(app.getHttpServer()).post(`/api/v1/sales-orders/${order.id}/confirm`).set(auth()).expect(200);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${order.id}/complete`)
        .set(auth())
        .expect(200);
      expect(response.body.status).toBe('fulfilled');
    });

    it('denies sales order creation without sales_order.create', async () => {
      const { auth } = await authedRequest('Inventory Manager');
      const company = await seedCompany();
      const product = await seedProduct();

      const response = await request(app.getHttpServer())
        .post('/api/v1/sales-orders')
        .set(auth())
        .send({
          customerCompanyId: company.id,
          orderDate: '2026-07-27',
          items: [{ productId: product.id, quantity: '1', unitPrice: '100' }],
        })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
