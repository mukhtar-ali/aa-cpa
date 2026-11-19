'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { endpoint } from '@repo/shared';

/**
 * Sends Core Web Vitals, uncaught errors and page views to the API's anonymous ingestion endpoint
 * (POST /api/monitoring, one batch of { metrics, errors, events }) so the admin's Monitoring screens
 * have data. It is deliberately small and defensive:
 *  - it does nothing when the visitor sends Do Not Track / Global Privacy Control, or when
 *    NEXT_PUBLIC_MONITORING_ENABLED is "false";
 *  - it only ever sends the page PATH (no query string or hash), a random per-tab session id
 *    (sessionStorage, never a cookie) and the user agent the browser sends with every request anyway;
 *  - it is bounded (per-batch caps, an error budget per session, de-duplicated errors) and its own
 *    network failures are swallowed, never reported or retried in a loop.
 */

const INGEST_URL = `${process.env.NEXT_PUBLIC_API_URL ?? ''}${endpoint.monitoring.ingest}`;
const FLUSH_INTERVAL_MS = 10_000;
const MAX_PER_BATCH = 50; // the API accepts at most 50 of each kind per request
const MAX_QUEUED = 200; // hard cap on what is held in memory between flushes
const MAX_ERRORS_PER_SESSION = 20;
const KEEPALIVE_MAX_BYTES = 60_000; // browsers cap keepalive request bodies at about 64 KB
const SESSION_KEY = 'monitoring_session_id';
const STANDARD_VITALS = new Set(['LCP', 'FID', 'CLS', 'TTFB', 'INP']);

type Rating = 'good' | 'needs-improvement' | 'poor';
type MetricItem = { type: string; name: string; value: number; rating?: Rating; page: string; timestamp: number };
type ErrorItem = {
    type: 'error' | 'unhandledrejection';
    message: string;
    stack?: string;
    context: Record<string, unknown>;
    page: string;
    timestamp: number;
};
type EventItem = { type: 'pageview'; name: 'pageview'; page: string; timestamp: number };

const queue = { metrics: [] as MetricItem[], errors: [] as ErrorItem[], events: [] as EventItem[] };
const seenErrors = new Set<string>();
let errorsSent = 0;

function isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    if (process.env.NEXT_PUBLIC_MONITORING_ENABLED === 'false') return false;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    return nav.doNotTrack !== '1' && nav.globalPrivacyControl !== true;
}

const truncate = (value: string, max: number) => (value.length > max ? value.slice(0, max) : value);
const currentPage = () => truncate(window.location.pathname || '/', 500);

function getSessionId(): string {
    try {
        let id = sessionStorage.getItem(SESSION_KEY);
        if (!id) {
            id = crypto.randomUUID();
            sessionStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        // Storage unavailable (private mode / blocked): a throwaway id for this page load.
        return crypto.randomUUID();
    }
}

function push<T>(list: T[], item: T) {
    if (list.length < MAX_QUEUED) list.push(item);
}

function handleVital(metric: { name: string; value: number; rating?: string }) {
    if (!isEnabled() || !Number.isFinite(metric.value)) return;
    const standard = STANDARD_VITALS.has(metric.name);
    const rating = metric.rating === 'good' || metric.rating === 'needs-improvement' || metric.rating === 'poor' ? metric.rating : undefined;
    push(queue.metrics, {
        type: standard ? metric.name : 'custom',
        name: truncate(metric.name, 100),
        value: metric.value,
        ...(rating ? { rating } : {}),
        page: currentPage(),
        timestamp: Date.now(),
    });
}

function recordError(type: ErrorItem['type'], message: string, stack: string | undefined, context: Record<string, unknown>) {
    // Check capacity BEFORE spending the session budget, so a full queue doesn't use up error slots.
    if (errorsSent >= MAX_ERRORS_PER_SESSION || queue.errors.length >= MAX_QUEUED) return;
    const page = currentPage();
    const dedupeKey = `${type}|${page}|${message}`;
    if (seenErrors.has(dedupeKey)) return;
    seenErrors.add(dedupeKey);
    errorsSent += 1;
    push(queue.errors, {
        type,
        message: truncate(message || 'Unknown error', 1000),
        ...(stack ? { stack: truncate(stack, 5000) } : {}),
        context,
        page,
        timestamp: Date.now(),
    });
}

function onWindowError(event: ErrorEvent) {
    if (!isEnabled()) return;
    recordError('error', event.message, event.error instanceof Error ? event.error.stack : undefined, {
        line: event.lineno,
        column: event.colno,
    });
}

function onUnhandledRejection(event: PromiseRejectionEvent) {
    if (!isEnabled()) return;
    const reason = event.reason;
    recordError(
        'unhandledrejection',
        reason instanceof Error ? reason.message : String(reason),
        reason instanceof Error ? reason.stack : undefined,
        {},
    );
}

function send(body: string) {
    // Fire and forget. keepalive lets the request outlive the page when flushed on unload (only
    // allowed for small bodies); failures are ignored on purpose.
    fetch(INGEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: body.length < KEEPALIVE_MAX_BYTES,
        credentials: 'omit',
    }).catch(() => undefined);
}

function flush() {
    if (!isEnabled()) return;
    const sessionId = getSessionId();
    const viewport = { width: Math.max(1, Math.round(window.innerWidth)), height: Math.max(1, Math.round(window.innerHeight)) };
    while (queue.metrics.length + queue.errors.length + queue.events.length > 0) {
        const metrics = queue.metrics.splice(0, MAX_PER_BATCH);
        const errors = queue.errors.splice(0, MAX_PER_BATCH);
        const events = queue.events.splice(0, MAX_PER_BATCH);
        send(
            JSON.stringify({
                sessionId,
                userAgent: truncate(navigator.userAgent, 500),
                viewport,
                ...(metrics.length ? { metrics } : {}),
                ...(errors.length ? { errors } : {}),
                ...(events.length ? { events } : {}),
            }),
        );
    }
}

export function MonitoringReporter() {
    const pathname = usePathname();

    useReportWebVitals(handleVital);

    useEffect(() => {
        if (!isEnabled()) return;
        push(queue.events, { type: 'pageview', name: 'pageview', page: truncate(pathname || '/', 500), timestamp: Date.now() });
    }, [pathname]);

    useEffect(() => {
        if (!isEnabled()) return;
        const onHidden = () => {
            if (document.visibilityState === 'hidden') flush();
        };
        const timer = window.setInterval(flush, FLUSH_INTERVAL_MS);
        window.addEventListener('error', onWindowError);
        window.addEventListener('unhandledrejection', onUnhandledRejection);
        document.addEventListener('visibilitychange', onHidden);
        window.addEventListener('pagehide', flush);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('error', onWindowError);
            window.removeEventListener('unhandledrejection', onUnhandledRejection);
            document.removeEventListener('visibilitychange', onHidden);
            window.removeEventListener('pagehide', flush);
        };
    }, []);

    return null;
}
