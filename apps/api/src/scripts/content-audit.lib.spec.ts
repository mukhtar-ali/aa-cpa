import {
    findPlaceholders,
    checkBilingualField,
    checkImageField,
    auditService,
    auditSector,
    auditArticle,
    auditJob,
    auditAuthor,
    auditFaq,
    auditTestimonial,
    auditClientLogo,
    auditCredential,
    auditEstimator,
    auditSection,
    compileAuditReport,
    buildMarkdownReport,
} from './content-audit.lib';

describe('Content Audit Library', () => {
    describe('findPlaceholders', () => {
        it('detects [PLACEHOLDER] in various casings', () => {
            expect(findPlaceholders('This is [PLACEHOLDER] content')).toContain('[PLACEHOLDER]');
            expect(findPlaceholders('This is [placeholder] content')).toContain('[PLACEHOLDER]');
        });

        it('detects lorem ipsum', () => {
            expect(findPlaceholders('Lorem ipsum dolor sit amet')).toContain('lorem ipsum');
            expect(findPlaceholders('lorem   ipsum text')).toContain('lorem ipsum');
        });

        it('detects Arabic placeholder "شعار الجهة"', () => {
            expect(findPlaceholders('هنا شعار الجهة المعتمدة')).toContain('شعار الجهة');
        });

        it('detects TODO and TBD word markers', () => {
            expect(findPlaceholders('Review this section TODO before publishing')).toContain('TODO');
            expect(findPlaceholders('Delivery date is TBD')).toContain('TBD');
        });

        it('returns empty array when text has no placeholders', () => {
            expect(findPlaceholders('شركة محاسبون قانونيون معتمدة')).toEqual([]);
            expect(findPlaceholders('Certified Public Accountants in Saudi Arabia')).toEqual([]);
        });
    });

    describe('checkBilingualField', () => {
        it('reports missing Arabic when ar is empty or absent', () => {
            const issues = checkBilingualField(
                { ar: '', en: 'English text' },
                'title',
                'services',
                'service-1'
            );
            expect(issues.some((i) => i.issue.includes('Missing Arabic text for "title"'))).toBe(true);
        });

        it('reports missing English when en is empty or absent', () => {
            const issues = checkBilingualField(
                { ar: 'نص عربي', en: '' },
                'summary',
                'services',
                'service-1'
            );
            expect(issues.some((i) => i.issue.includes('Missing English text for "summary"'))).toBe(true);
        });

        it('flags placeholders in Arabic or English text', () => {
            const issues = checkBilingualField(
                { ar: 'نص مع [PLACEHOLDER]', en: 'English TODO text' },
                'statement',
                'services',
                'service-1'
            );
            expect(issues.some((i) => i.issue.includes('[PLACEHOLDER]'))).toBe(true);
            expect(issues.some((i) => i.issue.includes('TODO'))).toBe(true);
        });

        it('passes clean bilingual fields with no issues', () => {
            const issues = checkBilingualField(
                { ar: 'خدمات التدقيق الخارجي', en: 'External Audit Services' },
                'title',
                'services',
                'service-1'
            );
            expect(issues).toEqual([]);
        });
    });

    describe('checkImageField', () => {
        it('flags image with missing Arabic alt text', () => {
            const issues = checkImageField(
                {
                    url: '/images/hero.webp',
                    alt: { ar: '', en: 'Hero banner' },
                    license: { source: 'Internal' },
                },
                'heroImage',
                'services',
                'service-1'
            );
            expect(issues.some((i) => i.issue.includes('missing Arabic alt text'))).toBe(true);
        });

        it('flags image with missing English alt text', () => {
            const issues = checkImageField(
                {
                    url: '/images/hero.webp',
                    alt: { ar: 'صورة الواجهة', en: '' },
                    license: { source: 'Internal' },
                },
                'heroImage',
                'services',
                'service-1'
            );
            expect(issues.some((i) => i.issue.includes('missing English alt text'))).toBe(true);
        });

        it('flags image with no license note (defensive unknown read)', () => {
            const issues = checkImageField(
                {
                    url: '/images/hero.webp',
                    alt: { ar: 'صورة الواجهة', en: 'Hero banner' },
                },
                'heroImage',
                'services',
                'service-1'
            );
            expect(issues.some((i) => i.issue.includes('has no license note'))).toBe(true);
        });

        it('accepts license as object or string', () => {
            const withObj = checkImageField(
                {
                    url: '/images/hero.webp',
                    alt: { ar: 'صورة', en: 'Image' },
                    license: { source: 'Getty Images', reference: '123' },
                },
                'heroImage',
                'services',
                'service-1'
            );
            expect(withObj.some((i) => i.issue.includes('license'))).toBe(false);

            const withStr = checkImageField(
                {
                    url: '/images/hero.webp',
                    alt: { ar: 'صورة', en: 'Image' },
                    license: 'Unsplash CC0',
                },
                'heroImage',
                'services',
                'service-1'
            );
            expect(withStr.some((i) => i.issue.includes('license'))).toBe(false);
        });
    });

    describe('auditEstimator', () => {
        it('flags estimator when in draft status', () => {
            const issues = auditEstimator({
                status: 'draft',
                disclaimer: { ar: 'إخلاء المسؤولية', en: 'Disclaimer' },
            });
            expect(issues.some((i) => i.issue.includes('still in draft'))).toBe(true);
        });

        it('approves estimator when status is approved and fields complete', () => {
            const issues = auditEstimator({
                status: 'approved',
                disclaimer: { ar: 'إخلاء المسؤولية', en: 'Disclaimer' },
                questions: [
                    {
                        title: { ar: 'نوع الخدمة؟', en: 'Service type?' },
                        options: [
                            { label: { ar: 'تدقيق', en: 'Audit' } },
                        ],
                    },
                ],
            });
            expect(issues).toEqual([]);
        });
    });

    describe('auditService', () => {
        it('verifies all required fields and sub-items', () => {
            const issues = auditService({
                id: '1',
                slug: 'external-audit',
                translations: {
                    ar: {
                        title: 'التدقيق الخارجي',
                        summary: 'ملخص الخدمة',
                        heroSubtitle: 'عنوان فرعي',
                        statement: 'بيان الخدمة',
                        audience: 'الفئة المستهدفة',
                        whyUs: 'لماذا نحن',
                    },
                    en: {
                        title: 'External Audit',
                        summary: 'Service summary',
                        heroSubtitle: 'Subtitle',
                        statement: 'Service statement',
                        audience: 'Target audience',
                        whyUs: 'Why us',
                    },
                },
                methodology: [
                    {
                        title: { ar: 'المرحلة الأولى', en: 'Phase 1' },
                        body: { ar: 'تفاصيل المرحلة', en: 'Phase details' },
                    },
                ],
                deliverables: [
                    { title: { ar: 'التقرير النهائي', en: 'Final Report' } },
                ],
            });
            expect(issues).toEqual([]);
        });
    });

    describe('auditSection', () => {
        it('recursively audits deeply nested JSON for placeholders and images', () => {
            const issues = auditSection('page-home', {
                hero: {
                    title: { ar: 'عنوان رئيسي', en: 'Hero title' },
                    badge: 'نص يحتوي [PLACEHOLDER]',
                },
                bannerImage: {
                    url: '/banner.jpg',
                    alt: { ar: 'شعار الجهة', en: 'Banner' },
                    license: { source: 'Internal' },
                },
            });
            expect(issues.some((i) => i.issue.includes('[PLACEHOLDER]'))).toBe(true);
            expect(issues.some((i) => i.issue.includes('شعار الجهة'))).toBe(true);
        });
    });

    describe('compileAuditReport & buildMarkdownReport', () => {
        it('summarizes entities and produces markdown with exit status indicator', () => {
            const report = compileAuditReport([
                {
                    entityType: 'services',
                    items: [
                        { id: 'service-1', issues: [] },
                        {
                            id: 'service-2',
                            issues: [
                                {
                                    entityType: 'services',
                                    entityId: 'service-2',
                                    field: 'title.en',
                                    issue: 'Missing English text for "title"',
                                },
                            ],
                        },
                    ],
                },
                {
                    entityType: 'estimator',
                    items: [
                        { id: 'estimator', issues: [] },
                    ],
                },
            ]);

            expect(report.totalEntities).toBe(3);
            expect(report.totalApproved).toBe(2);
            expect(report.totalIssues).toBe(1);
            expect(report.isClean).toBe(false);

            const md = buildMarkdownReport(report);
            expect(md).toContain('| Entity | Total | Approved | Issues |');
            expect(md).toContain('| services | 2 | 1 | 1 |');
            expect(md).toContain('| estimator | 1 | 1 | 0 |');
            expect(md).toContain('FAILED (GATING)');
            expect(md).toContain('Missing English text for "title"');
        });
    });
});
