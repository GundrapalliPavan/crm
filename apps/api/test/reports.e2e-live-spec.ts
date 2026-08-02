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
 * Reports & Analytics (Module 7 - REPORTS.md section 148, technical/API.md
 * sections 106-111) against a real Postgres database. Scope for this pass:
 * a permission-gated `GET /dashboard`, and one dedicated report per domain
 * (leads, sales, inventory, purchases, billing, outstanding) with CSV
 * export - all pure read/aggregate queries over existing tables, no new
 * schema. Team Performance is deferred (Team/TeamMember are unused - no
 * Team management module exists yet).
 */
describe('Reports (e2e)', () => {
  let app: NestExpressApplication;
  let passwordService: PasswordService;

  beforeEach(async () => {
    await testPrisma.$executeRawUnsafe(
      'TRUNCATE TABLE "audit_logs", "payment_allocations", "payments", "invoice_items", "invoices", ' +
        '"customer_profiles", "goods_receipt_items", "goods_receipts", "purchase_order_items", "purchase_orders", ' +
        '"supplier_profiles", "sales_order_items", "sales_orders", "quotation_items", "quotations", ' +
        '"document_sequences", "stock_movements", "inventory_balances", "warehouses", ' +
        '"lead_activities", "follow_ups", "leads", ' +
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

  /** Creates a fresh role holding exactly the given permission codes, so section/permission gating can be tested precisely. */
  async function userWithOnlyPermissions(codes: string[]) {
    const role = await testPrisma.role.create({
      data: { name: `Scoped-${randomUUID()}`, isSystemRole: false },
    });
    const permissions = await testPrisma.permission.findMany({ where: { code: { in: codes } } });
    await testPrisma.rolePermission.createMany({
      data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
    });
    const user = await createUser();
    await testPrisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    const token = await accessTokenFor(user.email);
    return { auth: () => ({ Authorization: `Bearer ${token}` }) };
  }

  async function seedLead(overrides: { status?: string; assignedTo?: string; sourceName?: string; createdAt?: Date } = {}) {
    let sourceId: string | undefined;
    if (overrides.sourceName) {
      const source = await testPrisma.leadSource.findUniqueOrThrow({ where: { name: overrides.sourceName } });
      sourceId = source.id;
    }
    return testPrisma.lead.create({
      data: {
        firstName: `Lead-${randomUUID().slice(0, 8)}`,
        status: (overrides.status ?? 'new') as never,
        assignedTo: overrides.assignedTo,
        sourceId,
        createdAt: overrides.createdAt ?? new Date(),
      },
    });
  }

  async function seedFollowUp(options: {
    leadId: string;
    assignedTo: string;
    scheduledAt: Date;
    status?: 'pending' | 'completed';
    followUpType?: 'call' | 'meeting' | 'visit' | 'email' | 'whatsapp' | 'other';
    checkInAt?: Date;
    checkOutAt?: Date;
  }) {
    return testPrisma.followUp.create({
      data: {
        leadId: options.leadId,
        assignedTo: options.assignedTo,
        followUpType: options.followUpType ?? 'call',
        scheduledAt: options.scheduledAt,
        status: options.status ?? 'pending',
        checkInAt: options.checkInAt,
        checkOutAt: options.checkOutAt,
      },
    });
  }

  async function seedCustomer(options: { stateCode?: string | null } = {}) {
    return testPrisma.company.create({
      data: { name: `Customer-${randomUUID()}`, isCustomer: true, stateCode: options.stateCode ?? '36' },
    });
  }

  async function seedProduct(options: { taxRate?: string; minimumStockLevel?: string } = {}) {
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
        minimumStockLevel: options.minimumStockLevel,
      },
    });
  }

  describe('Dashboard', () => {
    it('returns every section for an actor holding every domain read permission', async () => {
      const { auth } = await authedRequest();
      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);

      expect(response.body).toHaveProperty('followUps');
      expect(response.body).toHaveProperty('visits');
      expect(response.body).toHaveProperty('recentActivity');
      expect(response.body).toHaveProperty('leads');
      expect(response.body).toHaveProperty('sales');
      expect(response.body).toHaveProperty('purchase');
      expect(response.body).toHaveProperty('inventory');
      expect(response.body).toHaveProperty('billing');
    });

    it('omits followUps and visits for an actor without follow_up.read', async () => {
      const { auth } = await userWithOnlyPermissions(['lead.read']);
      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);
      expect(response.body).not.toHaveProperty('followUps');
      expect(response.body).not.toHaveProperty('visits');
    });

    it('omits recentActivity for an actor with none of lead.read/follow_up.read/quotation.read', async () => {
      const { auth } = await userWithOnlyPermissions(['inventory.read']);
      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);
      expect(response.body).not.toHaveProperty('recentActivity');
    });

    it('lists only today\'s visits assigned to the actor, excluding other follow-up types and other users\'', async () => {
      const { auth, user } = await authedRequest();
      const lead = await seedLead({ assignedTo: user.id });
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      const todaysVisit = await seedFollowUp({
        leadId: lead.id,
        assignedTo: user.id,
        scheduledAt: new Date(),
        followUpType: 'visit',
      });
      await seedFollowUp({ leadId: lead.id, assignedTo: user.id, scheduledAt: new Date(), followUpType: 'call' }); // not a visit
      await seedFollowUp({ leadId: lead.id, assignedTo: user.id, scheduledAt: yesterday, followUpType: 'visit' }); // not today
      const otherUser = await createUser();
      await seedFollowUp({ leadId: lead.id, assignedTo: otherUser.id, scheduledAt: new Date(), followUpType: 'visit' }); // someone else's

      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);

      expect(response.body.visits.items).toHaveLength(1);
      expect(response.body.visits.items[0]).toMatchObject({ id: todaysVisit.id, entityLabel: lead.firstName, checkInAt: null, checkOutAt: null });
    });

    it('assembles recentActivity from my recently-updated leads, completed visits, and created quotations, newest first', async () => {
      const { auth, user } = await authedRequest();
      const lead = await seedLead({ assignedTo: user.id });
      const completedVisit = await seedFollowUp({
        leadId: lead.id,
        assignedTo: user.id,
        scheduledAt: new Date(),
        followUpType: 'visit',
        checkInAt: new Date(),
        checkOutAt: new Date(),
      });
      const inProgressVisit = await seedFollowUp({
        leadId: lead.id,
        assignedTo: user.id,
        scheduledAt: new Date(),
        followUpType: 'visit',
        checkInAt: new Date(),
      }); // not checked out - excluded

      const customer = await seedCustomer();
      const product = await seedProduct();
      const quotationResponse = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set(auth())
        .send({
          customerCompanyId: customer.id,
          quotationDate: new Date().toISOString().slice(0, 10),
          items: [{ productId: product.id, quantity: '1', unitPrice: '100' }],
        })
        .expect(201);

      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);

      const entityIds = response.body.recentActivity.items.map((item: { entityId: string }) => item.entityId);
      expect(entityIds).toContain(lead.id);
      expect(entityIds).toContain(completedVisit.id);
      expect(entityIds).toContain(quotationResponse.body.id);
      expect(entityIds).not.toContain(inProgressVisit.id);

      const occurredAtValues = response.body.recentActivity.items.map((item: { occurredAt: string }) => item.occurredAt);
      expect([...occurredAtValues].sort().reverse()).toEqual(occurredAtValues);
    });

    it('counts only the actor\'s own pending follow-ups, split into due-today and overdue', async () => {
      const { auth, user } = await authedRequest();
      const lead = await seedLead({ assignedTo: user.id });
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      await seedFollowUp({ leadId: lead.id, assignedTo: user.id, scheduledAt: new Date() }); // due today
      await seedFollowUp({ leadId: lead.id, assignedTo: user.id, scheduledAt: yesterday }); // overdue
      await seedFollowUp({ leadId: lead.id, assignedTo: user.id, scheduledAt: tomorrow }); // not yet due
      await seedFollowUp({ leadId: lead.id, assignedTo: user.id, scheduledAt: yesterday, status: 'completed' }); // done, excluded
      const otherUser = await createUser();
      await seedFollowUp({ leadId: lead.id, assignedTo: otherUser.id, scheduledAt: new Date() }); // someone else's

      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);

      expect(response.body.followUps).toMatchObject({ dueToday: 1, overdue: 1 });
      expect(response.body.followUps.items).toHaveLength(2);
      expect(response.body.followUps.items[0].isOverdue).toBe(true);
      expect(response.body.followUps.items[0].entityLabel).toBe(lead.firstName);
    });

    it('returns only the leads section for an actor holding only lead.read', async () => {
      const { auth } = await userWithOnlyPermissions(['lead.read']);
      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);

      expect(response.body).toHaveProperty('leads');
      expect(response.body).not.toHaveProperty('sales');
      expect(response.body).not.toHaveProperty('purchase');
      expect(response.body).not.toHaveProperty('inventory');
      expect(response.body).not.toHaveProperty('billing');
    });

    it('counts only the actor\'s own open leads in myOpen', async () => {
      const { auth, user } = await authedRequest();
      await seedLead({ status: 'new', assignedTo: user.id });
      await seedLead({ status: 'qualified' }); // unassigned - not "mine"
      await seedLead({ status: 'converted', assignedTo: user.id }); // not open

      const response = await request(app.getHttpServer()).get('/api/v1/dashboard').set(auth()).expect(200);
      expect(response.body.leads).toMatchObject({ totalOpen: 2, myOpen: 1 });
    });
  });

  describe('Leads Report', () => {
    it('computes the funnel, source breakdown and conversion rate', async () => {
      const { auth } = await authedRequest();
      await seedLead({ status: 'new', sourceName: 'Website' });
      await seedLead({ status: 'converted', sourceName: 'Website' });
      await seedLead({ status: 'qualified', sourceName: 'Referral' });

      const response = await request(app.getHttpServer()).get('/api/v1/reports/leads').set(auth()).expect(200);

      expect(response.body).toMatchObject({ totalLeads: 3, convertedLeads: 1, conversionRate: '33.33' });
      const websiteRow = response.body.bySource.find((row: { sourceName: string }) => row.sourceName === 'Website');
      expect(websiteRow).toMatchObject({ totalLeads: 2, convertedLeads: 1, conversionRate: '50' });
      const newStage = response.body.funnel.find((row: { status: string }) => row.status === 'new');
      expect(newStage.count).toBe(1);
    });

    it('excludes leads outside the requested date range', async () => {
      const { auth } = await authedRequest();
      const oldDate = new Date();
      oldDate.setUTCFullYear(oldDate.getUTCFullYear() - 1);
      await seedLead({ createdAt: oldDate });
      await seedLead();

      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/leads')
        .query({ dateFrom: new Date().toISOString().slice(0, 10) })
        .set(auth())
        .expect(200);
      expect(response.body.totalLeads).toBe(1);
    });

    it('exports a CSV', async () => {
      const { auth } = await authedRequest();
      await seedLead({ sourceName: 'Website' });

      const response = await request(app.getHttpServer()).get('/api/v1/reports/leads/export').set(auth()).expect(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('Source');
      expect(response.text).toContain('Website');
    });

    it('denies access without report.view', async () => {
      const { auth } = await userWithOnlyPermissions(['lead.read']);
      const response = await request(app.getHttpServer()).get('/api/v1/reports/leads').set(auth()).expect(403);
      expect(response.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('Sales Report', () => {
    async function createConfirmedSalesOrder(auth: () => Record<string, string>, quantity: string, unitPrice: string) {
      const customer = await seedCustomer();
      const product = await seedProduct();
      const created = await request(app.getHttpServer())
        .post('/api/v1/sales-orders')
        .set(auth())
        .send({ customerCompanyId: customer.id, orderDate: new Date().toISOString().slice(0, 10), items: [{ productId: product.id, quantity, unitPrice }] })
        .expect(201);
      await request(app.getHttpServer()).post(`/api/v1/sales-orders/${created.body.id}/confirm`).set(auth()).expect(200);
      return { customer, product };
    }

    it('summarizes sales order value and lists top products/customers', async () => {
      const { auth } = await authedRequest();
      const { customer, product } = await createConfirmedSalesOrder(auth, '10', '1000');

      const response = await request(app.getHttpServer()).get('/api/v1/reports/sales').set(auth()).expect(200);

      expect(response.body.overview).toMatchObject({ salesOrderCount: 1, salesOrderValue: '11800' });
      expect(response.body.topProducts[0]).toMatchObject({ productId: product.id, quantity: '10' });
      expect(response.body.topCustomers[0]).toMatchObject({ companyId: customer.id, orderCount: 1 });
    });
  });

  describe('Inventory Report', () => {
    it('reports stock by warehouse and flags low stock', async () => {
      const { auth } = await authedRequest();
      const warehouse = await testPrisma.warehouse.create({ data: { code: `W-${randomUUID().slice(0, 8)}`, name: 'Main' } });
      const product = await seedProduct({ minimumStockLevel: '10' });
      await testPrisma.inventoryBalance.create({
        data: { productId: product.id, warehouseId: warehouse.id, onHandQuantity: '5', reservedQuantity: '0' },
      });

      const response = await request(app.getHttpServer()).get('/api/v1/reports/inventory').set(auth()).expect(200);

      const warehouseRow = response.body.byWarehouse.find((row: { warehouseId: string }) => row.warehouseId === warehouse.id);
      expect(warehouseRow).toMatchObject({ onHandQuantity: '5', availableQuantity: '5' });
      expect(response.body.lowStock).toHaveLength(1);
      expect(response.body.lowStock[0]).toMatchObject({ productId: product.id, availableQuantity: '5', minimumStockLevel: '10' });
    });
  });

  describe('Purchase Report', () => {
    it('summarizes purchase order value by status and supplier', async () => {
      const { auth } = await authedRequest();
      const supplier = await testPrisma.company.create({ data: { name: `Supplier-${randomUUID()}`, isSupplier: true } });
      const product = await seedProduct();
      await request(app.getHttpServer())
        .post('/api/v1/purchase-orders')
        .set(auth())
        .send({
          supplierCompanyId: supplier.id,
          poDate: new Date().toISOString().slice(0, 10),
          items: [{ productId: product.id, orderedQuantity: '10', unitPrice: '500' }],
        })
        .expect(201);

      const response = await request(app.getHttpServer()).get('/api/v1/reports/purchases').set(auth()).expect(200);

      expect(response.body.overview.totalOrders).toBe(1);
      expect(response.body.bySupplier[0]).toMatchObject({ supplierCompanyId: supplier.id, orderCount: 1 });
      const draftRow = response.body.overview.byStatus.find((row: { status: string }) => row.status === 'draft');
      expect(draftRow.count).toBe(1);
    });
  });

  describe('Billing Report', () => {
    async function createIssuedInvoice(auth: () => Record<string, string>, quantity: string, unitPrice: string) {
      const customer = await seedCustomer();
      const product = await seedProduct();
      const created = await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set(auth())
        .send({ customerCompanyId: customer.id, invoiceDate: new Date().toISOString().slice(0, 10), items: [{ productId: product.id, quantity, unitPrice }] })
        .expect(201);
      const issued = await request(app.getHttpServer())
        .post(`/api/v1/invoices/${created.body.invoice.id}/issue`)
        .set(auth())
        .expect(200);
      return { invoice: issued.body, customer };
    }

    it('summarizes invoice register and collections', async () => {
      const { auth } = await authedRequest();
      const { invoice, customer } = await createIssuedInvoice(auth, '10', '1000');
      await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set(auth())
        .send({
          customerCompanyId: customer.id,
          paymentDate: new Date().toISOString().slice(0, 10),
          amount: '5000',
          paymentMethod: 'cash',
          allocations: [{ invoiceId: invoice.id, amount: '5000' }],
        })
        .expect(201);

      const response = await request(app.getHttpServer()).get('/api/v1/reports/billing').set(auth()).expect(200);

      expect(response.body.invoiceRegister.totalInvoices).toBe(1);
      const issuedRow = response.body.invoiceRegister.byStatus.find((row: { status: string }) => row.status === 'partially_paid');
      expect(issuedRow.count).toBe(1);
      expect(response.body.collections).toMatchObject({ totalPayments: 1, totalCollected: '5000' });
    });
  });

  describe('Outstanding Report', () => {
    it('buckets outstanding balances by age', async () => {
      const { auth } = await authedRequest();
      const customer = await seedCustomer();
      const product = await seedProduct();

      const created = await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set(auth())
        .send({
          customerCompanyId: customer.id,
          invoiceDate: new Date().toISOString().slice(0, 10),
          dueDate: '2020-01-01', // far in the past - lands in the 90+ bucket
          items: [{ productId: product.id, quantity: '1', unitPrice: '1000' }],
        })
        .expect(201);
      await request(app.getHttpServer()).post(`/api/v1/invoices/${created.body.invoice.id}/issue`).set(auth()).expect(200);

      const response = await request(app.getHttpServer()).get('/api/v1/reports/outstanding').set(auth()).expect(200);

      const row = response.body.byCustomer.find((r: { companyId: string }) => r.companyId === customer.id);
      expect(row.current).toBe('0');
      expect(Number(row.daysOver90)).toBeGreaterThan(0);
      expect(row.totalOutstanding).toBe(row.daysOver90);
    });
  });
});
