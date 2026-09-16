/**
 * Validação estrita de CPF brasileiro via algoritmo Módulo 11.
 * Retorna true apenas se o CPF tiver exatamente 11 dígitos, não for repetitivo
 * e possuir os dois dígitos verificadores (DV1 e DV2) matematicamente válidos.
 */
export function validateCPF(rawCpf: string): boolean {
  if (!rawCpf) return false;
  const cpf = rawCpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  // Rejeita sequências de números iguais conhecidas (ex.: 000.000.000-00, 111.111.111-11, ...)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Cálculo do 1º Dígito Verificador (DV1)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const dv1 = remainder >= 10 ? 0 : remainder;
  if (dv1 !== parseInt(cpf.charAt(9), 10)) return false;

  // Cálculo do 2º Dígito Verificador (DV2)
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const dv2 = remainder >= 10 ? 0 : remainder;
  return dv2 === parseInt(cpf.charAt(10), 10);
}

/**
 * Formata string bruta ou parcial de CPF para a máscara brasileira: 000.000.000-00.
 */
export function formatCPF(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
