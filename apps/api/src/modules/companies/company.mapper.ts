import type { Company as PrismaCompany, User } from '@prisma/client';
import type { Company } from '@crm/types';

type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;

export const COMPANY_INCLUDE = {
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

export type CompanyWithRelations = PrismaCompany & { owner: UserRef | null };

export function toCompany(company: CompanyWithRelations): Company {
  return {
    id: company.id,
    name: company.name,
    companyType: company.companyType,
    phone: company.phone,
    email: company.email,
    website: company.website,
    gstin: company.gstin,
    taxIdentifier: company.taxIdentifier,
    owner: company.owner,
    creditLimit: company.creditLimit?.toString() ?? null,
    paymentTermsDays: company.paymentTermsDays,
    isCustomer: company.isCustomer,
    isSupplier: company.isSupplier,
    isActive: company.isActive,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}
