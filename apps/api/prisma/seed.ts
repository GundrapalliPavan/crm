/**
 * Foundational reference data (DATABASE.md section 150).
 *
 * Only static reference data belongs here - permissions, system roles, units
 * and lead sources. No customers, leads, orders or invoices: business data must
 * never be seeded into an environment as though it were real
 * (DATABASE.md section 150, PROJECT_SETUP.md section 48).
 *
 * Every write is an upsert keyed on a stable natural key, so running the seed
 * repeatedly converges rather than duplicating.
 */
import { PrismaClient } from '@prisma/client';

/**
 * Permission catalogue. Codes are the stable contract application code checks
 * against and must not be renamed casually (DATABASE.md section 20).
 */
const PERMISSIONS: ReadonlyArray<{ code: string; name: string; module: string }> = [
  // CRM
  { code: 'lead.read', name: 'View leads', module: 'crm' },
  { code: 'lead.create', name: 'Create leads', module: 'crm' },
  { code: 'lead.update', name: 'Update leads', module: 'crm' },
  { code: 'lead.delete', name: 'Delete leads', module: 'crm' },
  { code: 'lead.assign', name: 'Assign leads', module: 'crm' },
  { code: 'lead.convert', name: 'Convert leads', module: 'crm' },
  { code: 'contact.read', name: 'View contacts', module: 'crm' },
  { code: 'contact.create', name: 'Create contacts', module: 'crm' },
  { code: 'contact.update', name: 'Update contacts', module: 'crm' },
  { code: 'contact.delete', name: 'Delete contacts', module: 'crm' },
  { code: 'company.read', name: 'View companies', module: 'crm' },
  { code: 'company.create', name: 'Create companies', module: 'crm' },
  { code: 'company.update', name: 'Update companies', module: 'crm' },
  { code: 'company.delete', name: 'Delete companies', module: 'crm' },
  { code: 'follow_up.read', name: 'View follow-ups', module: 'crm' },
  { code: 'follow_up.create', name: 'Create follow-ups', module: 'crm' },
  { code: 'follow_up.update', name: 'Update follow-ups', module: 'crm' },
  { code: 'follow_up.complete', name: 'Complete follow-ups', module: 'crm' },

  // Catalogue
  { code: 'product.read', name: 'View products', module: 'catalog' },
  { code: 'product.create', name: 'Create products', module: 'catalog' },
  { code: 'product.update', name: 'Update products', module: 'catalog' },
  { code: 'product.delete', name: 'Delete products', module: 'catalog' },

  // Inventory
  { code: 'inventory.read', name: 'View inventory', module: 'inventory' },
  { code: 'inventory.adjust', name: 'Adjust stock', module: 'inventory' },
  { code: 'inventory.transfer', name: 'Transfer stock', module: 'inventory' },
  { code: 'warehouse.read', name: 'View warehouses', module: 'inventory' },
  { code: 'warehouse.manage', name: 'Manage warehouses', module: 'inventory' },

  // Sales
  { code: 'quotation.read', name: 'View quotations', module: 'sales' },
  { code: 'quotation.create', name: 'Create quotations', module: 'sales' },
  { code: 'quotation.update', name: 'Update quotations', module: 'sales' },
  { code: 'quotation.approve', name: 'Approve quotations', module: 'sales' },
  { code: 'quotation.send', name: 'Send quotations', module: 'sales' },
  { code: 'sales_order.read', name: 'View sales orders', module: 'sales' },
  { code: 'sales_order.create', name: 'Create sales orders', module: 'sales' },
  { code: 'sales_order.update', name: 'Update sales orders', module: 'sales' },
  { code: 'sales_order.confirm', name: 'Confirm sales orders', module: 'sales' },
  { code: 'sales_order.cancel', name: 'Cancel sales orders', module: 'sales' },

  // Purchase
  { code: 'purchase_order.read', name: 'View purchase orders', module: 'purchase' },
  { code: 'purchase_order.create', name: 'Create purchase orders', module: 'purchase' },
  { code: 'purchase_order.update', name: 'Update purchase orders', module: 'purchase' },
  { code: 'purchase_order.approve', name: 'Approve purchase orders', module: 'purchase' },
  { code: 'purchase_order.send', name: 'Send purchase orders', module: 'purchase' },
  { code: 'goods_receipt.read', name: 'View goods receipts', module: 'purchase' },
  { code: 'goods_receipt.create', name: 'Record goods receipts', module: 'purchase' },

  // Billing
  { code: 'invoice.read', name: 'View invoices', module: 'billing' },
  { code: 'invoice.create', name: 'Create invoices', module: 'billing' },
  { code: 'invoice.update', name: 'Update draft invoices', module: 'billing' },
  { code: 'invoice.issue', name: 'Issue invoices', module: 'billing' },
  { code: 'invoice.cancel', name: 'Cancel invoices', module: 'billing' },
  { code: 'payment.read', name: 'View payments', module: 'billing' },
  { code: 'payment.record', name: 'Record payments', module: 'billing' },
  { code: 'payment.allocate', name: 'Allocate payments to invoices', module: 'billing' },

  // Communication
  { code: 'communication.read', name: 'View communication history', module: 'communication' },
  { code: 'communication.send', name: 'Send communications', module: 'communication' },
  { code: 'communication_template.manage', name: 'Manage templates', module: 'communication' },

  // Reporting
  { code: 'report.view', name: 'View reports', module: 'reports' },
  { code: 'report.export', name: 'Export reports', module: 'reports' },

  // Administration
  { code: 'user.read', name: 'View users', module: 'admin' },
  { code: 'user.create', name: 'Create users', module: 'admin' },
  { code: 'user.update', name: 'Update users', module: 'admin' },
  { code: 'team.manage', name: 'Manage teams', module: 'admin' },
  { code: 'role.manage', name: 'Manage roles and permissions', module: 'admin' },
  { code: 'settings.manage', name: 'Manage application settings', module: 'admin' },
  { code: 'audit.read', name: 'View audit history', module: 'admin' },
];

/** System roles (DATABASE.md section 19). */
const ROLES: ReadonlyArray<{ name: string; description: string }> = [
  { name: 'Administrator', description: 'Full access to all modules and settings.' },
  { name: 'Sales Manager', description: 'Manages the sales team, pipeline and approvals.' },
  { name: 'Sales Executive', description: 'Works leads, follow-ups, quotations and orders.' },
  { name: 'Inventory Manager', description: 'Manages stock, warehouses and adjustments.' },
  { name: 'Purchase Manager', description: 'Manages suppliers, purchase orders and receipts.' },
  { name: 'Billing User', description: 'Manages invoices, payments and receivables.' },
];

/** DATABASE.md section 41. `decimalAllowed` drives fractional-quantity validation. */
const UNITS: ReadonlyArray<{ name: string; symbol: string; decimalAllowed: boolean }> = [
  { name: 'Piece', symbol: 'pcs', decimalAllowed: false },
  { name: 'Box', symbol: 'box', decimalAllowed: false },
  { name: 'Coil', symbol: 'coil', decimalAllowed: false },
  { name: 'Roll', symbol: 'roll', decimalAllowed: false },
  // Wire and cable are cut to length, so fractional quantities are valid.
  { name: 'Meter', symbol: 'm', decimalAllowed: true },
  { name: 'Kilogram', symbol: 'kg', decimalAllowed: true },
];

/**
 * BILLING.md sections 17-19: tax treatment (CGST+SGST vs IGST) must be
 * derived from configuration, not user guesswork. This is the one piece of
 * "Applicable Jurisdiction" tax configuration the schema doesn't otherwise
 * have a home for - the business's own GST state code. "36" (Telangana) is
 * an example default matching BILLING.md's own numbering example
 * ("INV/HYD/..."); a real deployment should update this row for its actual
 * registered state.
 */
const APPLICATION_SETTINGS: ReadonlyArray<{
  key: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  description: string;
}> = [
  {
    key: 'billing.seller_state_code',
    value: '36',
    dataType: 'string',
    description: 'GST state code of the selling entity, used to determine CGST+SGST vs IGST on invoices.',
  },
];

/** DATABASE.md section 25. */
const LEAD_SOURCES: ReadonlyArray<{ name: string; description: string }> = [
  { name: 'Website', description: 'Enquiry submitted through the website.' },
  { name: 'Referral', description: 'Referred by an existing customer or partner.' },
  { name: 'Walk-in', description: 'Visited the branch or showroom directly.' },
  { name: 'Phone', description: 'Inbound telephone enquiry.' },
  { name: 'WhatsApp', description: 'Enquiry received over WhatsApp.' },
  { name: 'Existing Customer', description: 'Additional opportunity from a current customer.' },
  { name: 'Sales Visit', description: 'Generated by a field sales visit.' },
];

async function seedPermissions(prisma: PrismaClient): Promise<void> {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { name: permission.name, module: permission.module },
      create: permission,
    });
  }
}

async function seedRoles(prisma: PrismaClient): Promise<void> {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, isSystemRole: true },
      create: { ...role, isSystemRole: true },
    });
  }
}

/**
 * Administrator receives every permission, which follows from the role's
 * definition. The remaining role-to-permission matrix is deliberately left
 * empty: it is an authorisation policy decision that belongs to the RBAC step,
 * and no project document defines it yet.
 */
async function grantAdministratorAllPermissions(prisma: PrismaClient): Promise<void> {
  const administrator = await prisma.role.findUniqueOrThrow({
    where: { name: 'Administrator' },
  });
  const permissions = await prisma.permission.findMany({ select: { id: true } });

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: administrator.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });
}

async function seedUnits(prisma: PrismaClient): Promise<void> {
  for (const unit of UNITS) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: { symbol: unit.symbol, decimalAllowed: unit.decimalAllowed },
      create: unit,
    });
  }
}

/**
 * Unlike Units/Lead Sources, this is deployment-specific configuration a
 * real business may reconfigure after go-live - so, like document sequences,
 * this only creates the row once and never overwrites it on a later reseed.
 */
async function seedApplicationSettings(prisma: PrismaClient): Promise<void> {
  for (const setting of APPLICATION_SETTINGS) {
    await prisma.applicationSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
}

async function seedLeadSources(prisma: PrismaClient): Promise<void> {
  for (const source of LEAD_SOURCES) {
    await prisma.leadSource.upsert({
      where: { name: source.name },
      update: { description: source.description },
      create: source,
    });
  }
}

/**
 * Applies all reference data. Exported so integration tests can prove the seed
 * converges when run repeatedly, rather than relying on a manual check.
 */
export async function seedReferenceData(prisma: PrismaClient): Promise<void> {
  // Ordered by dependency: permissions and roles must exist before grants.
  await seedPermissions(prisma);
  await seedRoles(prisma);
  await grantAdministratorAllPermissions(prisma);
  await seedUnits(prisma);
  await seedLeadSources(prisma);
  await seedApplicationSettings(prisma);
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  console.log('Seeding reference data...');
  try {
    await seedReferenceData(prisma);
    console.log(
      `Seeded ${PERMISSIONS.length} permissions, ${ROLES.length} roles, ` +
        `${UNITS.length} units, ${LEAD_SOURCES.length} lead sources, ` +
        `${APPLICATION_SETTINGS.length} application settings.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Only run when invoked directly (pnpm db:seed / prisma migrate reset), so
// importing this module from a test does not trigger a seed.
if (require.main === module) {
  main().catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  });
}
