import { describe, it, expect } from 'vitest';
import { formatNumber, formatCurrency, formatDate } from './format';

describe('format utilities', () => {
  describe('formatNumber', () => {
    it('formats large numbers with Western digits in Arabic locale', () => {
      const result = formatNumber(12000000, 'ar');
      expect(result).toBe('12,000,000');
      // Must not contain Eastern Arabic numerals
      expect(result).not.toMatch(/[٠-٩]/);
    });

    it('formats large numbers with Western digits in English locale', () => {
      const result = formatNumber(12000000, 'en');
      expect(result).toBe('12,000,000');
    });

    it('defaults to Arabic locale when not specified', () => {
      expect(formatNumber(12000000)).toBe('12,000,000');
    });

    it('accepts custom Intl.NumberFormatOptions', () => {
      expect(formatNumber(3.14159, 'ar', { maximumFractionDigits: 2 })).toBe('3.14');
    });
  });

  describe('formatCurrency', () => {
    it('formats SAR currency with Western digits in Arabic', () => {
      const result = formatCurrency(12000000, 'ar');
      expect(result).toContain('12,000,000');
      expect(result).toContain('ر.س');
      expect(result).not.toMatch(/[٠-٩]/);
    });

    it('formats SAR currency in English', () => {
      const result = formatCurrency(12000000, 'en');
      expect(result).toContain('12,000,000');
      expect(result).toContain('SAR');
    });

    it('defaults to Arabic and SAR', () => {
      const result = formatCurrency(100);
      expect(result).toContain('100');
      expect(result).toContain('ر.س');
    });
  });

  describe('formatDate', () => {
    it('formats dates with Western digits in Arabic', () => {
      const date = new Date('2026-10-12T00:00:00Z');
      const result = formatDate(date, 'ar');
      expect(result).toContain('2026');
      expect(result).not.toMatch(/[٠-٩]/);
    });

    it('formats dates in English', () => {
      const date = new Date('2026-10-12T00:00:00Z');
      const result = formatDate(date, 'en');
      expect(result).toContain('2026');
    });

    it('accepts ISO string input', () => {
      const result = formatDate('2026-10-12', 'en');
      expect(result).toContain('2026');
    });
  });
});
