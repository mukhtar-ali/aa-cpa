import { describe, expect, it } from 'vitest';
import { buildBreadcrumbJsonLd } from './breadcrumb';
import { buildFaqJsonLd } from './faq';
import { buildServiceJsonLd } from './service';
import { buildArticleJsonLd } from './article';
import { buildJobPostingJsonLd } from './job-posting';
import { buildOrganizationJsonLd } from './organization';

describe('JSON-LD Builders', () => {
    describe('buildBreadcrumbJsonLd', () => {
        it('builds BreadcrumbList with ListItem positions and absolute URLs', () => {
            const data = buildBreadcrumbJsonLd({
                items: [
                    { label: 'Home', href: '/en' },
                    { label: 'Services', href: '/en/services' },
                    { label: 'Audit', href: '/en/services/audit' },
                ],
            });

            expect(data).toMatchObject({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'http://localhost:3000/en' },
                    { '@type': 'ListItem', position: 2, name: 'Services', item: 'http://localhost:3000/en/services' },
                    { '@type': 'ListItem', position: 3, name: 'Audit', item: 'http://localhost:3000/en/services/audit' },
                ],
            });
        });

        it('returns null for empty items', () => {
            expect(buildBreadcrumbJsonLd({ items: [] })).toBeNull();
        });
    });

    describe('buildFaqJsonLd', () => {
        it('builds FAQPage schema for provided FAQ items', () => {
            const data = buildFaqJsonLd({
                lang: 'ar',
                items: [
                    { question: 'ما هي خدمات المراجعة؟', answer: 'خدمات التدقيق والتأكيد المالي.' },
                ],
            });

            expect(data).toMatchObject({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                inLanguage: 'ar',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: 'ما هي خدمات المراجعة؟',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'خدمات التدقيق والتأكيد المالي.',
                        },
                    },
                ],
            });
        });

        it('returns null if no items', () => {
            expect(buildFaqJsonLd({ lang: 'en', items: [] })).toBeNull();
            expect(buildFaqJsonLd({ lang: 'en', items: undefined })).toBeNull();
        });
    });

    describe('buildServiceJsonLd', () => {
        it('builds Service schema with provider and inLanguage', () => {
            const data = buildServiceJsonLd({
                lang: 'ar',
                slug: 'audit',
                title: 'خدمات المراجعة والتدقيق',
                summary: 'مراجعة وتدقيق الحسابات وفق معايير المحاسبة السعودية والدولية.',
                audience: 'الشركات والمنشآت',
            });

            expect(data).toMatchObject({
                '@context': 'https://schema.org',
                '@type': 'Service',
                '@id': 'http://localhost:3000/ar/services/audit#service',
                name: 'خدمات المراجعة والتدقيق',
                description: 'مراجعة وتدقيق الحسابات وفق معايير المحاسبة السعودية والدولية.',
                inLanguage: 'ar',
                provider: {
                    '@type': 'AccountingService',
                    name: 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية',
                    '@id': 'http://localhost:3000/#organization',
                },
                audience: {
                    '@type': 'Audience',
                    audienceType: 'الشركات والمنشآت',
                },
            });
        });

        it('omits properties that are not provided', () => {
            const data = buildServiceJsonLd({
                lang: 'en',
                slug: 'tax',
                title: 'Tax Advisory',
            });
            expect(data.description).toBeUndefined();
            expect(data.audience).toBeUndefined();
            expect(data.image).toBeUndefined();
        });
    });

    describe('buildArticleJsonLd', () => {
        it('builds Article schema with publisher, author, datePublished', () => {
            const data = buildArticleJsonLd({
                lang: 'en',
                slug: 'zakat-guide',
                title: 'Comprehensive Zakat Guide',
                excerpt: 'Key rules for zakat filing in KSA.',
                date: '2026-01-15T00:00:00Z',
                author: { name: 'Ahmad Al-Mansoor', role: 'Partner' },
                image: 'https://example.com/zakat.jpg',
                tags: ['Zakat', 'Tax'],
            });

            expect(data).toMatchObject({
                '@context': 'https://schema.org',
                '@type': 'Article',
                '@id': 'http://localhost:3000/en/articles/zakat-guide#article',
                headline: 'Comprehensive Zakat Guide',
                description: 'Key rules for zakat filing in KSA.',
                inLanguage: 'en',
                datePublished: '2026-01-15T00:00:00Z',
                image: 'https://example.com/zakat.jpg',
                author: {
                    '@type': 'Person',
                    name: 'Ahmad Al-Mansoor',
                    jobTitle: 'Partner',
                },
                publisher: {
                    '@type': 'Organization',
                    name: 'Abdulrahman Al-Shubaishiri Professional Consulting',
                    '@id': 'http://localhost:3000/#organization',
                },
                keywords: 'Zakat, Tax',
            });
        });

        it('omits author/keywords when not supplied', () => {
            const data = buildArticleJsonLd({
                lang: 'ar',
                slug: 'news-1',
                title: 'خبر جديد',
                date: '2026-02-01',
            });
            expect(data.author).toBeUndefined();
            expect(data.keywords).toBeUndefined();
            expect(data.image).toBeUndefined();
        });
    });

    describe('buildJobPostingJsonLd', () => {
        it('builds JobPosting with validThrough=closesAt, hiringOrganization, and location', () => {
            const data = buildJobPostingJsonLd({
                lang: 'ar',
                slug: 'senior-auditor',
                title: 'مراجع أول',
                summary: 'وظيفة مراجع أول في الرياض.',
                postedAt: '2026-03-01',
                closesAt: '2026-04-01',
                contract: 'دوام كامل',
                city: 'الرياض',
            });

            expect(data).toMatchObject({
                '@context': 'https://schema.org',
                '@type': 'JobPosting',
                '@id': 'http://localhost:3000/ar/careers/senior-auditor#job',
                title: 'مراجع أول',
                description: 'وظيفة مراجع أول في الرياض.',
                datePosted: '2026-03-01',
                validThrough: '2026-04-01',
                employmentType: 'دوام كامل',
                inLanguage: 'ar',
                hiringOrganization: {
                    '@type': 'Organization',
                    name: 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية',
                    sameAs: 'http://localhost:3000',
                    '@id': 'http://localhost:3000/#organization',
                },
                jobLocation: {
                    '@type': 'Place',
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: 'الرياض',
                        addressCountry: 'SA',
                    },
                },
            });
        });

        it('omits optional job fields when absent', () => {
            const data = buildJobPostingJsonLd({
                lang: 'en',
                slug: 'trainee',
                title: 'Audit Trainee',
            });
            expect(data.validThrough).toBeUndefined();
            expect(data.datePosted).toBeUndefined();
            expect(data.employmentType).toBeUndefined();
            expect(data.jobLocation).toBeUndefined();
        });
    });

    describe('buildOrganizationJsonLd', () => {
        it('builds AccountingService+Organization with credential 522, 3E memberOf, offices, sameAs', () => {
            const data = buildOrganizationJsonLd({
                lang: 'ar',
                telephone: '+966112345678',
                openingHoursSpecification: 'الأحد - الخميس 8:00 - 17:00',
                sameAs: ['https://linkedin.com/company/aacpa', 'https://x.com/aacpa'],
                offices: [
                    {
                        city: 'الرياض',
                        address: 'طريق الملك فهد، الرياض',
                        isHeadquarters: true,
                        telephone: '+966112345678',
                        openingHoursSpecification: 'الأحد - الخميس 8:00 - 17:00',
                    },
                    {
                        city: 'الخبر',
                        address: 'طريق الملك عبدالعزيز، الخبر',
                        telephone: '+966138765432',
                    },
                    {
                        city: 'القصيم',
                        address: 'بريدة، القصيم',
                    },
                ],
            });

            expect(data['@context']).toBe('https://schema.org');
            expect(data['@type']).toEqual(['AccountingService', 'Organization']);
            expect(data['@id']).toBe('http://localhost:3000/#organization');
            expect(data.name).toBe('شركة عبدالرحمن الشبيشيري للاستشارات المهنية');
            expect(data.inLanguage).toBe('ar');
            expect(data.telephone).toBe('+966112345678');
            expect(data.openingHoursSpecification).toBe('الأحد - الخميس 8:00 - 17:00');
            expect(data.sameAs).toEqual(['https://linkedin.com/company/aacpa', 'https://x.com/aacpa']);

            expect(data.hasCredential).toMatchObject({
                '@type': 'EducationalOccupationalCredential',
                credentialCategory: 'license',
            });
            expect(JSON.stringify(data.hasCredential)).toContain('522');

            expect(data.memberOf).toMatchObject({
                '@type': 'Organization',
                name: '3E Accounting Network',
            });

            const offices = data.department as Record<string, unknown>[];
            expect(offices).toHaveLength(3);
            expect(offices[0]).toMatchObject({
                '@type': 'AccountingService',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'الرياض',
                    streetAddress: 'طريق الملك فهد، الرياض',
                    addressCountry: 'SA',
                },
                telephone: '+966112345678',
            });
        });

        it('omits missing fields gracefully without inventing values', () => {
            const data = buildOrganizationJsonLd({
                lang: 'en',
            });
            expect(data.name).toBe('Abdulrahman Al-Shubaishiri Professional Consulting');
            expect(data.inLanguage).toBe('en');
            expect(data.telephone).toBeUndefined();
            expect(data.openingHoursSpecification).toBeUndefined();
            expect(data.sameAs).toBeUndefined();
            expect(data.department).toBeUndefined();
        });
    });
});
