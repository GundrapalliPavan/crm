export interface PurchaseOrderLineDraft {
  productId: string;
  orderedQuantity: string;
  unitPrice: string;
  discountPercentage: string;
}

export const EMPTY_PO_LINE: PurchaseOrderLineDraft = {
  productId: '',
  orderedQuantity: '1',
  unitPrice: '',
  discountPercentage: '0',
};
