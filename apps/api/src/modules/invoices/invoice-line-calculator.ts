import { Prisma } from '@prisma/client';
import { resolveLine, type ProductForLineResolution, type LineItemRequest } from '../../common/commercial/quotation-line-calculator';
import { ValidationError } from '../../common/errors/app-error';

export type TaxTreatment = 'intra_state' | 'inter_state';

/**
 * BILLING.md sections 18-19: tax treatment must be derived from configuration,
 * never guessed. Both state codes must be known - an invoice cannot be
 * created for a customer or seller whose GST state code is unset.
 */
export function determineTaxTreatment(
  sellerStateCode: string | null,
  customerStateCode: string | null,
): TaxTreatment {
  if (!sellerStateCode) {
    throw new ValidationError({
      stateCode: [
        'The seller GST state code is not configured (application setting "billing.seller_state_code").',
      ],
    });
  }
  if (!customerStateCode) {
    throw new ValidationError({
      customerCompanyId: ['This customer has no GST state code set - add one before invoicing.'],
    });
  }
  return sellerStateCode === customerStateCode ? 'intra_state' : 'inter_state';
}

export interface GstSplit {
  taxableAmount: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  cgstRate: Prisma.Decimal;
  cgstAmount: Prisma.Decimal;
  sgstRate: Prisma.Decimal;
  sgstAmount: Prisma.Decimal;
  igstRate: Prisma.Decimal;
  igstAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
}

const ZERO = new Prisma.Decimal(0);

/**
 * Splits an already-rounded flat tax amount into CGST+SGST or IGST.
 * Derives CGST/SGST from `taxAmount` (not from independently recomputing
 * taxableAmount x rate/2 twice) so the two halves always sum back to exactly
 * `taxAmount` - a paisa-level rounding mismatch would otherwise be possible.
 */
function splitTax(taxableAmount: Prisma.Decimal, taxRate: Prisma.Decimal, taxAmount: Prisma.Decimal, treatment: TaxTreatment): GstSplit {
  if (treatment === 'intra_state') {
    const cgstAmount = taxAmount.dividedBy(2).toDecimalPlaces(2);
    const sgstAmount = taxAmount.minus(cgstAmount);
    return {
      taxableAmount,
      taxRate,
      cgstRate: taxRate.dividedBy(2),
      cgstAmount,
      sgstRate: taxRate.dividedBy(2),
      sgstAmount,
      igstRate: ZERO,
      igstAmount: ZERO,
      taxAmount,
    };
  }

  return {
    taxableAmount,
    taxRate,
    cgstRate: ZERO,
    cgstAmount: ZERO,
    sgstRate: ZERO,
    sgstAmount: ZERO,
    igstRate: taxRate,
    igstAmount: taxAmount,
    taxAmount,
  };
}

export interface ResolvedInvoiceLine {
  productId: string;
  skuSnapshot: string;
  productNameSnapshot: string;
  descriptionSnapshot: string | null;
  hsnSnapshot: string | null;
  unitSnapshot: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  discountPercentage: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  cgstRate: Prisma.Decimal;
  cgstAmount: Prisma.Decimal;
  sgstRate: Prisma.Decimal;
  sgstAmount: Prisma.Decimal;
  igstRate: Prisma.Decimal;
  igstAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
}

/** Manual invoicing (BILLING.md section 8): resolves a fresh line from a product, same as a Quotation line, then applies the GST split. */
export function resolveInvoiceLineFromRequest(
  product: ProductForLineResolution,
  request: LineItemRequest,
  treatment: TaxTreatment,
): ResolvedInvoiceLine {
  const line = resolveLine(product, request);
  const taxableAmount = line.quantity.times(line.unitPrice).minus(line.discountAmount);
  const split = splitTax(taxableAmount, line.taxRate, line.taxAmount, treatment);

  return {
    productId: line.productId,
    skuSnapshot: line.skuSnapshot,
    productNameSnapshot: line.productNameSnapshot,
    descriptionSnapshot: line.descriptionSnapshot,
    hsnSnapshot: line.hsnSnapshot,
    unitSnapshot: line.unitSnapshot,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    discountPercentage: line.discountPercentage,
    discountAmount: line.discountAmount,
    lineTotal: line.lineTotal,
    ...split,
  };
}

/** The subset of SalesOrderItem fields needed to copy an already-resolved order line onto an invoice. */
export interface SalesOrderItemForInvoiceLine {
  id: string;
  productId: string;
  skuSnapshot: string;
  productNameSnapshot: string;
  descriptionSnapshot: string | null;
  hsnSnapshot: string | null;
  unitSnapshot: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  discountPercentage: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
}

/** API.md section 77: copies a Sales Order's own snapshot rather than re-resolving pricing from the product master. */
export function resolveInvoiceLineFromSalesOrderItem(
  item: SalesOrderItemForInvoiceLine,
  treatment: TaxTreatment,
): ResolvedInvoiceLine & { salesOrderItemId: string } {
  const taxableAmount = item.quantity.times(item.unitPrice).minus(item.discountAmount);
  const split = splitTax(taxableAmount, item.taxRate, item.taxAmount, treatment);

  return {
    productId: item.productId,
    skuSnapshot: item.skuSnapshot,
    productNameSnapshot: item.productNameSnapshot,
    descriptionSnapshot: item.descriptionSnapshot,
    hsnSnapshot: item.hsnSnapshot,
    unitSnapshot: item.unitSnapshot,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPercentage: item.discountPercentage,
    discountAmount: item.discountAmount,
    lineTotal: item.lineTotal,
    salesOrderItemId: item.id,
    ...split,
  };
}

export interface InvoiceTotals {
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  cgstAmount: Prisma.Decimal;
  sgstAmount: Prisma.Decimal;
  igstAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

/** BILLING.md section 15: Subtotal (gross, pre-discount) -> Discounts -> Taxable Value -> Taxes -> Grand Total. */
export function calculateInvoiceTotals(lines: ResolvedInvoiceLine[]): InvoiceTotals {
  let subtotal = ZERO;
  let discountAmount = ZERO;
  let taxableAmount = ZERO;
  let cgstAmount = ZERO;
  let sgstAmount = ZERO;
  let igstAmount = ZERO;
  let taxAmount = ZERO;

  for (const line of lines) {
    subtotal = subtotal.plus(line.quantity.times(line.unitPrice));
    discountAmount = discountAmount.plus(line.discountAmount);
    taxableAmount = taxableAmount.plus(line.taxableAmount);
    cgstAmount = cgstAmount.plus(line.cgstAmount);
    sgstAmount = sgstAmount.plus(line.sgstAmount);
    igstAmount = igstAmount.plus(line.igstAmount);
    taxAmount = taxAmount.plus(line.taxAmount);
  }

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxAmount,
    totalAmount: taxableAmount.plus(taxAmount),
  };
}
