import type {
  GoodsReceipt as PrismaGoodsReceipt,
  GoodsReceiptItem as PrismaGoodsReceiptItem,
  Warehouse,
  Product,
} from '@prisma/client';
import type { GoodsReceipt, GoodsReceiptItem } from '@crm/types';

type WarehouseRef = Pick<Warehouse, 'id' | 'code' | 'name'>;
type ProductRef = Pick<Product, 'id' | 'sku' | 'name'>;

export const GOODS_RECEIPT_INCLUDE = {
  warehouse: { select: { id: true, code: true, name: true } },
  items: { include: { product: { select: { id: true, sku: true, name: true } } } },
} as const;

export type GoodsReceiptItemWithRelations = PrismaGoodsReceiptItem & { product: ProductRef };

export type GoodsReceiptWithRelations = PrismaGoodsReceipt & {
  warehouse: WarehouseRef;
  items: GoodsReceiptItemWithRelations[];
};

export function toGoodsReceiptItem(item: GoodsReceiptItemWithRelations): GoodsReceiptItem {
  return {
    id: item.id,
    purchaseOrderItemId: item.purchaseOrderItemId,
    productId: item.productId,
    sku: item.product.sku,
    productName: item.product.name,
    quantityReceived: item.quantityReceived.toString(),
    acceptedQuantity: item.acceptedQuantity.toString(),
    rejectedQuantity: item.rejectedQuantity.toString(),
    notes: item.notes,
  };
}

export function toGoodsReceipt(receipt: GoodsReceiptWithRelations): GoodsReceipt {
  return {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    purchaseOrderId: receipt.purchaseOrderId,
    warehouse: receipt.warehouse,
    receiptDate: receipt.receiptDate.toISOString().slice(0, 10),
    supplierDocumentNumber: receipt.supplierDocumentNumber,
    notes: receipt.notes,
    items: receipt.items.map(toGoodsReceiptItem),
    createdAt: receipt.createdAt.toISOString(),
  };
}
