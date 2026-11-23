/**
 * Typed product events (contracts/web-endpoints.md "Analytics events"). In 003 they only reach the monitoring
 * endpoint, through MonitoringReporter (which owns consent checks, batching and the session id); 004 also forwards
 * them to GTM with consent. No names, emails, phones, free text or exact estimate values may appear in properties.
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

/** Fire-and-forget; safe to call on the server (does nothing) and never throws. */
export function track<E extends AnalyticsEvent>(name: E['name'], properties: E['properties']): void {
    if (typeof window === 'undefined' || GTM_ONLY.has(name)) return;
    try {
        window.dispatchEvent(new CustomEvent<AnalyticsDetail>(ANALYTICS_EVENT, { detail: { name, properties } }));
    } catch {
        /* analytics must never break a page */
    }
}
