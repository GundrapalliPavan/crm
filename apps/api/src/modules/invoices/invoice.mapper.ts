import type { Invoice as PrismaInvoice, InvoiceItem as PrismaInvoiceItem, Company, Contact } from '@prisma/client';
import type { Invoice, InvoiceItem, InvoiceSummary, OutstandingInvoice } from '@crm/types';

type CompanyRef = Pick<Company, 'id' | 'name' | 'companyType'>;
type ContactRef = Pick<Contact, 'id' | 'firstName' | 'lastName'>;

export const INVOICE_SUMMARY_INCLUDE = {
  customer: { select: { id: true, name: true, companyType: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
} as const;

export const INVOICE_DETAIL_INCLUDE = {
  ...INVOICE_SUMMARY_INCLUDE,
  items: { orderBy: { sortOrder: 'asc' as const } },
} as const;

export type InvoiceWithSummaryRelations = PrismaInvoice & {
  customer: CompanyRef;
  contact: ContactRef | null;
};

export type InvoiceWithDetailRelations = InvoiceWithSummaryRelations & {
  items: PrismaInvoiceItem[];
};

function toInvoiceHeader(invoice: InvoiceWithSummaryRelations) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    salesOrderId: invoice.salesOrderId,
    customer: invoice.customer,
    contact: invoice.contact,
    invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
    dueDate: invoice.dueDate?.toISOString().slice(0, 10) ?? null,
    status: invoice.status,
    currencyCode: invoice.currencyCode,
    subtotal: invoice.subtotal.toString(),
    discountAmount: invoice.discountAmount.toString(),
    taxableAmount: invoice.taxableAmount.toString(),
    cgstAmount: invoice.cgstAmount.toString(),
    sgstAmount: invoice.sgstAmount.toString(),
    igstAmount: invoice.igstAmount.toString(),
    taxAmount: invoice.taxAmount.toString(),
    totalAmount: invoice.totalAmount.toString(),
    paidAmount: invoice.paidAmount.toString(),
    outstandingAmount: invoice.outstandingAmount.toString(),
    customerNameSnapshot: invoice.customerNameSnapshot,
    customerGstinSnapshot: invoice.customerGstinSnapshot,
    placeOfSupplyCode: invoice.placeOfSupplyCode,
    notes: invoice.notes,
    terms: invoice.terms,
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    cancelledAt: invoice.cancelledAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}

export function toInvoiceSummary(invoice: InvoiceWithSummaryRelations): InvoiceSummary {
  return toInvoiceHeader(invoice);
}

export function toInvoiceItem(item: PrismaInvoiceItem): InvoiceItem {
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
    taxableAmount: item.taxableAmount.toString(),
    taxRate: item.taxRate.toString(),
    cgstRate: item.cgstRate.toString(),
    cgstAmount: item.cgstAmount.toString(),
    sgstRate: item.sgstRate.toString(),
    sgstAmount: item.sgstAmount.toString(),
    igstRate: item.igstRate.toString(),
    igstAmount: item.igstAmount.toString(),
    taxAmount: item.taxAmount.toString(),
    lineTotal: item.lineTotal.toString(),
    sortOrder: item.sortOrder,
  };
}

export function toInvoice(invoice: InvoiceWithDetailRelations): Invoice {
  return {
    ...toInvoiceHeader(invoice),
    items: invoice.items.map(toInvoiceItem),
  };
}

export function toOutstandingInvoice(invoice: PrismaInvoice): OutstandingInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
    dueDate: invoice.dueDate?.toISOString().slice(0, 10) ?? null,
    status: invoice.status,
    totalAmount: invoice.totalAmount.toString(),
    paidAmount: invoice.paidAmount.toString(),
    outstandingAmount: invoice.outstandingAmount.toString(),
  };
}
