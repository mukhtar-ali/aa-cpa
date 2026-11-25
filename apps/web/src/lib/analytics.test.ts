import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_EVENT, hasAnalyticsConsent, sanitizeAnalyticsPayload, track } from './analytics';

describe('analytics', () => {
    let cookieStore = '';

    beforeEach(() => {
        cookieStore = '';
        const eventTarget = new EventTarget();
        const dataLayer: unknown[] = [];

        vi.stubGlobal('window', {
            addEventListener: eventTarget.addEventListener.bind(eventTarget),
            removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
            dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
            dataLayer,
        });

        vi.stubGlobal('document', {
            get cookie() {
                return cookieStore;
            },
            set cookie(val: string) {
                cookieStore = val;
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('hasAnalyticsConsent', () => {
        it('returns false when no consent cookie is present', () => {
            expect(hasAnalyticsConsent()).toBe(false);
        });

        it('returns true when consent cookie has analytics: true', () => {
            const cookie = encodeURIComponent(
                JSON.stringify({ v: '1.0', c: { analytics: true, marketing: false }, t: Date.now() }),
            );
            document.cookie = `aacpa_consent=${cookie}`;
            expect(hasAnalyticsConsent()).toBe(true);
        });

        it('returns false when consent cookie has analytics: false', () => {
            const cookie = encodeURIComponent(
                JSON.stringify({ v: '1.0', c: { analytics: false, marketing: true }, t: Date.now() }),
            );
            document.cookie = `aacpa_consent=${cookie}`;
            expect(hasAnalyticsConsent()).toBe(false);
        });
    });

    describe('sanitizeAnalyticsPayload', () => {
        it('strips PII fields (name, email, phone, message)', () => {
            const raw = {
                source: 'contact',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '0500000000',
                message: 'Hello confidential inquiry',
                service_id: 'audit',
                lang: 'en',
            };
            const sanitized = sanitizeAnalyticsPayload(raw);
            expect(sanitized).toEqual({
                source: 'contact',
                service_id: 'audit',
                lang: 'en',
            });
            expect(sanitized).not.toHaveProperty('name');
            expect(sanitized).not.toHaveProperty('email');
            expect(sanitized).not.toHaveProperty('phone');
            expect(sanitized).not.toHaveProperty('message');
        });
    });

    describe('track', () => {
        it('dispatches monitoring event regardless of GTM when not GTM_ONLY', () => {
            const listener = vi.fn();
            window.addEventListener(ANALYTICS_EVENT, listener);
            track('contact_click', { channel: 'whatsapp', location: 'float' });

            expect(listener).toHaveBeenCalledTimes(1);
            expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
                name: 'contact_click',
                properties: { channel: 'whatsapp', location: 'float' },
            });
        });

        it('does NOT push to window.dataLayer when analytics consent is NOT granted', () => {
            track('lead_submitted', { source: 'contact', service_id: 'tax', lang: 'ar' });
            expect(window.dataLayer).toEqual([]);
        });

        it('pushes to window.dataLayer when analytics consent IS granted', () => {
            const cookie = encodeURIComponent(
                JSON.stringify({ v: '1.0', c: { analytics: true, marketing: false }, t: Date.now() }),
            );
            document.cookie = `aacpa_consent=${cookie}`;

            track('quote_requested', { service_id: 'audit', range_band: '20k-50k', lang: 'en' });

            expect(window.dataLayer).toEqual([
                {
                    event: 'quote_requested',
                    service_id: 'audit',
                    range_band: '20k-50k',
                    lang: 'en',
                },
            ]);
        });

        it('pushes GTM-only events to dataLayer if consented, without sending to monitoring', () => {
            const cookie = encodeURIComponent(
                JSON.stringify({ v: '1.0', c: { analytics: true, marketing: true }, t: Date.now() }),
            );
            document.cookie = `aacpa_consent=${cookie}`;

            const listener = vi.fn();
            window.addEventListener(ANALYTICS_EVENT, listener);

            track('estimate_completed', { service_id: 'zakat', lang: 'ar' });

            expect(listener).not.toHaveBeenCalled();
            expect(window.dataLayer).toEqual([
                {
                    event: 'estimate_completed',
                    service_id: 'zakat',
                    lang: 'ar',
                },
            ]);
        });

        it('does nothing on the server', () => {
            vi.unstubAllGlobals();
            expect(() => track('article_shared', { network: 'copy' })).not.toThrow();
        });
    });
});
