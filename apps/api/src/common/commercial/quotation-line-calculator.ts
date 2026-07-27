import { Prisma } from '@prisma/client';
import { ValidationError } from '../errors/app-error';

/** The subset of Product fields needed to resolve and snapshot a commercial line (SALES.md section 26). */
export interface ProductForLineResolution {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  hsnCode: string | null;
  taxRate: Prisma.Decimal;
  sellingPriceReference: Prisma.Decimal | null;
  unit: { symbol: string };
}

export interface LineItemRequest {
  productId: string;
  quantity: string;
  unitPrice?: string;
  discountPercentage?: string;
}

export interface ResolvedLine {
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

/**
 * SALES.md section 30: Quantity x Unit Price -> Line Discount -> Taxable
 * Value -> Tax -> Line Total, then resolves and snapshots the product fields
 * a later product-master change must not retroactively alter (DATABASE.md
 * section 57). `unitPrice` defaults to the product's `sellingPriceReference`
 * when the caller omits it - Price Lists / customer-specific pricing do not
 * exist yet, so this reference price is the only "applicable pricing" this
 * pass has to offer.
 */
export function resolveLine(product: ProductForLineResolution, request: LineItemRequest): ResolvedLine {
  const quantity = new Prisma.Decimal(request.quantity);
  if (!quantity.isPositive()) {
    throw new ValidationError({ quantity: ['Quantity must be greater than zero.'] });
  }

  let unitPrice: Prisma.Decimal;
  if (request.unitPrice !== undefined) {
    unitPrice = new Prisma.Decimal(request.unitPrice);
  } else if (product.sellingPriceReference !== null) {
    unitPrice = product.sellingPriceReference;
  } else {
    throw new ValidationError({
      unitPrice: [`${product.name} has no reference selling price - specify unitPrice explicitly.`],
    });
  }
  if (unitPrice.isNegative()) {
    throw new ValidationError({ unitPrice: ['Unit price cannot be negative.'] });
  }

  const discountPercentage = new Prisma.Decimal(request.discountPercentage ?? 0);
  if (discountPercentage.lessThan(0) || discountPercentage.greaterThan(100)) {
    throw new ValidationError({ discountPercentage: ['Discount percentage must be between 0 and 100.'] });
  }

  const gross = quantity.times(unitPrice);
  const discountAmount = gross.times(discountPercentage).dividedBy(100).toDecimalPlaces(2);
  const taxableValue = gross.minus(discountAmount);
  const taxAmount = taxableValue.times(product.taxRate).dividedBy(100).toDecimalPlaces(2);
  const lineTotal = taxableValue.plus(taxAmount).toDecimalPlaces(2);

  return {
    productId: product.id,
    skuSnapshot: product.sku,
    productNameSnapshot: product.name,
    descriptionSnapshot: product.description,
    hsnSnapshot: product.hsnCode,
    unitSnapshot: product.unit.symbol,
    quantity,
    unitPrice,
    discountPercentage,
    discountAmount,
    taxRate: product.taxRate,
    taxAmount,
    lineTotal,
  };
}

export interface DocumentTotals {
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

export interface TotalableLine {
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
}

/**
 * SALES.md section 30: Subtotal (gross, pre-discount) -> Discounts -> Taxes
 * -> Grand Total. Takes the narrower `TotalableLine` shape (not the full
 * `ResolvedLine`) so this also works when re-totalling lines copied from an
 * already-snapshotted source, e.g. converting a Quotation to a SalesOrder.
 */
export function calculateDocumentTotals(lines: TotalableLine[]): DocumentTotals {
  let subtotal = new Prisma.Decimal(0);
  let discountAmount = new Prisma.Decimal(0);
  let taxAmount = new Prisma.Decimal(0);

  for (const line of lines) {
    subtotal = subtotal.plus(line.quantity.times(line.unitPrice));
    discountAmount = discountAmount.plus(line.discountAmount);
    taxAmount = taxAmount.plus(line.taxAmount);
  }

  return { subtotal, discountAmount, taxAmount, totalAmount: subtotal.minus(discountAmount).plus(taxAmount) };
}
