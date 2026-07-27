import type {
  SalesOrder as PrismaSalesOrder,
  SalesOrderItem as PrismaSalesOrderItem,
  Company,
  Contact,
  User,
} from '@prisma/client';
import type { SalesOrder, SalesOrderItem, SalesOrderSummary } from '@crm/types';

type CompanyRef = Pick<Company, 'id' | 'name' | 'companyType'>;
type ContactRef = Pick<Contact, 'id' | 'firstName' | 'lastName'>;
type UserRef = Pick<User, 'id' | 'firstName' | 'lastName'>;

export const SALES_ORDER_SUMMARY_INCLUDE = {
  customer: { select: { id: true, name: true, companyType: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

export const SALES_ORDER_DETAIL_INCLUDE = {
  ...SALES_ORDER_SUMMARY_INCLUDE,
  items: { orderBy: { sortOrder: 'asc' as const } },
} as const;

export type SalesOrderWithSummaryRelations = PrismaSalesOrder & {
  customer: CompanyRef;
  contact: ContactRef | null;
  owner: UserRef | null;
};

export type SalesOrderWithDetailRelations = SalesOrderWithSummaryRelations & {
  items: PrismaSalesOrderItem[];
};

function toSalesOrderHeader(order: SalesOrderWithSummaryRelations) {
  return {
    id: order.id,
    salesOrderNumber: order.salesOrderNumber,
    quotationId: order.quotationId,
    customer: order.customer,
    contact: order.contact,
    orderDate: order.orderDate.toISOString().slice(0, 10),
    expectedDeliveryDate: order.expectedDeliveryDate?.toISOString().slice(0, 10) ?? null,
    status: order.status,
    currencyCode: order.currencyCode,
    subtotal: order.subtotal.toString(),
    discountAmount: order.discountAmount.toString(),
    taxAmount: order.taxAmount.toString(),
    totalAmount: order.totalAmount.toString(),
    notes: order.notes,
    terms: order.terms,
    owner: order.owner,
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    completedAt: order.completedAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function toSalesOrderSummary(order: SalesOrderWithSummaryRelations): SalesOrderSummary {
  return toSalesOrderHeader(order);
}

export function toSalesOrderItem(item: PrismaSalesOrderItem): SalesOrderItem {
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
    fulfilledQuantity: item.fulfilledQuantity.toString(),
    sortOrder: item.sortOrder,
  };
}

export function toSalesOrder(order: SalesOrderWithDetailRelations): SalesOrder {
  return {
    ...toSalesOrderHeader(order),
    items: order.items.map(toSalesOrderItem),
  };
}
