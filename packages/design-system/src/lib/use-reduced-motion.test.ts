import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './use-reduced-motion';

describe('useReducedMotion', () => {
  let listeners: Array<(e: MediaQueryListEvent) => void> = [];
  let matches = false;

  beforeEach(() => {
    listeners = [];
    matches = false;
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: (cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
      removeListener: vi.fn(),
      addEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) =>
        listeners.push(cb),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('returns false by default when prefers-reduced-motion is false', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when media query matches reduce', () => {
    matches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('reacts to media query change events', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
    });

    expect(result.current).toBe(true);
  });
});
