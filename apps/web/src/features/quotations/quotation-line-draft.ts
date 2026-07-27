export interface QuotationLineDraft {
  productId: string;
  quantity: string;
  unitPrice: string;
  discountPercentage: string;
}

export const EMPTY_LINE: QuotationLineDraft = {
  productId: '',
  quantity: '1',
  unitPrice: '',
  discountPercentage: '0',
};
