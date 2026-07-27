import type {
  Quotation as PrismaQuotation,
  QuotationItem as PrismaQuotationItem,
  Company,
  Contact,
  User,
} from '@prisma/client';
import type { Quotation, QuotationItem, QuotationSummary } from '@crm/types';

type CompanyRef = Pick<Company, 'id' | 'name' | 'companyType'>;
type ContactRef = Pick<Contact, 'id' | 'firstName' | 'lastName'>;
type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;

export const QUOTATION_SUMMARY_INCLUDE = {
  customer: { select: { id: true, name: true, companyType: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

export const QUOTATION_DETAIL_INCLUDE = {
  ...QUOTATION_SUMMARY_INCLUDE,
  items: { orderBy: { sortOrder: 'asc' as const } },
} as const;

export type QuotationWithSummaryRelations = PrismaQuotation & {
  customer: CompanyRef;
  contact: ContactRef | null;
  owner: UserRef | null;
};

export type QuotationWithDetailRelations = QuotationWithSummaryRelations & {
  items: PrismaQuotationItem[];
};

function toQuotationHeader(quotation: QuotationWithSummaryRelations) {
  return {
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    customer: quotation.customer,
    contact: quotation.contact,
    leadId: quotation.leadId,
    quotationDate: quotation.quotationDate.toISOString().slice(0, 10),
    validUntil: quotation.validUntil?.toISOString().slice(0, 10) ?? null,
    status: quotation.status,
    currencyCode: quotation.currencyCode,
    subtotal: quotation.subtotal.toString(),
    discountAmount: quotation.discountAmount.toString(),
    taxAmount: quotation.taxAmount.toString(),
    totalAmount: quotation.totalAmount.toString(),
    notes: quotation.notes,
    terms: quotation.terms,
    owner: quotation.owner,
    createdAt: quotation.createdAt.toISOString(),
    updatedAt: quotation.updatedAt.toISOString(),
  };
}

export function toQuotationSummary(quotation: QuotationWithSummaryRelations): QuotationSummary {
  return toQuotationHeader(quotation);
}

export function toQuotationItem(item: PrismaQuotationItem): QuotationItem {
  return {
    id: item.id,
    productId: item.productId,
    sku: item.skuSnapshot,
    productName: item.productNameSnapshot,
    description: item.descriptionSnapshot,
    hsnCode: item.hsnSnapshot,
    unit: item.unitSnapshot,
    quantity: item.quantity.toString(),
    unitPrice: item.unitPrice.toString(),
    discountPercentage: item.discountPercentage.toString(),
    discountAmount: item.discountAmount.toString(),
    taxRate: item.taxRate.toString(),
    taxAmount: item.taxAmount.toString(),
    lineTotal: item.lineTotal.toString(),
    sortOrder: item.sortOrder,
  };
}

export function toQuotation(quotation: QuotationWithDetailRelations): Quotation {
  return {
    ...toQuotationHeader(quotation),
    items: quotation.items.map(toQuotationItem),
  };
}
