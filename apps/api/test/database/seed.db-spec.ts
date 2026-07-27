import { seedReferenceData } from '../../prisma/seed';
import { resetDatabase, testPrisma } from './helpers';

/**
 * The seed must converge, not accumulate: it runs on every fresh environment
 * and after `prisma migrate reset` (DATABASE.md section 150, Step 3 seed
 * idempotency requirement).
 */
describe('reference data seed', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function countReferenceData() {
    const [permissions, roles, rolePermissions, units, leadSources, applicationSettings] = await Promise.all([
      testPrisma.permission.count(),
      testPrisma.role.count(),
      testPrisma.rolePermission.count(),
      testPrisma.unit.count(),
      testPrisma.leadSource.count(),
      testPrisma.applicationSetting.count(),
    ]);

    return { permissions, roles, rolePermissions, units, leadSources, applicationSettings };
  }

  it('creates reference data on a fresh database', async () => {
    await seedReferenceData(testPrisma);

    const counts = await countReferenceData();

    expect(counts.permissions).toBeGreaterThan(0);
    expect(counts.roles).toBeGreaterThan(0);
    expect(counts.units).toBeGreaterThan(0);
    expect(counts.leadSources).toBeGreaterThan(0);
    expect(counts.applicationSettings).toBeGreaterThan(0);
    // Administrator holds the full permission set.
    expect(counts.rolePermissions).toBe(counts.permissions);
  });

  it('never overwrites a reconfigured application setting on reseed', async () => {
    await seedReferenceData(testPrisma);
    await testPrisma.applicationSetting.update({
      where: { key: 'billing.seller_state_code' },
      data: { value: '27' },
    });

    await seedReferenceData(testPrisma);

    const setting = await testPrisma.applicationSetting.findUniqueOrThrow({
      where: { key: 'billing.seller_state_code' },
    });
    expect(setting.value).toBe('27');
  });

  it('produces no duplicates when run a second time', async () => {
    await seedReferenceData(testPrisma);
    const afterFirstRun = await countReferenceData();

    await seedReferenceData(testPrisma);
    const afterSecondRun = await countReferenceData();

    expect(afterSecondRun).toEqual(afterFirstRun);
  });

  it('seeds no business data', async () => {
    await seedReferenceData(testPrisma);

    const [leads, companies, contacts, invoices, payments, products, users] = await Promise.all([
      testPrisma.lead.count(),
      testPrisma.company.count(),
      testPrisma.contact.count(),
      testPrisma.invoice.count(),
      testPrisma.payment.count(),
      testPrisma.product.count(),
      testPrisma.user.count(),
    ]);

    expect({ leads, companies, contacts, invoices, payments, products, users }).toEqual({
      leads: 0,
      companies: 0,
      contacts: 0,
      invoices: 0,
      payments: 0,
      products: 0,
      users: 0,
    });
  });

  it('marks seeded roles as system roles so they are protected from casual edits', async () => {
    await seedReferenceData(testPrisma);

    const roles = await testPrisma.role.findMany();

    expect(roles.length).toBeGreaterThan(0);
    expect(roles.every((role) => role.isSystemRole)).toBe(true);
  });
});
