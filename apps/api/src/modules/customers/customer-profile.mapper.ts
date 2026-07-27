import type { CustomerProfile as PrismaCustomerProfile } from '@prisma/client';
import type { CustomerProfile } from '@crm/types';

export function toCustomerProfile(profile: PrismaCustomerProfile): CustomerProfile {
  return {
    companyId: profile.companyId,
    customerCode: profile.customerCode,
    creditLimit: profile.creditLimit?.toString() ?? null,
    paymentTermsDays: profile.paymentTermsDays,
    customerSince: profile.customerSince?.toISOString().slice(0, 10) ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
