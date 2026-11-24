import { describe, expect, it } from 'vitest';
import { clientIpFrom } from './client-ip';

const h = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });

describe('clientIpFrom', () => {
    it('prefers x-real-ip', () => expect(clientIpFrom(h({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '6.6.6.6, 2.2.2.2' }))).toBe('1.1.1.1'));
    it('ignores a forged first x-forwarded-for entry and takes the proxy-added last one', () => expect(clientIpFrom(h({ 'x-forwarded-for': '6.6.6.6, 2.2.2.2' }))).toBe('2.2.2.2'));
    it('returns undefined when no proxy header exists', () => expect(clientIpFrom(h({}))).toBeUndefined());
});
