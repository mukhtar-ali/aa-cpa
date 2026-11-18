import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async getStats() {
        const today = new Date().toISOString().slice(0, 10);

        const [
            totalUsers,
            totalProjects,
            publishedProjects,
            totalNews,
            publishedNews,
            totalJobs,
            publishedJobs,
            pendingApplications,
            openInquiries,
            newContactSubmissions,
            pageviewsToday,
            errorsToday,
            pageviewsTrend,
            recentContacts,
            recentApplications,
            recentInquiries,
            recentProjects,
            recentNews,
            recentJobs,
        ] = await Promise.all([
            this.prisma.user.count({ where: { isDeleted: false } }),
            this.prisma.project.count({ where: { isDeleted: false } }),
            this.prisma.project.count({ where: { isDeleted: false, isPublished: true } }),
            this.prisma.news.count({ where: { isDeleted: false } }),
            this.prisma.news.count({ where: { isDeleted: false, isPublished: true } }),
            this.prisma.job.count({ where: { isDeleted: false } }),
            this.prisma.job.count({ where: { isDeleted: false, isPublished: true } }),
            this.prisma.jobApplication.count({ where: { status: 'pending' } }),
            this.prisma.inquiry.count({ where: { isDeleted: false } }),
            this.prisma.contact.count({ where: { isDeleted: false, status: 'new' } }),
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
                select: { id: true, fullName: true, subject: true, createdAt: true },
            }),
            this.prisma.jobApplication.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, firstName: true, lastName: true, createdAt: true, job: { select: { translations: { where: { language: 'en' }, select: { title: true } } } } },
            }),
            this.prisma.inquiry.findMany({
                where: { isDeleted: false },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, fullName: true, projectName: true, createdAt: true },
            }),
            this.prisma.project.findMany({
                where: { isDeleted: false },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: {
                    id: true, slug: true, isPublished: true, updatedAt: true,
                    translations: { where: { language: 'en' }, select: { title: true } },
                },
            }),
            this.prisma.news.findMany({
                where: { isDeleted: false },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: {
                    id: true, slug: true, isPublished: true, updatedAt: true,
                    translations: { where: { language: 'en' }, select: { title: true } },
                },
            }),
            this.prisma.job.findMany({
                where: { isDeleted: false },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: {
                    id: true, slug: true, isPublished: true, updatedAt: true,
                    translations: { where: { language: 'en' }, select: { title: true } },
                },
            }),
        ]);

        const recentActivity = [
            ...recentContacts.map((c) => ({
                id: c.id,
                type: 'contact' as const,
                label: c.fullName,
                subLabel: c.subject,
                createdAt: c.createdAt.toISOString(),
            })),
            ...recentApplications.map((a) => ({
                id: a.id,
                type: 'application' as const,
                label: `${a.firstName} ${a.lastName}`,
                subLabel: a.job.translations[0]?.title ?? 'a job posting',
                createdAt: a.createdAt.toISOString(),
            })),
            ...recentInquiries.map((i) => ({
                id: i.id,
                type: 'inquiry' as const,
                label: i.fullName,
                subLabel: i.projectName ?? 'General inquiry',
                createdAt: i.createdAt.toISOString(),
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
            projects: { total: totalProjects, published: publishedProjects, draft: totalProjects - publishedProjects },
            news: { total: totalNews, published: publishedNews, draft: totalNews - publishedNews },
            jobs: { total: totalJobs, published: publishedJobs, draft: totalJobs - publishedJobs, pendingApplications },
            inquiries: { open: openInquiries },
            contact: { new: newContactSubmissions },
            activity: {
                pageviewsToday: pageviewsToday?.count ?? 0,
                errorsToday: errorsToday._sum.count ?? 0,
            },
            pageviewsTrend,
            recentActivity,
            contentByType: [
                { type: 'projects' as const, total: totalProjects, published: publishedProjects },
                { type: 'news' as const, total: totalNews, published: publishedNews },
                { type: 'jobs' as const, total: totalJobs, published: publishedJobs },
            ],
            recentContent: {
                projects: recentProjects.map(mapContentItem),
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
