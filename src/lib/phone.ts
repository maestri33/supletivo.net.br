/**
 * Brazilian phone helpers. App is BR-only.
 * Standard format: DDD + number (10 digits for landline or 11 digits for mobile).
 */

/** Strip everything except numeric digits. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/** Check if phone has valid Brazilian length (10 or 11 digits). */
export function isValidBrPhone(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 10 || d.length === 11;
}

/**
 * Progressive display mask:
 * 11 digits -> (00) 00000-0000
 * 10 digits -> (00) 0000-0000
 */
export function maskBrPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const breakAt = rest.length > 8 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, breakAt)}-${rest.slice(breakAt)}`;
}
