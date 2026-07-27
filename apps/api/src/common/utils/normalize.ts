/**
 * Canonical forms used for search and duplicate detection (DATABASE.md
 * sections 132-133, CRM.md section 45). Populated by the application layer -
 * never trusted from client input directly.
 */

/**
 * Strips everything but digits and keeps the last 10, so a number entered
 * with or without the +91 country code, spaces or punctuation normalizes to
 * the same value. India-only for now, matching this schema's other defaults
 * (Company.countryCode, Address.countryCode both default to "IN").
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');
  return digits.length > 0 ? digits.slice(-10) : null;
}

export function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
