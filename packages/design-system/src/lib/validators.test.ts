import { describe, expect, it } from 'vitest';
import { isEmail, isSaudiMobile, normalizeDigits } from './validators';

describe('validators', () => {
  it('accepts Saudi mobile formats and Arabic-Indic digits', () => {
    for (const v of ['0555346560', '555346560', '+966555346560', '00966555346560', '055 534 6560', '055-534-6560', '٠٥٥٥٣٤٦٥٦٠']) expect(isSaudiMobile(v), v).toBe(true);
  });

  it('rejects other numbers', () => {
    for (const v of ['', '0455346560', '05553465', '+971555346560', '12345', 'abc']) expect(isSaudiMobile(v), v).toBe(false);
  });

  it('validates emails', () => {
    expect(isEmail('info@aacpa.sa')).toBe(true);
    expect(isEmail(' info@aacpa.sa ')).toBe(true);
    for (const v of ['', 'info', 'info@', '@aacpa.sa', 'a b@c.sa', 'a@b']) expect(isEmail(v), v).toBe(false);
  });

  it('normalises digits', () => {
    expect(normalizeDigits('٠١٢٣٤٥٦٧٨٩ ۰۱۲')).toBe('0123456789 012');
  });
});
