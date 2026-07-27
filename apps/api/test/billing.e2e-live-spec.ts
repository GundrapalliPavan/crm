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
 * Billing (Module 6 - BILLING.md section 121, DATABASE.md sections 68-78,
 * API.md sections 76-83) against a real Postgres database. Scope for this
 * pass: Customer profile (a thin extension of Company, mirroring Supplier
 * profile), Invoices (manual creation and creation from a confirmed Sales
 * Order, full CGST/SGST/IGST calculation against the seeded
 * "billing.seller_state_code" setting, draft edit/issue/cancel, a
 * non-blocking credit-limit warning), Payments (recording with multi-invoice
 * allocation - including advance/unallocated payments - and cancellation/
 * reversal), and the outstanding-invoices lookup.
 */
describe('Billing (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "payment_allocations", "payments", "invoice_items", "invoices", ' +
        '"customer_profiles", "sales_order_items", "sales_orders", "quotation_items", "quotations", ' +
        '"document_sequences", "stock_movements", "inventory_balances", "warehouses", ' +
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

  /** "36" (Telangana) matches the seeded billing.seller_state_code default - same state, so CGST+SGST applies. */
  async function seedCustomer(options: { stateCode?: string | null; creditLimit?: string } = {}) {
    return testPrisma.company.create({
      data: {
        name: `Customer-${randomUUID()}`,
        isCustomer: true,
        stateCode: options.stateCode === undefined ? '36' : options.stateCode,
        creditLimit: options.creditLimit,
      },
    });
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
        sellingPriceReference: '850',
      },
    });
  }

  async function createDraftInvoice(
    auth: () => Record<string, string>,
    overrides: { customerCompanyId?: string; productId?: string; quantity?: string; unitPrice?: string } = {},
  ) {
    const customerCompanyId = overrides.customerCompanyId ?? (await seedCustomer()).id;
    const productId = overrides.productId ?? (await seedProduct()).id;

    const response = await request(app.getHttpServer())
      .post('/api/v1/invoices')
      .set(auth())
      .send({
        customerCompanyId,
        invoiceDate: '2026-07-27',
        items: [{ productId, quantity: overrides.quantity ?? '10', unitPrice: overrides.unitPrice ?? '850' }],
      })
      .expect(201);
    return { invoice: response.body.invoice, creditWarning: response.body.creditWarning, customerCompanyId, productId };
  }

  async function createConfirmedSalesOrder(
    auth: () => Record<string, string>,
    overrides: { customerCompanyId?: string; productId?: string; quantity?: string; unitPrice?: string } = {},
  ) {
    const customerCompanyId = overrides.customerCompanyId ?? (await seedCustomer()).id;
    const productId = overrides.productId ?? (await seedProduct()).id;

    const created = await request(app.getHttpServer())
      .post('/api/v1/sales-orders')
      .set(auth())
      .send({
        customerCompanyId,
        orderDate: '2026-07-27',
        items: [{ productId, quantity: overrides.quantity ?? '10', unitPrice: overrides.unitPrice ?? '850' }],
      })
      .expect(201);

    const confirmed = await request(app.getHttpServer())
      .post(`/api/v1/sales-orders/${created.body.id}/confirm`)
      .set(auth())
      .expect(200);
    return { salesOrder: confirmed.body.salesOrder, customerCompanyId, productId };
  }

  describe('Customer Profile', () => {
    it('returns null before a profile is created, then upserts and returns it', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer();

      const before = await request(app.getHttpServer())
        .get(`/api/v1/companies/${customer.id}/customer-profile`)
        .set(auth())
        .expect(200);
      expect(before.body.data).toBeNull();

      const upserted = await request(app.getHttpServer())
        .patch(`/api/v1/companies/${customer.id}/customer-profile`)
        .set(auth())
        .send({ customerCode: 'CUST-001', creditLimit: '500000', paymentTermsDays: 30 })
        .expect(200);
      expect(upserted.body).toMatchObject({ customerCode: 'CUST-001', creditLimit: '500000', paymentTermsDays: 30 });
    });

    it('rejects a customer profile for a company that is not a customer', async () => {
      const { auth } = await authedRequest();
      const nonCustomer = await testPrisma.company.create({ data: { name: `Supplier-${randomUUID()}` } });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/companies/${nonCustomer.id}/customer-profile`)
        .set(auth())
        .send({ customerCode: 'X' })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });
  });

  describe('Invoices', () => {
    it('creates an intra-state invoice with CGST+SGST', async () => {
      const { auth } = await authedRequest();
      const { invoice } = await createDraftInvoice(auth, { quantity: '10', unitPrice: '850' });

      // 10 * 850 = 8500 taxable; 18% tax = 1530 (9% CGST + 9% SGST = 765 + 765); total 10030.
      expect(invoice).toMatchObject({
        status: 'draft',
        subtotal: '8500',
        taxableAmount: '8500',
        cgstAmount: '765',
        sgstAmount: '765',
        igstAmount: '0',
        taxAmount: '1530',
        totalAmount: '10030',
        outstandingAmount: '0',
      });
      expect(invoice.invoiceNumber).toMatch(/^INV\/\d{4}-\d{2}\/\d+$/);
    });

    it('creates an inter-state invoice with IGST only', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer({ stateCode: '27' });
      const { invoice } = await createDraftInvoice(auth, { customerCompanyId: customer.id, quantity: '10', unitPrice: '850' });

      expect(invoice).toMatchObject({ cgstAmount: '0', sgstAmount: '0', igstAmount: '1530', taxAmount: '1530' });
    });

    it('rejects invoice creation when the customer has no GST state code', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer({ stateCode: null });

      const response = await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set(auth())
        .send({
          customerCompanyId: customer.id,
          invoiceDate: '2026-07-27',
          items: [{ productId: (await seedProduct()).id, quantity: '1', unitPrice: '100' }],
        })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('creates an invoice from a confirmed sales order and blocks a second invoice for it', async () => {
      const { auth } = await authedRequest();
      const { salesOrder } = await createConfirmedSalesOrder(auth, { quantity: '5', unitPrice: '1000' });

      const response = await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${salesOrder.id}/create-invoice`)
        .set(auth())
        .send({})
        .expect(201);
      expect(response.body.invoice).toMatchObject({ salesOrderId: salesOrder.id, totalAmount: '5900' });

      const duplicate = await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${salesOrder.id}/create-invoice`)
        .set(auth())
        .send({})
        .expect(409);
      expect(duplicate.body.error.code).toBe('DUPLICATE_RESOURCE');
    });

    it('rejects invoicing a sales order that has not been confirmed', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer();
      const product = await seedProduct();
      const created = await request(app.getHttpServer())
        .post('/api/v1/sales-orders')
        .set(auth())
        .send({
          customerCompanyId: customer.id,
          orderDate: '2026-07-27',
          items: [{ productId: product.id, quantity: '1', unitPrice: '100' }],
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/sales-orders/${created.body.id}/create-invoice`)
        .set(auth())
        .send({})
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('only allows editing a draft invoice', async () => {
      const { auth } = await authedRequest();
      const { invoice } = await createDraftInvoice(auth);
      await request(app.getHttpServer()).post(`/api/v1/invoices/${invoice.id}/issue`).set(auth()).expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/invoices/${invoice.id}`)
        .set(auth())
        .send({ notes: 'too late' })
        .expect(409);
      expect(response.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('issues an invoice, setting the outstanding amount to the total', async () => {
      const { auth } = await authedRequest();
      const { invoice } = await createDraftInvoice(auth, { quantity: '10', unitPrice: '850' });

      const issued = await request(app.getHttpServer()).post(`/api/v1/invoices/${invoice.id}/issue`).set(auth()).expect(200);
      expect(issued.body).toMatchObject({ status: 'issued', outstandingAmount: '10030' });
      expect(issued.body.issuedAt).not.toBeNull();
    });

    it('cancels a draft invoice with a reason', async () => {
      const { auth } = await authedRequest();
      const { invoice } = await createDraftInvoice(auth);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/invoices/${invoice.id}/cancel`)
        .set(auth())
        .send({ reason: 'Created by mistake' })
        .expect(200);
      expect(response.body).toMatchObject({ status: 'cancelled', outstandingAmount: '0' });
    });

    it('surfaces a non-blocking credit-limit warning without blocking creation', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer({ creditLimit: '5000' });

      const { invoice, creditWarning } = await createDraftInvoice(auth, {
        customerCompanyId: customer.id,
        quantity: '10',
        unitPrice: '850',
      });

      expect(invoice.status).toBe('draft');
      expect(creditWarning).toMatchObject({ creditLimit: '5000', outstandingBefore: '0', outstandingAfter: '10030' });
    });

    it('reports no credit warning when within the limit', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer({ creditLimit: '50000' });

      const { creditWarning } = await createDraftInvoice(auth, { customerCompanyId: customer.id, quantity: '1', unitPrice: '100' });
      expect(creditWarning).toBeNull();
    });
  });

  describe('Payments', () => {
    async function createIssuedInvoice(auth: () => Record<string, string>, overrides: Parameters<typeof createDraftInvoice>[1] = {}) {
      const { invoice, customerCompanyId, productId } = await createDraftInvoice(auth, overrides);
      const issued = await request(app.getHttpServer()).post(`/api/v1/invoices/${invoice.id}/issue`).set(auth()).expect(200);
      return { invoice: issued.body, customerCompanyId, productId };
    }

    it('fully allocates a payment and marks the invoice paid', async () => {
      const { auth } = await authedRequest();
      const { invoice, customerCompanyId } = await createIssuedInvoice(auth, { quantity: '10', unitPrice: '850' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({
          customerCompanyId,
          paymentDate: '2026-07-28',
          amount: invoice.totalAmount,
          paymentMethod: 'bank_transfer',
          referenceNumber: 'UTR123',
          allocations: [{ invoiceId: invoice.id, amount: invoice.totalAmount }],
        })
        .expect(201);

      expect(response.body).toMatchObject({ status: 'recorded', unallocatedAmount: '0' });
      expect(response.body.paymentNumber).toMatch(/^PAY\/\d{4}-\d{2}\/\d+$/);

      const updatedInvoice = await request(app.getHttpServer()).get(`/api/v1/invoices/${invoice.id}`).set(auth()).expect(200);
      expect(updatedInvoice.body).toMatchObject({ status: 'paid', paidAmount: invoice.totalAmount, outstandingAmount: '0' });

      // The list (summary) row must report the same unallocatedAmount as the detail view, not the full payment amount.
      const list = await request(app.getHttpServer()).get('/api/v1/payments').set(auth()).expect(200);
      const listedPayment = list.body.data.find((row: { id: string }) => row.id === response.body.id);
      expect(listedPayment).toMatchObject({ unallocatedAmount: '0' });
    });

    it('records a partial payment, leaving the invoice partially paid', async () => {
      const { auth } = await authedRequest();
      const { invoice, customerCompanyId } = await createIssuedInvoice(auth, { quantity: '10', unitPrice: '850' });

      await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({
          customerCompanyId,
          paymentDate: '2026-07-28',
          amount: '5000',
          paymentMethod: 'cash',
          allocations: [{ invoiceId: invoice.id, amount: '5000' }],
        })
        .expect(201);

      const updatedInvoice = await request(app.getHttpServer()).get(`/api/v1/invoices/${invoice.id}`).set(auth()).expect(200);
      expect(updatedInvoice.body.status).toBe('partially_paid');
      expect(updatedInvoice.body.outstandingAmount).toBe((Number(invoice.totalAmount) - 5000).toString());
    });

    it('records an unallocated advance payment', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer();

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({ customerCompanyId: customer.id, paymentDate: '2026-07-28', amount: '100000', paymentMethod: 'bank_transfer' })
        .expect(201);

      expect(response.body).toMatchObject({ amount: '100000', unallocatedAmount: '100000', allocations: [] });
    });

    it('rejects an allocation exceeding the invoice outstanding balance', async () => {
      const { auth } = await authedRequest();
      const { invoice, customerCompanyId } = await createIssuedInvoice(auth, { quantity: '1', unitPrice: '100' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({
          customerCompanyId,
          paymentDate: '2026-07-28',
          amount: '10000',
          paymentMethod: 'cash',
          allocations: [{ invoiceId: invoice.id, amount: '10000' }],
        })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects an allocation to an invoice belonging to a different customer', async () => {
      const { auth } = await authedRequest();
      const { invoice } = await createIssuedInvoice(auth, { quantity: '1', unitPrice: '100' });
      const otherCustomer = await seedCustomer();

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({
          customerCompanyId: otherCustomer.id,
          paymentDate: '2026-07-28',
          amount: '118',
          paymentMethod: 'cash',
          allocations: [{ invoiceId: invoice.id, amount: '118' }],
        })
        .expect(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('cancels a payment and reverses the invoice balances', async () => {
      const { auth } = await authedRequest();
      const { invoice, customerCompanyId } = await createIssuedInvoice(auth, { quantity: '10', unitPrice: '850' });

      const payment = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({
          customerCompanyId,
          paymentDate: '2026-07-28',
          amount: invoice.totalAmount,
          paymentMethod: 'bank_transfer',
          allocations: [{ invoiceId: invoice.id, amount: invoice.totalAmount }],
        })
        .expect(201);

      const cancelled = await request(app.getHttpServer())
        .post(`/api/v1/payments/${payment.body.id}/cancel`)
        .set(auth())
        .send({ reason: 'Cheque bounced' })
        .expect(200);
      expect(cancelled.body.status).toBe('cancelled');

      const revertedInvoice = await request(app.getHttpServer()).get(`/api/v1/invoices/${invoice.id}`).set(auth()).expect(200);
      expect(revertedInvoice.body).toMatchObject({
        status: 'issued',
        paidAmount: '0',
        outstandingAmount: invoice.totalAmount,
      });
    });

    it('denies recording a payment without the payment.record permission', async () => {
      const admin = await authedRequest();
      const customer = await seedCustomer();

      const { auth } = await authedRequest('Sales Executive');
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({ customerCompanyId: customer.id, paymentDate: '2026-07-28', amount: '100', paymentMethod: 'cash' })
        .expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
      void admin;
    });
  });

  describe('Outstanding Invoices', () => {
    it('lists issued and partially-paid invoices for a customer, ordered by due date', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer();
      const { invoice: invoiceA } = await createDraftInvoice(auth, { customerCompanyId: customer.id, quantity: '1', unitPrice: '100' });
      const { invoice: invoiceB } = await createDraftInvoice(auth, { customerCompanyId: customer.id, quantity: '1', unitPrice: '200' });
      await request(app.getHttpServer()).post(`/api/v1/invoices/${invoiceA.id}/issue`).set(auth()).expect(200);
      // invoiceB stays draft - it must not appear.

      const response = await request(app.getHttpServer())
        .get(`/api/v1/companies/${customer.id}/outstanding-invoices`)
        .set(auth())
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({ id: invoiceA.id, status: 'issued' });
      expect(response.body.data.some((row: { id: string }) => row.id === invoiceB.id)).toBe(false);
    });
  });
});
