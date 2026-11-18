import { MAX_TRUSTED_PROXY_HOPS, parseTrustProxy } from './trust-proxy';

describe('parseTrustProxy', () => {
    it.each([
        ['1', 1],
        ['2', 2],
        [String(MAX_TRUSTED_PROXY_HOPS), MAX_TRUSTED_PROXY_HOPS],
    ])('accepts %s hop(s)', (raw, expected) => {
        expect(parseTrustProxy(raw)).toBe(expected);
    });

    it.each([
        ['undefined', undefined],
        ['empty', ''],
        ['zero', '0'],
        ['negative', '-1'],
        ['too many hops', String(MAX_TRUSTED_PROXY_HOPS + 1)],
        ['decimal', '1.5'],
        ['padded', ' 1 '],
        ['true (would trust every X-Forwarded-For entry)', 'true'],
        ['wildcard', '*'],
        ['subnet list', 'loopback, 10.0.0.0/8'],
        ['exponent', '1e1'],
        ['huge', '99999999999999999999'],
    ])('does not trust the proxy for %s', (_label, raw) => {
        expect(parseTrustProxy(raw as string | undefined)).toBe(false);
    });
});
