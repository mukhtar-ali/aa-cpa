import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

/** Core-starter dashboard: user count plus today's monitoring numbers and a 7-day pageview trend. */
@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async getStats() {
        const today = new Date().toISOString().slice(0, 10);

        const [totalUsers, pageviewsToday, errorsToday, pageviewsTrend] = await Promise.all([
            this.prisma.user.count({ where: { isDeleted: false } }),
            this.prisma.monitoringEventRollup.findFirst({
                where: { name: 'pageview', period: 'daily', periodKey: today },
                select: { count: true },
            }),
            this.prisma.monitoringErrorRollup.aggregate({
                where: { period: 'daily', periodKey: today },
                _sum: { count: true },
            }),
            this.getPageviewsTrend(),
        ]);

        return {
            users: { total: totalUsers },
            activity: {
                pageviewsToday: pageviewsToday?.count ?? 0,
                errorsToday: errorsToday._sum.count ?? 0,
            },
            pageviewsTrend,
        };
    }

    private async getPageviewsTrend(): Promise<{ date: string; count: number }[]> {
        const days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(Date.now() - (6 - i) * 86400000);
            return d.toISOString().slice(0, 10);
        });
        const rollups = await this.prisma.monitoringEventRollup.findMany({
            where: { name: 'pageview', period: 'daily', periodKey: { in: days } },
            select: { periodKey: true, count: true },
        });
        const byDay = new Map(rollups.map((r) => [r.periodKey, r.count]));
        return days.map((date) => ({ date, count: byDay.get(date) ?? 0 }));
    }
}
