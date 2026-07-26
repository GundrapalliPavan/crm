import { PrismaClient } from '@prisma/client';

/**
 * Client bound explicitly to the test database, so a stray DATABASE_URL in the
 * environment can never point these destructive tests at development data.
 */
export const testPrisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } },
});

/** Every table the suite writes to, ordered so TRUNCATE ... CASCADE is total. */
const TABLES = [
  'payment_allocations',
  'payments',
  'invoice_items',
  'invoices',
  'goods_receipt_items',
  'goods_receipts',
  'purchase_order_items',
  'purchase_orders',
  'sales_order_items',
  'sales_orders',
  'quotation_items',
  'quotations',
  'stock_movements',
  'inventory_balances',
  'warehouses',
  'products',
  'brands',
  'product_categories',
  'units',
  'file_links',
  'files',
  'communication_events',
  'communications',
  'communication_templates',
  'notifications',
  'audit_logs',
  'document_sequences',
  'application_settings',
  'lead_activities',
  'follow_ups',
  'leads',
  'lead_sources',
  'addresses',
  'contacts',
  'customer_profiles',
  'supplier_profiles',
  'companies',
  'team_members',
  'teams',
  'user_roles',
  'role_permissions',
  'permissions',
  'roles',
  'users',
];

/** Restores an empty database so each test starts from a known state. */
export async function resetDatabase(): Promise<void> {
  await testPrisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((table) => `"${table}"`).join(', ')} RESTART IDENTITY CASCADE;`,
  );
}

/** Minimal catalogue prerequisites for creating a product. */
export async function createProduct(sku: string, name = 'Test Product') {
  const category = await testPrisma.productCategory.create({ data: { name: `Cat ${sku}` } });
  const unit = await testPrisma.unit.create({
    data: { name: `Unit ${sku}`, symbol: `u${sku}`.slice(0, 20), decimalAllowed: true },
  });

  return testPrisma.product.create({
    data: { sku, name, categoryId: category.id, unitId: unit.id },
  });
}

export async function createCustomer(name = 'Test Customer') {
  return testPrisma.company.create({ data: { name, isCustomer: true } });
}

export async function createUser(email: string) {
  return testPrisma.user.create({
    data: { firstName: 'Test', lastName: 'User', email },
  });
}
