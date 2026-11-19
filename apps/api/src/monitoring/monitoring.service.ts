import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { mergeRollupStats, summarizeValues, type RollupStats } from './rollup-stats';
import {
    MonitoringBatchModel,
    MonitoringMetricsQueryModel,
    MonitoringEventsQueryModel,
    MonitoringErrorsQueryModel,
} from '@repo/shared';

// Max attempts for the optimistic (compare-and-swap) rollup update when concurrent ingests race.
const ROLLUP_MAX_ATTEMPTS = 5;

@Injectable()
export class MonitoringService {
    private readonly logger = new Logger(MonitoringService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ============= Ingestion =============

    async ingest(data: MonitoringBatchModel): Promise<{ received: number }> {
        const { sessionId, metrics, errors, events } = data;
        let received = 0;

        await this.prisma.$transaction(async (tx) => {
            if (metrics?.length) {
                await tx.monitoringMetric.createMany({
                    data: metrics.map((m) => ({
                        sessionId,
                        type: m.type,
                        name: m.name,
                        value: m.value,
                        rating: m.rating,
                        page: m.page,
                        timestamp: new Date(m.timestamp),
                    })),
                    skipDuplicates: true,
                });
                received += metrics.length;
            }

            if (errors?.length) {
                await tx.monitoringError.createMany({
                    data: errors.map((e) => ({
                        sessionId,
                        type: e.type,
                        message: e.message,
                        stack: e.stack,
                        context: JSON.stringify(e.context ?? {}),
                        page: e.page,
                        timestamp: new Date(e.timestamp),
                    })),
                    skipDuplicates: true,
                });
                received += errors.length;

                await this.updateErrorRollups(tx, errors);
            }

            if (events?.length) {
                await tx.monitoringEvent.createMany({
                    data: events.map((e) => ({
                        sessionId,
                        type: e.type,
                        name: e.name,
                        properties: e.properties ? JSON.stringify(e.properties) : null,
                        page: e.page,
                        timestamp: new Date(e.timestamp),
                    })),
                    skipDuplicates: true,
                });
                received += events.length;

                await this.updateEventRollups(tx, events);
            }
        });

        // Metric rollups are merged AFTER the raw rows are committed, outside the transaction: the merge
        // is a read-then-compare-and-swap that must see other ingests' committed rows (inside a
        // REPEATABLE READ transaction its retries would keep reading the same stale snapshot). A rollup
        // failure must not lose the raw metrics or fail the visitor's request, so it is only logged.
        if (metrics?.length) {
            try {
                await this.updateMetricRollups(metrics);
            } catch (err) {
                this.logger.error({ err }, 'Failed to update the metric rollups');
            }
        }

        return { received };
    }

    // ============= Rollup helpers =============

    private getPeriodKey(ts: number, period: 'hourly' | 'daily'): string {
        const d = new Date(ts);
        if (period === 'hourly') {
            return d.toISOString().slice(0, 13) + ':00:00';
        }
        return d.toISOString().slice(0, 10);
    }

    private async updateMetricRollups(metrics: MonitoringBatchModel['metrics'] & object[]) {
        const periods: ('hourly' | 'daily')[] = ['hourly', 'daily'];
        for (const period of periods) {
            const grouped = new Map<string, number[]>();
            for (const m of metrics) {
                const key = `${this.getPeriodKey(m.timestamp, period)}__${m.type}`;
                if (!grouped.has(key)) grouped.set(key, []);
                grouped.get(key)!.push(m.value);
            }

            for (const [key, values] of grouped) {
                const [periodKey, type] = key.split('__');
                await this.mergeIntoMetricRollup(period, periodKey, type, summarizeValues(values));
            }
        }
    }

    /**
     * Adds a batch to the (period, periodKey, type) rollup row without clobbering what is already there.
     * Optimistic concurrency: the row is only updated if its `count` still equals the value we read, so
     * two concurrent ingests can't silently overwrite each other; the loser re-reads and retries.
     */
    async mergeIntoMetricRollup(period: string, periodKey: string, type: string, batch: RollupStats) {
        const where = { period_periodKey_type: { period, periodKey, type } };
        for (let attempt = 0; attempt < ROLLUP_MAX_ATTEMPTS; attempt++) {
            const existing = await this.prisma.monitoringMetricRollup.findUnique({ where });

            if (!existing) {
                try {
                    await this.prisma.monitoringMetricRollup.create({ data: { period, periodKey, type, ...batch } });
                    return;
                } catch (err) {
                    // Another ingest created the row first (unique violation): re-read it and merge.
                    if ((err as { code?: string }).code === 'P2002') continue;
                    throw err;
                }
            }

            const merged = mergeRollupStats(existing, batch);
            const { count: updated } = await this.prisma.monitoringMetricRollup.updateMany({
                where: { id: existing.id, count: existing.count },
                data: merged,
            });
            if (updated === 1) return;
        }
        throw new Error(`Could not update the ${period} ${periodKey} ${type} rollup after ${ROLLUP_MAX_ATTEMPTS} attempts`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async updateErrorRollups(tx: any, errors: MonitoringBatchModel['errors'] & object[]) {
        const periods: ('hourly' | 'daily')[] = ['hourly', 'daily'];
        for (const period of periods) {
            const grouped = new Map<string, number>();
            for (const e of errors) {
                const key = `${this.getPeriodKey(e.timestamp, period)}__${e.type}`;
                grouped.set(key, (grouped.get(key) ?? 0) + 1);
            }

            for (const [key, count] of grouped) {
                const [periodKey, type] = key.split('__');
                await tx.monitoringErrorRollup.upsert({
                    where: { period_periodKey_type: { period, periodKey, type } },
                    create: { period, periodKey, type, count },
                    update: { count: { increment: count } },
                });
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async updateEventRollups(tx: any, events: MonitoringBatchModel['events'] & object[]) {
        const periods: ('hourly' | 'daily')[] = ['hourly', 'daily'];
        for (const period of periods) {
            const grouped = new Map<string, number>();
            for (const e of events) {
                const key = `${this.getPeriodKey(e.timestamp, period)}__${e.name}`;
                grouped.set(key, (grouped.get(key) ?? 0) + 1);
            }

            for (const [key, count] of grouped) {
                const [periodKey, name] = key.split('__');
                await tx.monitoringEventRollup.upsert({
                    where: { period_periodKey_name: { period, periodKey, name } },
                    create: { period, periodKey, name, count },
                    update: { count: { increment: count } },
                });
            }
        }
    }

    // ============= Query =============

    async getOverview() {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        const metricTypes = ['LCP', 'FID', 'CLS', 'TTFB', 'INP'] as const;

        const [metricsData, errorsToday, errorsYesterday, pageviewsToday, pageviewsYesterday] =
            await Promise.all([
                Promise.all(
                    metricTypes.map((type) =>
                        this.prisma.monitoringMetricRollup.findFirst({
                            where: { type, period: 'daily' },
                            orderBy: { periodKey: 'desc' },
                        }),
                    ),
                ),
                this.prisma.monitoringErrorRollup.aggregate({
                    where: { period: 'daily', periodKey: today },
                    _sum: { count: true },
                }),
                this.prisma.monitoringErrorRollup.aggregate({
                    where: { period: 'daily', periodKey: yesterday },
                    _sum: { count: true },
                }),
                this.prisma.monitoringEventRollup.findFirst({
                    where: { name: 'pageview', period: 'daily', periodKey: today },
                    select: { count: true },
                }),
                this.prisma.monitoringEventRollup.findFirst({
                    where: { name: 'pageview', period: 'daily', periodKey: yesterday },
                    select: { count: true },
                }),
            ]);

        const metrics = {
            lcp_p75: metricsData[0]?.p75 ?? null,
            fid_p75: metricsData[1]?.p75 ?? null,
            cls_p75: metricsData[2]?.p75 ?? null,
            ttfb_p75: metricsData[3]?.p75 ?? null,
            inp_p75: metricsData[4]?.p75 ?? null,
        };

        const todayErrors = errorsToday._sum?.count ?? 0;
        const yestErrors = errorsYesterday._sum?.count ?? 0;
        const errorsTrend = yestErrors > 0 ? Math.round(((todayErrors - yestErrors) / yestErrors) * 100) : 0;

        const todayPageviews = pageviewsToday?.count ?? 0;
        const yestPageviews = pageviewsYesterday?.count ?? 0;
        const pageviewsTrend =
            yestPageviews > 0 ? Math.round(((todayPageviews - yestPageviews) / yestPageviews) * 100) : 0;

        return {
            metrics,
            errors: { today: todayErrors, trend: errorsTrend },
            pageviews: { today: todayPageviews, trend: pageviewsTrend },
        };
    }

    async getMetrics(query: MonitoringMetricsQueryModel) {
        const { period, type, days } = query;
        const { start, end } = this.getDateRange(days);

        const where: Record<string, unknown> = { period };
        if (start && end) where.periodKey = { gte: start, lte: end };
        if (type !== 'all') where.type = type;

        const rollups = await this.prisma.monitoringMetricRollup.findMany({
            where,
            orderBy: { periodKey: 'asc' },
        });

        return rollups.map((r) => ({
            periodKey: r.periodKey,
            type: r.type,
            count: r.count,
            p50: r.p50,
            p75: r.p75,
            p90: r.p90,
            min: r.min,
            max: r.max,
        }));
    }

    async getEvents(query: MonitoringEventsQueryModel) {
        const { period, name, days } = query;
        const { start, end } = this.getDateRange(days);

        const where: Record<string, unknown> = { period };
        if (start && end) where.periodKey = { gte: start, lte: end };
        if (name !== '*') where.name = name;

        const rollups = await this.prisma.monitoringEventRollup.findMany({
            where,
            orderBy: { periodKey: 'asc' },
        });

        return rollups.map((r) => ({ periodKey: r.periodKey, name: r.name, count: r.count }));
    }

    async getErrors(query: MonitoringErrorsQueryModel) {
        const { type, page, limit } = query;
        const where: Record<string, unknown> = {};
        if (type !== 'all') where.type = type;

        const [total, errors] = await Promise.all([
            this.prisma.monitoringError.count({ where }),
            this.prisma.monitoringError.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return {
            data: errors.map((e) => ({
                id: e.id,
                type: e.type,
                message: e.message,
                page: e.page,
                timestamp: e.timestamp.toISOString(),
                createdAt: e.createdAt.toISOString(),
                context: e.context ? JSON.parse(e.context) : null,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getErrorDetail(id: string) {
        const error = await this.prisma.monitoringError.findUnique({ where: { id } });
        if (!error) throw new NotFoundException('Error not found');

        return {
            id: error.id,
            type: error.type,
            message: error.message,
            stack: error.stack,
            page: error.page,
            timestamp: error.timestamp.toISOString(),
            createdAt: error.createdAt.toISOString(),
            sessionId: error.sessionId,
            context: error.context ? JSON.parse(error.context) : null,
        };
    }

    // ============= Helpers =============

    private getDateRange(days: number): { start: string; end: string } {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return {
            end: end.toISOString().slice(0, 10),
            start: start.toISOString().slice(0, 10),
        };
    }
}
