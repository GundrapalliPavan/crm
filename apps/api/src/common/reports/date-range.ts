export interface ResolvedDateRange {
  from: Date;
  /** Exclusive upper bound (start of the day after `dateTo`), so a Prisma `lt` comparison includes the whole of the last day. */
  to: Date;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_RANGE_DAYS = 30;

/**
 * REPORTS.md section 9: reports need clear date semantics, not a silent
 * empty range. Defaults to the trailing 30 days when the caller omits both
 * bounds, matching common reporting UX rather than requiring an explicit
 * range on every request.
 */
export function resolveDateRange(dateFrom?: string, dateTo?: string): ResolvedDateRange {
  const to = dateTo ? new Date(dateTo) : new Date();
  const from = dateFrom ? new Date(dateFrom) : new Date(to);
  if (!dateFrom) {
    from.setUTCDate(from.getUTCDate() - DEFAULT_RANGE_DAYS);
  }

  const fromStart = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const toExclusive = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() + 1));

  return {
    from: fromStart,
    to: toExclusive,
    dateFrom: fromStart.toISOString().slice(0, 10),
    dateTo: new Date(toExclusive.getTime() - 1).toISOString().slice(0, 10),
  };
}
