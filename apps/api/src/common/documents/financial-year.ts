/**
 * Indian financial year string (DATABASE.md section 81), e.g. "2026-27".
 * The year runs April-March; January-March belongs to the year that started
 * the previous April.
 */
export function financialYearFor(date: Date): string {
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}
