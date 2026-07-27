import { Prisma } from '@prisma/client';
import { ValidationError } from '../../common/errors/app-error';

/** The subset of Product fields needed to resolve and snapshot a PO line (PURCHASE.md section 40). */
export interface ProductForPurchaseLineResolution {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  hsnCode: string | null;
  taxRate: Prisma.Decimal;
  unit: { symbol: string };
}

export interface PurchaseLineItemRequest {
  productId: string;
  orderedQuantity: string;
  unitPrice: string;
  discountPercentage?: string;
}

export interface ResolvedPurchaseLine {
  productId: string;
  skuSnapshot: string;
  productNameSnapshot: string;
  descriptionSnapshot: string | null;
  hsnSnapshot: string | null;
  unitSnapshot: string;
  orderedQuantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  discountPercentage: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
}

/**
 * PURCHASE.md section 44: Quantity x Unit Price -> Discount -> Taxable Value
 * -> Tax -> Line Total. Unlike Quotations, `unitPrice` is always required,
 * never defaulted from a product reference price - the supplier's actually
 * quoted price is the only legitimate source, and Product carries no
 * per-supplier price (Supplier Product Mapping / RFQ / Supplier Quotations
 * are deferred, so there is nothing safe to default from).
 */
export function resolvePurchaseLine(
  product: ProductForPurchaseLineResolution,
  request: PurchaseLineItemRequest,
): ResolvedPurchaseLine {
  const orderedQuantity = new Prisma.Decimal(request.orderedQuantity);
  if (!orderedQuantity.isPositive()) {
    throw new ValidationError({ orderedQuantity: ['Ordered quantity must be greater than zero.'] });
  }

  const unitPrice = new Prisma.Decimal(request.unitPrice);
  if (unitPrice.isNegative()) {
    throw new ValidationError({ unitPrice: ['Unit price cannot be negative.'] });
  }

  const discountPercentage = new Prisma.Decimal(request.discountPercentage ?? 0);
  if (discountPercentage.lessThan(0) || discountPercentage.greaterThan(100)) {
    throw new ValidationError({ discountPercentage: ['Discount percentage must be between 0 and 100.'] });
  }

  const gross = orderedQuantity.times(unitPrice);
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
    orderedQuantity,
    unitPrice,
    discountPercentage,
    discountAmount,
    taxRate: product.taxRate,
    taxAmount,
    lineTotal,
  };
}
