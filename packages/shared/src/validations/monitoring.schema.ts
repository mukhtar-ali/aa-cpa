import { z } from 'zod';

export const MonitoringMetricItemSchema = z.object({
    type: z.enum(['LCP', 'FID', 'CLS', 'TTFB', 'INP', 'custom']),
    name: z.string().max(100),
    value: z.number().finite(),
    rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
    page: z.string().max(500),
    timestamp: z.number().int().positive(),
});

export const MonitoringErrorItemSchema = z.object({
    type: z.enum(['error', 'unhandledrejection', 'api']),
    message: z.string().max(1000),
    stack: z.string().max(5000).optional(),
    context: z.record(z.string(), z.unknown()),
    page: z.string().max(500),
    timestamp: z.number().int().positive(),
});

export const MonitoringEventItemSchema = z.object({
    type: z.enum(['pageview', 'event']),
    name: z.string().max(100),
    properties: z.record(z.string(), z.unknown()).optional(),
    page: z.string().max(500),
    timestamp: z.number().int().positive(),
});

export const MonitoringBatchSchema = z
    .object({
        sessionId: z.string().uuid('Invalid session ID format'),
        userAgent: z.string().max(500).optional(),
        viewport: z.object({
            width: z.number().int().positive().max(10000),
            height: z.number().int().positive().max(10000),
        }),
        metrics: z.array(MonitoringMetricItemSchema).max(50).optional(),
        errors: z.array(MonitoringErrorItemSchema).max(50).optional(),
        events: z.array(MonitoringEventItemSchema).max(50).optional(),
    })
    .refine(
        (data) =>
            (data.metrics?.length ?? 0) + (data.errors?.length ?? 0) + (data.events?.length ?? 0) > 0,
        { message: 'At least one of metrics, errors, or events must be provided' },
    );

export const MonitoringMetricsQuerySchema = z.object({
    period: z.enum(['hourly', 'daily']).default('daily'),
    type: z.enum(['LCP', 'FID', 'CLS', 'TTFB', 'INP', 'all']).default('all'),
    days: z.coerce.number().int().min(1).max(30).default(7),
});

export const MonitoringEventsQuerySchema = z.object({
    period: z.enum(['hourly', 'daily']).default('daily'),
    name: z.string().default('pageview'),
    days: z.coerce.number().int().min(1).max(30).default(7),
});

export const MonitoringErrorsQuerySchema = z.object({
    type: z.enum(['error', 'unhandledrejection', 'api', 'all']).default('all'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type MonitoringBatchModel = z.infer<typeof MonitoringBatchSchema>;
export type MonitoringMetricsQueryModel = z.infer<typeof MonitoringMetricsQuerySchema>;
export type MonitoringEventsQueryModel = z.infer<typeof MonitoringEventsQuerySchema>;
export type MonitoringErrorsQueryModel = z.infer<typeof MonitoringErrorsQuerySchema>;
