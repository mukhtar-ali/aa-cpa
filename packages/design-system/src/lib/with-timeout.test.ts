import { afterEach, describe, expect, it, vi } from 'vitest';
import { withTimeout } from './with-timeout';

afterEach(() => vi.useRealTimers());

describe('withTimeout', () => {
  it('resolves with the value when the promise settles in time', async () => {
    await expect(withTimeout(Promise.resolve(5), 1000)).resolves.toBe(5);
  });

  it('passes a rejection through', async () => {
    await expect(withTimeout(Promise.reject(new Error('boom')), 1000)).rejects.toThrow('boom');
  });

  it('rejects with "timeout" when the promise never settles', async () => {
    vi.useFakeTimers();
    const result = withTimeout(new Promise<never>(() => {}), 500);
    const assertion = expect(result).rejects.toThrow('timeout');
    await vi.advanceTimersByTimeAsync(500);
    await assertion;
  });

  it('a non-positive or invalid limit means no limit', async () => {
    await expect(withTimeout(Promise.resolve(1), 0)).resolves.toBe(1);
    await expect(withTimeout(Promise.resolve(1), NaN)).resolves.toBe(1);
  });
});
