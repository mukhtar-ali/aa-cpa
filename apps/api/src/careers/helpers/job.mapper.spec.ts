import { JobMapper } from './job.mapper';

describe('JobMapper', () => {
    const mockJob = {
        id: 'job-1',
        slug: 'senior-auditor',
        departmentId: 'dept-1',
        department: {
            id: 'dept-1',
            slug: 'audit',
            name: { ar: 'المراجعة والتدقيق', en: 'Audit & Assurance' },
        },
        officeId: 'off-1',
        office: {
            id: 'off-1',
            city: { ar: 'الرياض', en: 'Riyadh' },
        },
        employmentType: 'full_time',
        experienceMin: 3,
        experienceMax: 5,
        closesAt: new Date(Date.now() + 86400000 * 30), // 30 days ahead
        responsibilities: [
            { ar: 'قيادة فرق المراجعة', en: 'Lead audit teams' },
            { ar: 'إعداد التقارير المالية', en: 'Prepare financial reports' },
        ],
        requirements: [
            { ar: 'شهادة SOCPA أو CPA', en: 'SOCPA or CPA certification' },
            { ar: 'خبرة لا تقل عن 3 سنوات', en: 'Minimum 3 years experience' },
        ],
        benefits: [
            {
                title: { ar: 'تأمين صحي شامل', en: 'Comprehensive Health Insurance' },
                body: { ar: 'تغطية طبية لك ولعائلتك', en: 'Medical coverage for you and family' },
            },
        ],
        order: 1,
        isPublished: true,
        publishedAt: new Date('2026-01-01'),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        translations: [
            {
                language: 'ar',
                title: 'مراجع أول - تدقيق خارجي',
                summary: 'انضم إلى فريق التدقيق في الرياض',
                body: '<h2>عن الوظيفة</h2><p>فرصة مميزة للمحاسبين القانونيين المعتمدين.</p>',
                location: 'الرياض - المقر الرئيسي',
            },
            {
                language: 'en',
                title: 'Senior Auditor - External Audit',
                summary: 'Join our audit team in Riyadh',
                body: '<h2>About the role</h2><p>Excellent opportunity for certified CPAs.</p>',
                location: 'Riyadh - HQ',
            },
        ],
    };

    it('maps to JobSummaryWeb in Arabic', () => {
        const summary = JobMapper.toSummaryWeb(mockJob, 'ar');
        expect(summary.id).toBe('job-1');
        expect(summary.slug).toBe('senior-auditor');
        expect(summary.title).toBe('مراجع أول - تدقيق خارجي');
        expect(summary.department).toBe('المراجعة والتدقيق');
        expect(summary.city).toBe('الرياض');
        expect(summary.contract).toBe('دوام كامل');
        expect(summary.experience).toBe('3-5 سنوات');
    });

    it('maps to JobSummaryWeb in English', () => {
        const summary = JobMapper.toSummaryWeb(mockJob, 'en');
        expect(summary.title).toBe('Senior Auditor - External Audit');
        expect(summary.department).toBe('Audit & Assurance');
        expect(summary.city).toBe('Riyadh');
        expect(summary.contract).toBe('Full Time');
        expect(summary.experience).toBe('3-5 Years');
    });

    it('maps to JobDetailWeb with responsibilities, requirements and benefits', () => {
        const detail = JobMapper.toDetailWeb(mockJob, 'ar');
        expect(detail.isOpen).toBe(true);
        expect(detail.responsibilities).toContain('قيادة فرق المراجعة');
        expect(detail.requirements).toContain('شهادة SOCPA أو CPA');
        expect(detail.benefits).toHaveLength(1);
        expect(detail.benefits![0].title).toBe('تأمين صحي شامل');
    });

    it('marks isOpen as false when closesAt is in the past', () => {
        const closedJob = {
            ...mockJob,
            closesAt: new Date('2025-01-01'),
        };
        const detail = JobMapper.toDetailWeb(closedJob, 'ar');
        expect(detail.isOpen).toBe(false);
    });

    it('falls back to Arabic when English translation is absent', () => {
        const arOnly = {
            ...mockJob,
            translations: [mockJob.translations[0]],
        };
        const summary = JobMapper.toSummaryWeb(arOnly, 'en');
        expect(summary.title).toBe('مراجع أول - تدقيق خارجي');
        expect((summary as any).isFallback).toBe(true);
    });

    it('maps to Admin and DetailWeb with ogImage and noindex', () => {
        const jobWithSeo = {
            ...mockJob,
            ogImage: 'https://example.com/job-og.jpg',
            noindex: true,
        };
        const admin = JobMapper.toAdmin(jobWithSeo);
        expect(admin.noindex).toBe(true);
        expect(admin.ogImage).toBe('https://example.com/job-og.jpg');

        const detail = JobMapper.toDetailWeb(jobWithSeo, 'ar');
        expect(detail.seo?.ogImage).toBe('https://example.com/job-og.jpg');
        expect(detail.seo?.noindex).toBe(true);
    });
});
