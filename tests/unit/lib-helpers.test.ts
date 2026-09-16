import { describe, it, expect } from 'vitest';
import { onlyDigits, isValidBrPhone, maskBrPhone } from '../../src/lib/phone';
import { maskCpf, isValidCpf } from '../../src/lib/cpf';
import { isEmailFormatValid, completeEmailWithDomain, POPULAR_EMAIL_DOMAINS } from '../../src/lib/email';

describe('src/lib/phone helpers', () => {
  it('strips non-digit characters', () => {
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321');
  });

  it('validates 10 and 11 digit phones', () => {
    expect(isValidBrPhone('11987654321')).toBe(true);
    expect(isValidBrPhone('1133334444')).toBe(true);
    expect(isValidBrPhone('1198765432')).toBe(true);
    expect(isValidBrPhone('119876')).toBe(false);
  });

  it('applies progressive phone mask', () => {
    expect(maskBrPhone('')).toBe('');
    expect(maskBrPhone('11')).toBe('(11');
    expect(maskBrPhone('119876')).toBe('(11) 9876');
    expect(maskBrPhone('11987654321')).toBe('(11) 98765-4321');
  });
});

describe('src/lib/cpf helpers', () => {
  it('formats CPF with progressive mask', () => {
    expect(maskCpf('529')).toBe('529');
    expect(maskCpf('529982')).toBe('529.982');
    expect(maskCpf('529982247')).toBe('529.982.247');
    expect(maskCpf('52998224725')).toBe('529.982.247-25');
  });

  it('validates CPF strictly with modulo 11', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('12345678900')).toBe(false);
  });
});

describe('src/lib/email helpers', () => {
  it('contains standard popular domains', () => {
    expect(POPULAR_EMAIL_DOMAINS).toContain('gmail.com');
    expect(POPULAR_EMAIL_DOMAINS).toContain('hotmail.com');
  });

  it('validates RFC-like email syntax', () => {
    expect(isEmailFormatValid('aluno@gmail.com')).toBe(true);
    expect(isEmailFormatValid('aluno.supletivo@empresa.com.br')).toBe(true);
    expect(isEmailFormatValid('invalido@')).toBe(false);
    expect(isEmailFormatValid('invalido')).toBe(false);
  });

  it('completes email with selected domain chip', () => {
    expect(completeEmailWithDomain('maria', 'gmail.com')).toBe('maria@gmail.com');
    expect(completeEmailWithDomain('maria@', 'hotmail.com')).toBe('maria@hotmail.com');
    expect(completeEmailWithDomain('maria@antigo.com', 'outlook.com')).toBe('maria@outlook.com');
  });
});
