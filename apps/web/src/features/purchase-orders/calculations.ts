/** Client-side preview only - the backend recomputes and owns the authoritative values (PURCHASE.md section 44). */
export interface PreviewLineInput {
  orderedQuantity: string;
  unitPrice: string;
  discountPercentage: string;
  taxRate: string;
}

export interface PreviewLine {
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export function previewLine(input: PreviewLineInput): PreviewLine {
  const quantity = Number(input.orderedQuantity) || 0;
  const unitPrice = Number(input.unitPrice) || 0;
  const discountPercentage = Number(input.discountPercentage) || 0;
  const taxRate = Number(input.taxRate) || 0;

  const gross = quantity * unitPrice;
  const discountAmount = round2((gross * discountPercentage) / 100);
  const taxableValue = gross - discountAmount;
  const taxAmount = round2((taxableValue * taxRate) / 100);
  const lineTotal = round2(taxableValue + taxAmount);

  return { discountAmount, taxAmount, lineTotal };
}

export interface PreviewTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function previewTotals(lines: PreviewLineInput[]): PreviewTotals {
  let subtotal = 0;
  let discountAmount = 0;
  let taxAmount = 0;

  for (const line of lines) {
    const quantity = Number(line.orderedQuantity) || 0;
    const unitPrice = Number(line.unitPrice) || 0;
    const { discountAmount: lineDiscount, taxAmount: lineTax } = previewLine(line);
    subtotal += quantity * unitPrice;
    discountAmount += lineDiscount;
    taxAmount += lineTax;
  }

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    taxAmount: round2(taxAmount),
    totalAmount: round2(subtotal - discountAmount + taxAmount),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
