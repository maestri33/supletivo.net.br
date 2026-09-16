import { describe, it, expect } from 'vitest';
import { validateCPF, formatCPF } from '../../src/scripts/cpf-validator';
import { validatePhone, formatPhone } from '../../src/scripts/phone-validator';

describe('CPF Validator & Formatter (Modulo 11)', () => {
  it('validates well-known valid CPFs', () => {
    // CPFs com DVs válidos gerados matematicamente para teste
    expect(validateCPF('52998224725')).toBe(true);
    expect(validateCPF('529.982.247-25')).toBe(true);
    expect(validateCPF('11144477735')).toBe(true);
    expect(validateCPF('07461638947')).toBe(true);
  });

  it('rejects repetitive numbers (000...000, 111...111, etc)', () => {
    expect(validateCPF('00000000000')).toBe(false);
    expect(validateCPF('11111111111')).toBe(false);
    expect(validateCPF('99999999999')).toBe(false);
  });

  it('rejects invalid check digits', () => {
    expect(validateCPF('52998224720')).toBe(false);
    expect(validateCPF('12345678900')).toBe(false);
  });

  it('rejects incomplete or empty inputs', () => {
    expect(validateCPF('')).toBe(false);
    expect(validateCPF('123456789')).toBe(false);
    expect(validateCPF('529982247251')).toBe(false);
  });

  it('formats CPF with standard punctuation', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25');
    expect(formatCPF('529')).toBe('529');
    expect(formatCPF('529982')).toBe('529.982');
    expect(formatCPF('529982247')).toBe('529.982.247');
    expect(formatCPF('')).toBe('');
  });
});

describe('Phone Validator & Formatter (Brazilian Mobile)', () => {
  it('validates valid Brazilian mobile numbers', () => {
    expect(validatePhone('11987654321')).toBe(true);
    expect(validatePhone('(11) 98765-4321')).toBe(true);
    expect(validatePhone('42999998888')).toBe(true);
    expect(validatePhone('21971234567')).toBe(true);
  });

  it('rejects phone numbers with invalid length', () => {
    expect(validatePhone('1198765432')).toBe(false); // 10 dígitos
    expect(validatePhone('119876543210')).toBe(false); // 12 dígitos
    expect(validatePhone('')).toBe(false);
  });

  it('rejects invalid DDDs (ending in 0 or outside 11-99)', () => {
    expect(validatePhone('20987654321')).toBe(false); // DDD 20 não existe
    expect(validatePhone('30987654321')).toBe(false); // DDD 30 não existe
    expect(validatePhone('05987654321')).toBe(false); // DDD 05 não existe
  });

  it('rejects non-mobile 8-digit numbers without 9', () => {
    expect(validatePhone('1133334444')).toBe(false); // Fixo (10 dígitos)
    expect(validatePhone('11887654321')).toBe(false); // Celular sem o 9 como 3º dígito
  });

  it('formats phone numbers progressively', () => {
    expect(formatPhone('11')).toBe('(11');
    expect(formatPhone('119')).toBe('(11) 9');
    expect(formatPhone('1198765')).toBe('(11) 98765');
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('')).toBe('');
  });
});
