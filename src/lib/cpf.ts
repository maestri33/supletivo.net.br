import { onlyDigits } from "./phone";

/** Progressive display mask for CPF: 000.000.000-00 */
export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Strict Brazilian CPF validation using Module 11 algorithm.
 * Checks for 11 digits, rejects identical digit sequences,
 * and validates both verification digits.
 */
export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;

  const calculateDigit = (sliceLen: number, startWeight: number): number => {
    let sum = 0;
    for (let i = 0; i < sliceLen; i++) {
      sum += Number(d[i]) * (startWeight - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  return calculateDigit(9, 10) === Number(d[9]) && calculateDigit(10, 11) === Number(d[10]);
}
