import type { SupplierProfile as PrismaSupplierProfile } from '@prisma/client';
import type { SupplierProfile } from '@crm/types';

export function toSupplierProfile(profile: PrismaSupplierProfile): SupplierProfile {
  return {
    companyId: profile.companyId,
    supplierCode: profile.supplierCode,
    paymentTermsDays: profile.paymentTermsDays,
    supplierSince: profile.supplierSince?.toISOString().slice(0, 10) ?? null,
    notes: profile.notes,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
