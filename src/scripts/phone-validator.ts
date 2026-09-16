/**
 * Validação de telefone celular brasileiro (padrão 11 dígitos: DDD + 9XXXX-XXXX).
 * DDDs válidos no Brasil: 11 a 99 (excluindo prefixos inexistentes onde o 2º dígito é 0).
 * O 3º dígito de qualquer celular nacional é obrigatoriamente 9.
 */
export function validatePhone(rawPhone: string): boolean {
  if (!rawPhone) return false;
  const digits = rawPhone.replace(/\D/g, '');

  if (digits.length !== 11) return false;

  const ddd = parseInt(digits.slice(0, 2), 10);
  // DDDs brasileiros válidos vão de 11 a 99, mas nenhum termina em 0 (ex: 20, 30 não existem)
  if (ddd < 11 || ddd > 99 || ddd % 10 === 0) return false;

  const ninthDigit = digits.charAt(2);
  return ninthDigit === '9';
}

/**
 * Formata número de telefone brasileiro progressivamente:
 * (XX) 9XXXX-XXXX
 */
export function formatPhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
