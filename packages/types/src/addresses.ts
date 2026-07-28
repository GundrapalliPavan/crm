/**
 * Addresses (platform capability - technical/DATABASE.md sections 36-37,
 * technical/API.md section 149).
 *
 * `Address` existed in the schema since Phase 0 and was completely unused -
 * no migration was needed. Unlike Files/Communications, an address attaches
 * to exactly one of three owner types (Company, Contact, Warehouse) via
 * dedicated nullable foreign keys plus a database CHECK constraint - not a
 * generic relatedEntityType/relatedEntityId pair - because DATABASE.md
 * section 36 explicitly prefers relational integrity over that convenience
 * here.
 *
 * Scope for this pass: CRUD scoped to one owner, with a default address per
 * owner+addressType. Wiring the `billingAddressSnapshot`/
 * `shippingAddressSnapshot`/`supplierAddressSnapshot` JSON columns already
 * present on Quotation/SalesOrder/PurchaseOrder/Invoice to actually capture
 * an address at document-creation time is a deliberate follow-up, not done
 * here - it touches four already-shipped financial services and deserves its
 * own reviewed pass (CLAUDE.md section 75).
 */

export const ADDRESS_TYPES = ['billing', 'shipping', 'office', 'warehouse', 'other'] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export type AddressOwnerType = 'company' | 'contact' | 'warehouse';

export interface Address {
  id: string;
  companyId: string | null;
  contactId: string | null;
  warehouseId: string | null;
  addressType: AddressType;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  stateCode: string | null;
  postalCode: string | null;
  countryCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Exactly one of `companyId`/`contactId`/`warehouseId` must be set - enforced by the service and the database CHECK constraint. */
export interface CreateAddressRequest {
  companyId?: string;
  contactId?: string;
  warehouseId?: string;
  addressType: AddressType;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  stateCode?: string;
  postalCode?: string;
  countryCode?: string;
  isDefault?: boolean;
}

export type UpdateAddressRequest = Partial<
  Omit<CreateAddressRequest, 'companyId' | 'contactId' | 'warehouseId'>
>;

export interface ListAddressesQuery {
  companyId?: string;
  contactId?: string;
  warehouseId?: string;
}
