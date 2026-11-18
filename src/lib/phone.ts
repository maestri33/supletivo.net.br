/**
 * Brazilian phone helpers. App is BR-only.
 * Standard format: DDD + number (10 digits for landline or 11 digits for mobile).
 */

/** Strip everything except numeric digits. */
export function onlyDigits(value: string): string {
  return value ? value.replace(/\D+/g, "") : "";
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

/**
 * Validação de telefone celular brasileiro (padrão 11 dígitos: DDD + 9XXXX-XXXX).
 * DDDs válidos no Brasil: 11 a 99 (excluindo prefixos inexistentes onde o 2º dígito é 0).
 * O 3º dígito de qualquer celular nacional é obrigatoriamente 9.
 */
export function validatePhone(rawPhone: string): boolean {
  if (!rawPhone) return false;
  const digits = onlyDigits(rawPhone);

  if (digits.length !== 11) return false;

  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99 || ddd % 10 === 0) return false;

  return digits.charAt(2) === '9';
}

/**
 * Formata número de telefone brasileiro progressivamente para digitação:
 * (XX) 9XXXX-XXXX
 */
export function formatPhone(raw: string): string {
  if (!raw) return '';
  const digits = onlyDigits(raw).slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
