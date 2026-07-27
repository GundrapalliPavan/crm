import type { PurchaseOrder as PrismaPurchaseOrder, PurchaseOrderItem as PrismaPurchaseOrderItem, Company } from '@prisma/client';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderSummary } from '@crm/types';

type CompanyRef = Pick<Company, 'id' | 'name' | 'companyType'>;

export const PURCHASE_ORDER_SUMMARY_INCLUDE = {
  supplier: { select: { id: true, name: true, companyType: true } },
} as const;

export const PURCHASE_ORDER_DETAIL_INCLUDE = {
  ...PURCHASE_ORDER_SUMMARY_INCLUDE,
  items: { orderBy: { sortOrder: 'asc' as const } },
} as const;

export type PurchaseOrderWithSummaryRelations = PrismaPurchaseOrder & { supplier: CompanyRef };

export type PurchaseOrderWithDetailRelations = PurchaseOrderWithSummaryRelations & {
  items: PrismaPurchaseOrderItem[];
};

function toPurchaseOrderHeader(order: PurchaseOrderWithSummaryRelations) {
  return {
    id: order.id,
    poNumber: order.poNumber,
    supplier: order.supplier,
    poDate: order.poDate.toISOString().slice(0, 10),
    expectedDeliveryDate: order.expectedDeliveryDate?.toISOString().slice(0, 10) ?? null,
    status: order.status,
    currencyCode: order.currencyCode,
    subtotal: order.subtotal.toString(),
    discountAmount: order.discountAmount.toString(),
    taxAmount: order.taxAmount.toString(),
    totalAmount: order.totalAmount.toString(),
    notes: order.notes,
    terms: order.terms,
    approvedAt: order.approvedAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function toPurchaseOrderSummary(order: PurchaseOrderWithSummaryRelations): PurchaseOrderSummary {
  return toPurchaseOrderHeader(order);
}

export function toPurchaseOrderItem(item: PrismaPurchaseOrderItem): PurchaseOrderItem {
  return {
    id: item.id,
    productId: item.productId,
    sku: item.skuSnapshot,
    productName: item.productNameSnapshot,
    description: item.descriptionSnapshot,
    hsnCode: item.hsnSnapshot,
    unit: item.unitSnapshot,
    orderedQuantity: item.orderedQuantity.toString(),
    receivedQuantity: item.receivedQuantity.toString(),
    unitPrice: item.unitPrice.toString(),
    discountPercentage: item.discountPercentage.toString(),
    discountAmount: item.discountAmount.toString(),
    taxRate: item.taxRate.toString(),
    taxAmount: item.taxAmount.toString(),
    lineTotal: item.lineTotal.toString(),
    sortOrder: item.sortOrder,
  };
}

export function toPurchaseOrder(order: PurchaseOrderWithDetailRelations): PurchaseOrder {
  return {
    ...toPurchaseOrderHeader(order),
    items: order.items.map(toPurchaseOrderItem),
  };
}
