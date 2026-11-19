import '@testing-library/jest-dom/vitest';
import 'vitest-axe/extend-expect';
import * as axeMatchers from 'vitest-axe/matchers.js';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

expect.extend(axeMatchers);

afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined') {
  // Mock matchMedia for jsdom
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Mock IntersectionObserver for jsdom
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    disconnect() {}
    observe() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    unobserve() {}
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}
