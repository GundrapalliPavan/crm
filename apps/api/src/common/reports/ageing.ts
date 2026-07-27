import { Prisma } from '@prisma/client';

export interface AgeingBuckets {
  current: Prisma.Decimal;
  days30: Prisma.Decimal;
  days60: Prisma.Decimal;
  days90: Prisma.Decimal;
  daysOver90: Prisma.Decimal;
}

export function emptyAgeingBuckets(): AgeingBuckets {
  return {
    current: new Prisma.Decimal(0),
    days30: new Prisma.Decimal(0),
    days60: new Prisma.Decimal(0),
    days90: new Prisma.Decimal(0),
    daysOver90: new Prisma.Decimal(0),
  };
}

/**
 * BILLING.md section 44: ageing is measured from the due date - an invoice
 * with no due date configured is treated as already due (age from the
 * invoice date), since there is no later date to wait for.
 */
export function addToAgeingBuckets(
  buckets: AgeingBuckets,
  referenceDate: Date,
  outstandingAmount: Prisma.Decimal,
  asOf: Date,
): void {
  const daysPastDue = Math.floor((asOf.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000));

  if (daysPastDue <= 0) {
    buckets.current = buckets.current.plus(outstandingAmount);
  } else if (daysPastDue <= 30) {
    buckets.days30 = buckets.days30.plus(outstandingAmount);
  } else if (daysPastDue <= 60) {
    buckets.days60 = buckets.days60.plus(outstandingAmount);
  } else if (daysPastDue <= 90) {
    buckets.days90 = buckets.days90.plus(outstandingAmount);
  } else {
    buckets.daysOver90 = buckets.daysOver90.plus(outstandingAmount);
  }
}
