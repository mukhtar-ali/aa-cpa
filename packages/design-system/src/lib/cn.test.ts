import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names cleanly', () => {
    expect(cn('font-bold', 'text-sm')).toBe('font-bold text-sm');
  });

  it('handles falsy and conditional values', () => {
    const isHidden = false;
    const zeroCount = 0;
    expect(
      cn('base', isHidden && 'hidden', null, undefined, zeroCount && 'zero', 'active'),
    ).toBe('base active');
  });

  it('resolves standard tailwind conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('resolves logical spacing conflicts', () => {
    expect(cn('ms-2', 'ms-4')).toBe('ms-4');
    expect(cn('pe-1', 'pe-6')).toBe('pe-6');
  });

  it('supports arrays and nested objects', () => {
    expect(cn(['flex', { hidden: false, 'items-center': true }])).toBe(
      'flex items-center',
    );
  });

  it('resolves custom font-size and spacing scale conflicts', () => {
    expect(cn('text-h2', 'text-h1')).toBe('text-h1');
    expect(cn('py-section-sm', 'py-section-lg')).toBe('py-section-lg');
  });
});
