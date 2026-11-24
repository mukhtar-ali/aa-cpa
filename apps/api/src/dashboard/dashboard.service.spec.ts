import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('DashboardService - getLeadStats', () => {
    let service: DashboardService;

    const mockContacts = [
        {
            source: 'contact',
            serviceId: 'srv-audit',
            landingPath: '/services/audit',
        },
        {
            source: 'estimator',
            serviceId: 'srv-tax',
            landingPath: '/estimator',
        },
        {
            source: 'contact',
            serviceId: 'srv-audit',
            landingPath: '/services/audit',
        },
        {
            source: 'service_page',
            serviceId: null,
            landingPath: '/contact',
        },
    ];

    const mockServices = [
        {
            id: 'srv-audit',
            slug: 'audit-services',
            translations: [
                { language: 'ar', title: 'خدمات التدقيق' },
                { language: 'en', title: 'Audit Services' },
            ],
        },
        {
            id: 'srv-tax',
            slug: 'tax-consulting',
            translations: [
                { language: 'ar', title: 'الاستشارات الضريبية' },
                { language: 'en', title: 'Tax Consulting' },
            ],
        },
    ];

    const mockEstimatorEvents = [
        { timestamp: new Date('2026-11-20T10:00:00Z') },
        { timestamp: new Date('2026-11-20T14:30:00Z') },
        { timestamp: new Date('2026-11-21T09:15:00Z') },
    ];

    const mockPrisma = {
        contact: {
            findMany: jest.fn().mockResolvedValue(mockContacts),
        },
        jobApplication: {
            count: jest.fn().mockResolvedValue(3),
        },
        monitoringEvent: {
            findMany: jest.fn().mockResolvedValue(mockEstimatorEvents),
        },
        service: {
            findMany: jest.fn().mockResolvedValue(mockServices),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
    });

    it('aggregates leads by source, service, and landing path', async () => {
        const stats = await service.getLeadStats({
            from: '2026-11-01',
            to: '2026-11-24',
        }, 'ar');

        // bySource
        expect(stats.bySource).toEqual(
            expect.arrayContaining([
                { source: 'careers', count: 3 },
                { source: 'contact', count: 2 },
                { source: 'estimator', count: 1 },
                { source: 'service_page', count: 1 },
            ]),
        );

        // byService (Arabic)
        expect(stats.byService).toEqual([
            { serviceId: 'srv-audit', name: 'خدمات التدقيق', count: 2 },
            { serviceId: 'srv-tax', name: 'الاستشارات الضريبية', count: 1 },
            { serviceId: null, name: 'عام / أخرى', count: 1 },
        ]);

        // byPath
        expect(stats.byPath).toEqual([
            { path: '/services/audit', count: 2 },
            { path: '/estimator', count: 1 },
            { path: '/contact', count: 1 },
        ]);

        // estimator completions
        const nov20 = stats.estimatorCompletions.find((item) => item.date === '2026-11-20');
        const nov21 = stats.estimatorCompletions.find((item) => item.date === '2026-11-21');
        const nov22 = stats.estimatorCompletions.find((item) => item.date === '2026-11-22');

        expect(nov20?.count).toBe(2);
        expect(nov21?.count).toBe(1);
        expect(nov22?.count).toBe(0);
    });

    it('resolves service names in English when lang=en', async () => {
        const stats = await service.getLeadStats({
            from: '2026-11-01',
            to: '2026-11-24',
        }, 'en');

        expect(stats.byService).toEqual([
            { serviceId: 'srv-audit', name: 'Audit Services', count: 2 },
            { serviceId: 'srv-tax', name: 'Tax Consulting', count: 1 },
            { serviceId: null, name: 'General / Other', count: 1 },
        ]);
    });

    it('defaults to the last 30 days if from/to are omitted', async () => {
        const stats = await service.getLeadStats({}, 'ar');
        expect(mockPrisma.contact.findMany).toHaveBeenCalled();
        expect(mockPrisma.jobApplication.count).toHaveBeenCalled();
        expect(mockPrisma.monitoringEvent.findMany).toHaveBeenCalled();
        expect(stats.estimatorCompletions.length).toBeGreaterThanOrEqual(30);
    });
});
