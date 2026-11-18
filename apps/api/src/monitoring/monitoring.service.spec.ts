import { MonitoringService } from './monitoring.service';

type Row = { id: string; period: string; periodKey: string; type: string; count: number; p50: number; p75: number; p90: number; min: number; max: number };
const keyOf = (w: { period: string; periodKey: string; type: string }) => `${w.period}|${w.periodKey}|${w.type}`;

/** A tiny in-memory stand-in for the rollup table with the same semantics the service relies on. */
function fakeRollupTable() {
    const rows = new Map<string, Row>();
    let nextId = 1;
    const api = {
        findUnique: jest.fn(async ({ where }: { where: { period_periodKey_type: Row } }) => {
            const found = rows.get(keyOf(where.period_periodKey_type));
            return found ? { ...found } : null;
        }),
        create: jest.fn(async ({ data }: { data: Omit<Row, 'id'> }) => {
            const key = keyOf(data);
            if (rows.has(key)) throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
            rows.set(key, { id: `row-${nextId++}`, ...data });
            return rows.get(key);
        }),
        updateMany: jest.fn(async ({ where, data }: { where: { id: string; count: number }; data: Partial<Row> }) => {
            const row = [...rows.values()].find((r) => r.id === where.id);
            if (!row || row.count !== where.count) return { count: 0 };
            Object.assign(row, data);
            return { count: 1 };
        }),
    };
    return { api, rows };
}

const SESSION = '11111111-1111-4111-8111-111111111111';
const HOUR = Date.UTC(2026, 10, 9, 14, 5, 0); // 2026-11-09 14:05 UTC
const metric = (value: number, type = 'LCP', timestamp = HOUR) => ({
    type, name: type, value, page: '/en', timestamp,
});

describe('MonitoringService metric rollups (MUK-471)', () => {
    let table: ReturnType<typeof fakeRollupTable>;
    let tx: { monitoringMetric: { createMany: jest.Mock } };
    let prisma: Record<string, unknown>;
    let service: MonitoringService;

    beforeEach(() => {
        table = fakeRollupTable();
        tx = { monitoringMetric: { createMany: jest.fn().mockResolvedValue({}) } };
        prisma = {
            monitoringMetricRollup: table.api,
            $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
        };
        service = new MonitoringService(prisma as never);
    });

    const batch = (metrics: ReturnType<typeof metric>[]) => ({
        sessionId: SESSION, viewport: { width: 1280, height: 720 }, metrics,
    });
    const hourly = (type = 'LCP') => table.rows.get(`hourly|2026-11-09T14:00:00|${type}`)!;
    const daily = (type = 'LCP') => table.rows.get(`daily|2026-11-09|${type}`)!;

    it('creates the hourly and daily rollups from the first batch', async () => {
        await service.ingest(batch([metric(100), metric(200), metric(300)]) as never);
        for (const row of [hourly(), daily()]) {
            expect(row).toMatchObject({ count: 3, min: 100, max: 300 });
        }
    });

    it('REGRESSION: a later batch no longer overwrites min/max/percentiles of earlier ones', async () => {
        // Batch 1: 100 values from 1000..2000 (a wide, slow spread).
        const first = Array.from({ length: 100 }, (_, i) => metric(1000 + i * 10));
        await service.ingest(batch(first) as never);
        const before = { ...hourly() };
        expect(before).toMatchObject({ count: 100, min: 1000, max: 1990 });

        // Batch 2: three fast, narrow values in the SAME hour.
        await service.ingest(batch([metric(1500), metric(1510), metric(1520)]) as never);
        const after = hourly();

        expect(after.count).toBe(103);
        expect(after.min).toBe(1000); // old code: 1500 (the latest batch's min)
        expect(after.max).toBe(1990); // old code: 1520
        // Percentiles stay close to the big batch instead of jumping to the 3-value batch.
        expect(Math.abs(after.p75 - before.p75)).toBeLessThan(50);
        expect(daily()).toMatchObject({ count: 103, min: 1000, max: 1990 });
    });

    it('keeps separate rollups per metric type and per hour', async () => {
        const nextHour = HOUR + 60 * 60 * 1000;
        await service.ingest(batch([metric(100, 'LCP'), metric(5, 'CLS'), metric(900, 'LCP', nextHour)]) as never);
        expect(hourly('LCP').count).toBe(1);
        expect(hourly('CLS').count).toBe(1);
        expect(table.rows.get('hourly|2026-11-09T15:00:00|LCP')!.count).toBe(1);
        expect(daily('LCP').count).toBe(2); // same day
    });

    it('retries when a concurrent ingest changed the row between our read and our write (compare-and-swap)', async () => {
        await service.ingest(batch([metric(100)]) as never);
        // Simulate another ingest committing right after our first read of the hourly row.
        let interfered = false;
        const realFind = table.api.findUnique.getMockImplementation()!;
        table.api.findUnique.mockImplementation(async (args) => {
            const found = await realFind(args);
            if (!interfered && found && args.where.period_periodKey_type.period === 'hourly') {
                interfered = true;
                const row = table.rows.get(keyOf(args.where.period_periodKey_type))!;
                row.count += 10; // the concurrent writer's batch
                row.max = 7777;
            }
            return found; // we still received the stale copy
        });

        await service.ingest(batch([metric(300)]) as never);

        expect(interfered).toBe(true);
        expect(hourly().count).toBe(12); // 1 + 10 (concurrent) + 1 (ours): nothing lost
        expect(hourly().max).toBe(7777);
    });

    it('merges into the row another ingest created first (unique violation on create)', async () => {
        const realCreate = table.api.create.getMockImplementation()!;
        let first = true;
        table.api.create.mockImplementation(async (args) => {
            if (first && args.data.period === 'hourly') {
                first = false;
                // The competing ingest wins the race and creates the row just before us.
                await realCreate({ data: { period: 'hourly', periodKey: '2026-11-09T14:00:00', type: 'LCP', count: 4, p50: 50, p75: 60, p90: 70, min: 40, max: 80 } });
            }
            return realCreate(args);
        });

        await service.ingest(batch([metric(100)]) as never);

        expect(hourly()).toMatchObject({ count: 5, min: 40, max: 100 });
    });

    it('gives up (and reports) after repeated lost races, without failing the visitor request', async () => {
        const logSpy = jest.spyOn((service as unknown as { logger: { error: jest.Mock } }).logger, 'error').mockImplementation();
        table.api.updateMany.mockResolvedValue({ count: 0 }); // every compare-and-swap loses
        await service.ingest(batch([metric(100)]) as never); // creates the rows
        await expect(service.ingest(batch([metric(200)]) as never)).resolves.toEqual({ received: 1 });
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ err: expect.any(Error) }), 'Failed to update the metric rollups');
    });

    it('stores the raw metrics in the transaction and updates rollups only after it commits', async () => {
        const order: string[] = [];
        (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (t: typeof tx) => unknown) => {
            const result = await fn(tx);
            order.push('transaction committed');
            return result;
        });
        table.api.findUnique.mockImplementationOnce(async () => {
            order.push('first rollup read');
            return null;
        });

        await service.ingest(batch([metric(100)]) as never);

        expect(tx.monitoringMetric.createMany).toHaveBeenCalledTimes(1);
        expect(order.indexOf('transaction committed')).toBeLessThan(order.indexOf('first rollup read'));
    });

    it('does not touch the rollups for a batch without metrics', async () => {
        const errorTx = { monitoringError: { createMany: jest.fn().mockResolvedValue({}) }, monitoringErrorRollup: { upsert: jest.fn() } };
        (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (t: typeof errorTx) => unknown) => fn(errorTx));
        await service.ingest({
            sessionId: SESSION, viewport: { width: 1, height: 1 },
            errors: [{ type: 'error', message: 'boom', context: {}, page: '/', timestamp: HOUR }],
        } as never);
        expect(table.api.findUnique).not.toHaveBeenCalled();
        expect(errorTx.monitoringErrorRollup.upsert).toHaveBeenCalled();
    });
});
