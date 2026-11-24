/**
 * Typed product events (contracts/web-endpoints.md "Analytics events").
 * In 003 they reach the monitoring endpoint through MonitoringReporter;
 * In 004, `track()` also forwards them to `window.dataLayer` when analytics consent is granted.
 * Strict privacy rule: No names, emails, phones, free text or exact estimate values may appear in properties.
 */
export type Lang = 'ar' | 'en';

export type AnalyticsEvent =
    | { name: 'lead_submitted'; properties: { source: 'contact'; service_id?: string; lang: Lang } }
    | { name: 'quote_requested'; properties: { service_id?: string; range_band: string; lang: Lang } }
    | { name: 'estimate_completed'; properties: { service_id?: string; lang: Lang } }
    | { name: 'job_applied'; properties: { department: string; lang: Lang } }
    | {
          name: 'contact_click';
          properties: { channel: 'phone' | 'email' | 'whatsapp'; location: 'header' | 'footer' | 'contact' | 'float' };
      }
    | { name: 'article_shared'; properties: { network: 'x' | 'linkedin' | 'whatsapp' | 'copy' } };

export type AnalyticsDetail = { name: AnalyticsEvent['name']; properties: Record<string, unknown> };

export const ANALYTICS_EVENT = 'cpa:track';

/** Event names whose properties are sent to the monitoring endpoint. `estimate_completed` is GTM-only (the API counts it). */
const GTM_ONLY: ReadonlySet<AnalyticsEvent['name']> = new Set(['estimate_completed']);

/** Disallowed property keys to ensure personal data is never forwarded to dataLayer. */
const PII_KEYS: ReadonlySet<string> = new Set([
    'name',
    'first_name',
    'last_name',
    'email',
    'phone',
    'mobile',
    'message',
    'text',
    'free_text',
    'content',
    'comment',
    'notes',
]);

/**
 * Checks whether visitor has granted analytics consent via the first-party `aacpa_consent` cookie.
 */
export function hasAnalyticsConsent(): boolean {
    if (typeof document === 'undefined') return false;
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const part of cookies) {
        const [k, ...v] = part.trim().split('=');
        if (k === 'aacpa_consent') {
            try {
                const parsed = JSON.parse(decodeURIComponent(v.join('=')));
                return Boolean(parsed?.c?.analytics);
            } catch {
                return false;
            }
        }
    }
    return false;
}

/**
 * Sanitizes an event properties dictionary, removing any accidental PII fields.
 */
export function sanitizeAnalyticsPayload(properties: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(properties)) {
        if (!PII_KEYS.has(key.toLowerCase()) && value !== undefined) {
            clean[key] = value;
        }
    }
    return clean;
}

declare global {
    interface Window {
        dataLayer?: unknown[];
    }
}

/** Fire-and-forget; safe to call on the server (does nothing) and never throws. */
export function track<E extends AnalyticsEvent>(name: E['name'], properties: E['properties']): void {
    if (typeof window === 'undefined') return;

    // 1. Dispatch custom event for MonitoringReporter (unless GTM-only)
    if (!GTM_ONLY.has(name)) {
        try {
            window.dispatchEvent(new CustomEvent<AnalyticsDetail>(ANALYTICS_EVENT, { detail: { name, properties } }));
        } catch {
            /* analytics must never break a page */
        }
    }

    // 2. Forward to window.dataLayer ONLY when analytics consent is granted
    if (hasAnalyticsConsent()) {
        try {
            window.dataLayer = window.dataLayer || [];
            const sanitized = sanitizeAnalyticsPayload(properties as Record<string, unknown>);
            window.dataLayer.push({
                event: name,
                ...sanitized,
            });
        } catch {
            /* dataLayer dispatch must never break a page */
        }
    }
}
