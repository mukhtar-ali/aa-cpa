import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async getStats() {
        const today = new Date().toISOString().slice(0, 10);
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

        const [
            totalUsers,
            totalServices,
            publishedServices,
            totalSectors,
            publishedSectors,
            totalNews,
            publishedNews,
            totalJobs,
            publishedJobs,
            pendingApplications,
            newContactSubmissions,
            newLeads7d,
            applications7d,
            failedOutbox,
            pageviewsToday,
            errorsToday,
            pageviewsTrend,
            recentContacts,
            recentApplications,
            recentNews,
            recentJobs,
        ] = await Promise.all([
            this.prisma.user.count({ where: { isDeleted: false } }),
            this.prisma.service?.count ? this.prisma.service.count({ where: { isDeleted: false } }) : Promise.resolve(0),
            this.prisma.service?.count ? this.prisma.service.count({ where: { isDeleted: false, isPublished: true } }) : Promise.resolve(0),
            this.prisma.sector?.count ? this.prisma.sector.count({ where: { isDeleted: false } }) : Promise.resolve(0),
            this.prisma.sector?.count ? this.prisma.sector.count({ where: { isDeleted: false, isPublished: true } }) : Promise.resolve(0),
            this.prisma.news.count({ where: { isDeleted: false } }),
            this.prisma.news.count({ where: { isDeleted: false, isPublished: true } }),
            this.prisma.job.count({ where: { isDeleted: false } }),
            this.prisma.job.count({ where: { isDeleted: false, isPublished: true } }),
            this.prisma.jobApplication.count({ where: { status: 'pending' } }),
            this.prisma.contact.count({ where: { isDeleted: false, status: 'new' } }),
            this.prisma.contact.count({
                where: { isDeleted: false, createdAt: { gte: sevenDaysAgo } },
            }),
            this.prisma.jobApplication.count({
                where: { createdAt: { gte: sevenDaysAgo } },
            }),
            this.prisma.emailOutbox?.count ? this.prisma.emailOutbox.count({ where: { status: 'failed' } }) : Promise.resolve(0),
            this.prisma.monitoringEventRollup.findFirst({
                where: { name: 'pageview', period: 'daily', periodKey: today },
                select: { count: true },
            }),
            this.prisma.monitoringErrorRollup.aggregate({
                where: { period: 'daily', periodKey: today },
                _sum: { count: true },
            }),
            this.getPageviewsTrend(),
            this.prisma.contact.findMany({
                where: { isDeleted: false },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, fullName: true, createdAt: true },
            }),
            this.prisma.jobApplication.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    createdAt: true,
                    job: {
                        select: {
                            translations: {
                                where: { language: 'ar' },
                                select: { title: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.news.findMany({
                where: { isDeleted: false },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    slug: true,
                    isPublished: true,
                    updatedAt: true,
                    translations: {
                        where: { language: 'ar' },
                        select: { title: true },
                    },
                },
            }),
            this.prisma.job.findMany({
                where: { isDeleted: false },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    slug: true,
                    isPublished: true,
                    updatedAt: true,
                    translations: {
                        where: { language: 'ar' },
                        select: { title: true },
                    },
                },
            }),
        ]);

        const recentActivity = [
            ...recentContacts.map((c) => ({
                id: c.id,
                type: 'contact' as const,
                label: c.fullName,
                subLabel: 'Contact submission',
                createdAt: c.createdAt.toISOString(),
            })),
            ...recentApplications.map((a: any) => ({
                id: a.id,
                type: 'application' as const,
                label: a.fullName ?? (a.firstName ? `${a.firstName} ${a.lastName ?? ''}`.trim() : 'Applicant'),
                subLabel: a.job?.translations?.[0]?.title ?? 'a job posting',
                createdAt: a.createdAt.toISOString(),
            })),
        ]
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, 8);

        const mapContentItem = (item: {
            id: string;
            slug: string | null;
            isPublished: boolean;
            updatedAt: Date;
            translations: { title: string }[];
        }) => ({
            id: item.id,
            title: item.translations[0]?.title ?? item.slug ?? 'Untitled',
            isPublished: item.isPublished,
            updatedAt: item.updatedAt.toISOString(),
        });

        return {
            users: { total: totalUsers },
            services: { total: totalServices, published: publishedServices, draft: totalServices - publishedServices },
            sectors: { total: totalSectors, published: publishedSectors, draft: totalSectors - publishedSectors },
            news: { total: totalNews, published: publishedNews, draft: totalNews - publishedNews },
            jobs: { total: totalJobs, published: publishedJobs, draft: totalJobs - publishedJobs, pendingApplications },
            leads: { total: newContactSubmissions, new7d: newLeads7d },
            applications: { total: pendingApplications, new7d: applications7d },
            outbox: { failed: failedOutbox },
            contact: { new: newContactSubmissions },
            activity: {
                pageviewsToday: pageviewsToday?.count ?? 0,
                errorsToday: errorsToday._sum.count ?? 0,
            },
            pageviewsTrend,
            recentActivity,
            contentByType: [
                { type: 'news' as const, total: totalNews, published: publishedNews },
                { type: 'jobs' as const, total: totalJobs, published: publishedJobs },
            ],
            recentContent: {
                news: recentNews.map(mapContentItem),
                jobs: recentJobs.map(mapContentItem),
            },
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
