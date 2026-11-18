import { GUARDS_METADATA } from '@nestjs/common/constants';
import { MonitoringBatchSchema, PermissionEnum } from '@repo/shared';
import { PERMISSIONS_KEY } from '@/auth/decorators/permissions.decorator';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { MonitoringController } from './monitoring.controller';

const proto = MonitoringController.prototype;
const guardsOf = (handler: unknown) => (Reflect.getMetadata(GUARDS_METADATA, handler as never) ?? []) as unknown[];

describe('MonitoringController authorization (MUK-471)', () => {
    // Every READ endpoint exposes error messages, stack traces, URLs and traffic data.
    const readHandlers = ['getOverview', 'getMetrics', 'getEvents', 'getErrors', 'getErrorDetail'] as const;

    it.each(readHandlers)('%s requires login AND the MonitoringView permission', (name) => {
        const handler = proto[name];
        expect(guardsOf(handler)).toEqual(expect.arrayContaining([AuthGuard, PermissionsGuard]));
        expect(Reflect.getMetadata(PERMISSIONS_KEY, handler)).toEqual([PermissionEnum.MonitoringView]);
    });

    it('covers every GET handler, so a new read endpoint cannot be added unprotected', () => {
        const getters = Object.getOwnPropertyNames(proto).filter(
            (n) => n !== 'constructor' && Reflect.getMetadata('method', (proto as never)[n]) === 0,
        );
        expect(getters.sort()).toEqual([...readHandlers].sort());
    });

    it('keeps the ingestion endpoint public (anonymous visitors report their web vitals)', () => {
        expect(guardsOf(proto.ingest)).toEqual([]);
        expect(Reflect.getMetadata(PERMISSIONS_KEY, proto.ingest)).toBeUndefined();
    });
});

// The web app's MonitoringReporter (apps/web/src/monitoring/MonitoringReporter.tsx) builds these
// payloads. The web app has no test runner, so its contract with the API is pinned here.
describe('web reporter payload contract (MUK-471)', () => {
    const now = Date.now();
    const base = {
        sessionId: '3f6c1d0e-5b7a-4c9e-8a21-0d4f9b6e7c11',
        userAgent: 'Mozilla/5.0',
        viewport: { width: 1280, height: 720 },
    };

    it('accepts a full batch: standard vitals, a custom metric, an error, an unhandled rejection and a page view', () => {
        const result = MonitoringBatchSchema.safeParse({
            ...base,
            metrics: [
                { type: 'LCP', name: 'LCP', value: 2400.5, rating: 'good', page: '/en', timestamp: now },
                { type: 'CLS', name: 'CLS', value: 0.02, rating: 'needs-improvement', page: '/en', timestamp: now },
                // FCP is not one of the schema's standard types, so the reporter sends it as "custom".
                { type: 'custom', name: 'FCP', value: 900, page: '/en', timestamp: now },
            ],
            errors: [
                { type: 'error', message: 'x is not defined', stack: 'ReferenceError...', context: { line: 3, column: 9 }, page: '/ar', timestamp: now },
                { type: 'unhandledrejection', message: 'boom', context: {}, page: '/ar', timestamp: now },
            ],
            events: [{ type: 'pageview', name: 'pageview', page: '/en/news', timestamp: now }],
        });
        expect(result.success).toBe(true);
    });

    it('accepts a page-view-only batch and an errors-only batch (omitted arrays are fine)', () => {
        expect(MonitoringBatchSchema.safeParse({ ...base, events: [{ type: 'pageview', name: 'pageview', page: '/', timestamp: now }] }).success).toBe(true);
        expect(
            MonitoringBatchSchema.safeParse({
                ...base,
                errors: [{ type: 'error', message: 'm', context: {}, page: '/', timestamp: now }],
            }).success,
        ).toBe(true);
    });

    it('rejects what the reporter must never send', () => {
        const metric = { type: 'LCP', name: 'LCP', value: 1, page: '/', timestamp: now };
        expect(MonitoringBatchSchema.safeParse({ ...base }).success).toBe(false); // empty batch
        expect(MonitoringBatchSchema.safeParse({ ...base, metrics: [{ ...metric, type: 'FCP' }] }).success).toBe(false);
        expect(MonitoringBatchSchema.safeParse({ ...base, metrics: [{ ...metric, value: Infinity }] }).success).toBe(false);
        expect(MonitoringBatchSchema.safeParse({ ...base, metrics: Array.from({ length: 51 }, () => metric) }).success).toBe(false);
        expect(MonitoringBatchSchema.safeParse({ ...base, sessionId: 'not-a-uuid', metrics: [metric] }).success).toBe(false);
    });

    it('enforces the length caps the reporter truncates to (message 1000, stack 5000, page 500, name 100)', () => {
        const ok = (over: Record<string, unknown>) =>
            MonitoringBatchSchema.safeParse({
                ...base,
                errors: [{ type: 'error', message: 'm', context: {}, page: '/', timestamp: now, ...over }],
            }).success;
        expect(ok({ message: 'a'.repeat(1000) })).toBe(true);
        expect(ok({ message: 'a'.repeat(1001) })).toBe(false);
        expect(ok({ stack: 'a'.repeat(5000) })).toBe(true);
        expect(ok({ stack: 'a'.repeat(5001) })).toBe(false);
        expect(ok({ page: '/' + 'a'.repeat(499) })).toBe(true);
        expect(ok({ page: '/' + 'a'.repeat(500) })).toBe(false);
    });
});
