import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_EVENT, track } from './analytics';

// Node has EventTarget and CustomEvent, which is all track() needs; a full DOM would only slow the suite down.
beforeEach(() => {
    vi.stubGlobal('window', new EventTarget());
});
afterEach(() => vi.unstubAllGlobals());

describe('track', () => {
    it('dispatches a typed event with its properties', () => {
        const listener = vi.fn();
        window.addEventListener(ANALYTICS_EVENT, listener);
        track('contact_click', { channel: 'whatsapp', location: 'float' });
        expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
            name: 'contact_click',
            properties: { channel: 'whatsapp', location: 'float' },
        });
    });

    it('does not send estimate_completed to monitoring (GTM only)', () => {
        const listener = vi.fn();
        window.addEventListener(ANALYTICS_EVENT, listener);
        track('estimate_completed', { lang: 'ar' });
        expect(listener).not.toHaveBeenCalled();
    });

    it('does nothing on the server', () => {
        vi.unstubAllGlobals();
        expect(() => track('article_shared', { network: 'copy' })).not.toThrow();
    });
});
