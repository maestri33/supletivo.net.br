/**
 * Popular Brazilian email domain providers for single-tap autocomplete chips.
 */
export const POPULAR_EMAIL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com.br",
  "icloud.com",
] as const;

/** RFC-like syntax validation for email: local@domain.tld */
export function isEmailFormatValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Complete email address with selected domain chip */
export function completeEmailWithDomain(currentValue: string, domain: string): string {
  const clean = currentValue.trim();
  const prefix = clean.includes("@") ? clean.split("@")[0] : clean;
  return `${prefix}@${domain}`;
}
