/** API.md section 111: the sync CSV path for small reports - no async export-job infra exists (or is needed) for these aggregate sizes. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(','));
  return lines.join('\r\n');
}

function escapeCsvField(value: string | number): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
