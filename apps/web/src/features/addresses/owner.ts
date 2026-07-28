import type { AddressOwnerType, ListAddressesQuery } from '@crm/types';

/** Builds the single owner-id filter/payload fragment for the given owner type - Address belongs to exactly one of Company/Contact/Warehouse. */
export function ownerQuery(ownerType: AddressOwnerType, ownerId: string): ListAddressesQuery {
  switch (ownerType) {
    case 'company':
      return { companyId: ownerId };
    case 'contact':
      return { contactId: ownerId };
    case 'warehouse':
      return { warehouseId: ownerId };
  }
}
