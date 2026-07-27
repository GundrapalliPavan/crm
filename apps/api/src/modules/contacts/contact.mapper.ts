import type { Contact as PrismaContact, Company, User } from '@prisma/client';
import type { Contact } from '@crm/types';

type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;
type CompanyRef = Pick<Company, 'id' | 'name' | 'companyType'>;

export const CONTACT_INCLUDE = {
  company: { select: { id: true, name: true, companyType: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

export type ContactWithRelations = PrismaContact & {
  company: CompanyRef | null;
  owner: UserRef | null;
};

export function toContact(contact: ContactWithRelations): Contact {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    jobTitle: contact.jobTitle,
    phone: contact.phone,
    alternatePhone: contact.alternatePhone,
    email: contact.email,
    company: contact.company,
    isPrimary: contact.isPrimary,
    owner: contact.owner,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}
