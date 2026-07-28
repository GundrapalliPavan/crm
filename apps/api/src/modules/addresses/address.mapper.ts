import type { Address as PrismaAddress } from '@prisma/client';
import type { Address } from '@crm/types';

export function toAddress(address: PrismaAddress): Address {
  return {
    id: address.id,
    companyId: address.companyId,
    contactId: address.contactId,
    warehouseId: address.warehouseId,
    addressType: address.addressType,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    stateCode: address.stateCode,
    postalCode: address.postalCode,
    countryCode: address.countryCode,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}
