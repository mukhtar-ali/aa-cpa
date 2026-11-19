/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

