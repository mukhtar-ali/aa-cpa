import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_PERMISSIONS, passwordValidation } from '@repo/shared';
import { assertSeedPasswordIsNotPlaceholder } from '../src/config/seed-password';

import { seedServices } from './seed-content/services';
import { seedSectors } from './seed-content/sectors';
import { seedCategories, seedAuthors, seedArticles } from './seed-content/articles';
import { seedDepartments, seedJobs } from './seed-content/jobs';
import { seedOffices, seedTestimonials, seedClientLogos, seedCredentials, seedFaqs } from './seed-content/reference';
import { seedPages } from './seed-content/pages';
import { seedEstimatorConfig } from './seed-content/estimator';

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'super_admin';
const SUPER_ADMIN_FULL_NAME = process.env.SUPER_ADMIN_FULL_NAME || 'Super Admin';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

async function seedContent() {
    console.log('Seeding CPA content (--content mode)...');

    // 1. Services
    const serviceMap = new Map<string, string>();
    for (const s of seedServices) {
        const { translations, ...serviceData } = s;
        const service = await prisma.service.upsert({
            where: { slug: s.slug },
            update: {
                icon: serviceData.icon,
                order: serviceData.order,
                isPublished: serviceData.isPublished,
                publishedAt: serviceData.publishedAt,
                highlight: serviceData.highlight as any,
                methodology: serviceData.methodology as any,
                deliverables: serviceData.deliverables as any,
            },
            create: {
                ...serviceData,
                highlight: serviceData.highlight as any,
                methodology: serviceData.methodology as any,
                deliverables: serviceData.deliverables as any,
            },
        });
        serviceMap.set(s.slug, service.id);

        for (const [lang, t] of Object.entries(translations)) {
            await prisma.serviceTranslation.upsert({
                where: {
                    serviceId_language: {
                        serviceId: service.id,
                        language: lang as 'ar' | 'en',
                    },
                },
                update: t,
                create: {
                    serviceId: service.id,
                    language: lang as 'ar' | 'en',
                    ...t,
                },
            });
        }
    }
    console.log(`Seeded ${seedServices.length} services.`);

    // 2. Sectors
    const sectorMap = new Map<string, string>();
    for (const sec of seedSectors) {
        const { translations, ...sectorData } = sec;
        const sector = await prisma.sector.upsert({
            where: { slug: sec.slug },
            update: {
                icon: sectorData.icon,
                featured: sectorData.featured,
                order: sectorData.order,
                isPublished: sectorData.isPublished,
                publishedAt: sectorData.publishedAt,
            },
            create: sectorData,
        });
        sectorMap.set(sec.slug, sector.id);

        for (const [lang, t] of Object.entries(translations)) {
            await prisma.sectorTranslation.upsert({
                where: {
                    sectorId_language: {
                        sectorId: sector.id,
                        language: lang as 'ar' | 'en',
                    },
                },
                update: t,
                create: {
                    sectorId: sector.id,
                    language: lang as 'ar' | 'en',
                    ...t,
                },
            });
        }
    }
    console.log(`Seeded ${seedSectors.length} sectors.`);

    // Connect some service-sector relations
    for (const [serviceSlug, serviceId] of serviceMap.entries()) {
        const sectorIds = Array.from(sectorMap.values()).slice(0, 3);
        for (const sectorId of sectorIds) {
            await prisma.serviceSector.upsert({
                where: {
                    serviceId_sectorId: {
                        serviceId,
                        sectorId,
                    },
                },
                update: {},
                create: { serviceId, sectorId },
            });
        }
    }

    // 3. Article Categories & Authors
    const categoryMap = new Map<string, string>();
    for (const cat of seedCategories) {
        const c = await prisma.articleCategory.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name as any, order: cat.order, isCaseStory: cat.isCaseStory },
            create: { slug: cat.slug, name: cat.name as any, order: cat.order, isCaseStory: cat.isCaseStory },
        });
        categoryMap.set(cat.slug, c.id);
    }

    const authorIds: string[] = [];
    for (const a of seedAuthors) {
        const existing = await prisma.author.findFirst({
            where: { order: a.order },
        });
        if (existing) {
            authorIds.push(existing.id);
        } else {
            const author = await prisma.author.create({
                data: {
                    name: a.name as any,
                    role: a.role as any,
                    bio: a.bio as any,
                    order: a.order,
                },
            });
            authorIds.push(author.id);
        }
    }

    // 4. Articles
    for (const art of seedArticles) {
        const { translations, categorySlug, authorIndex, ...articleData } = art;
        const categoryId = categoryMap.get(categorySlug) || Array.from(categoryMap.values())[0];
        const authorId = authorIds[authorIndex] || null;

        const article = await prisma.news.upsert({
            where: { slug: art.slug },
            update: {
                categoryId,
                authorId,
                readingMinutes: articleData.readingMinutes,
                isFeatured: articleData.isFeatured,
                isPublished: articleData.isPublished,
                publishedAt: articleData.publishedAt,
                tags: articleData.tags as any,
            },
            create: {
                slug: art.slug,
                categoryId,
                authorId,
                readingMinutes: articleData.readingMinutes,
                isFeatured: articleData.isFeatured,
                isPublished: articleData.isPublished,
                publishedAt: articleData.publishedAt,
                tags: articleData.tags as any,
            },
        });

        for (const [lang, t] of Object.entries(translations)) {
            await prisma.newsTranslation.upsert({
                where: {
                    newsId_language: {
                        newsId: article.id,
                        language: lang as 'ar' | 'en',
                    },
                },
                update: t,
                create: {
                    newsId: article.id,
                    language: lang as 'ar' | 'en',
                    ...t,
                },
            });
        }
    }
    console.log(`Seeded ${seedArticles.length} articles.`);

    // 5. Job Departments & Offices
    const deptMap = new Map<string, string>();
    for (const d of seedDepartments) {
        const dept = await prisma.jobDepartment.upsert({
            where: { slug: d.slug },
            update: { name: d.name as any, order: d.order },
            create: { slug: d.slug, name: d.name as any, order: d.order },
        });
        deptMap.set(d.slug, dept.id);
    }

    const officeIds: string[] = [];
    for (const off of seedOffices) {
        const existing = await prisma.office.findFirst({
            where: { order: off.order },
        });
        if (existing) {
            officeIds.push(existing.id);
        } else {
            const office = await prisma.office.create({
                data: {
                    city: off.city as any,
                    address: off.address as any,
                    mapUrl: off.mapUrl,
                    mapX: off.mapX,
                    mapY: off.mapY,
                    isHeadquarters: off.isHeadquarters,
                    order: off.order,
                    isPublished: off.isPublished,
                },
            });
            officeIds.push(office.id);
        }
    }

    // 6. Jobs
    for (const j of seedJobs) {
        const { translations, departmentSlug, ...jobData } = j;
        const departmentId = deptMap.get(departmentSlug) || Array.from(deptMap.values())[0];
        const officeId = officeIds[0] || null;

        const job = await prisma.job.upsert({
            where: { slug: j.slug },
            update: {
                departmentId,
                officeId,
                employmentType: jobData.employmentType,
                experienceMin: jobData.experienceMin,
                experienceMax: jobData.experienceMax,
                order: jobData.order,
                isPublished: jobData.isPublished,
                publishedAt: jobData.publishedAt,
                closesAt: jobData.closesAt,
                responsibilities: jobData.responsibilities as any,
                requirements: jobData.requirements as any,
                benefits: jobData.benefits as any,
            },
            create: {
                slug: j.slug,
                departmentId,
                officeId,
                employmentType: jobData.employmentType,
                experienceMin: jobData.experienceMin,
                experienceMax: jobData.experienceMax,
                order: jobData.order,
                isPublished: jobData.isPublished,
                publishedAt: jobData.publishedAt,
                closesAt: jobData.closesAt,
                responsibilities: jobData.responsibilities as any,
                requirements: jobData.requirements as any,
                benefits: jobData.benefits as any,
            },
        });

        for (const [lang, t] of Object.entries(translations)) {
            await prisma.jobTranslation.upsert({
                where: {
                    jobId_language: {
                        jobId: job.id,
                        language: lang as 'ar' | 'en',
                    },
                },
                update: {
                    title: t.title,
                    summary: t.summary,
                    body: t.body,
                    location: t.location,
                    metaTitle: t.metaTitle,
                    metaDescription: t.metaDescription,
                },
                create: {
                    jobId: job.id,
                    language: lang as 'ar' | 'en',
                    title: t.title,
                    summary: t.summary,
                    body: t.body,
                    location: t.location,
                    metaTitle: t.metaTitle,
                    metaDescription: t.metaDescription,
                },
            });
        }
    }
    console.log(`Seeded ${seedJobs.length} jobs.`);

    // 7. Reference (Testimonials, Logos, Credentials, FAQs)
    for (const t of seedTestimonials) {
        const existing = await prisma.testimonial.findFirst({ where: { order: t.order } });
        if (!existing) {
            await prisma.testimonial.create({
                data: {
                    quote: t.quote as any,
                    rating: t.rating,
                    name: t.name as any,
                    role: t.role as any,
                    company: t.company as any,
                    placement: t.placement as any,
                    order: t.order,
                    isPublished: t.isPublished,
                },
            });
        }
    }

    for (const l of seedClientLogos) {
        const existing = await prisma.clientLogo.findFirst({ where: { name: l.name } });
        if (!existing) {
            await prisma.clientLogo.create({
                data: {
                    name: l.name,
                    logo: l.logo as any,
                    // The seed logos carry no link; the field is optional.
                    url: (l as { url?: string }).url ?? null,
                    row: l.row,
                    order: l.order,
                    isPublished: l.isPublished,
                },
            });
        }
    }

    for (const c of seedCredentials) {
        const existing = await prisma.credential.findFirst({ where: { order: c.order } });
        if (!existing) {
            await prisma.credential.create({
                data: {
                    name: c.name as any,
                    logo: c.logo as any,
                    url: c.url,
                    order: c.order,
                    isPublished: c.isPublished,
                },
            });
        }
    }

    for (const f of seedFaqs) {
        const existing = await prisma.faqItem.findFirst({ where: { order: f.order } });
        if (!existing) {
            await prisma.faqItem.create({
                data: {
                    scope: f.scope,
                    question: f.question as any,
                    answer: f.answer as any,
                    order: f.order,
                    isPublished: f.isPublished,
                },
            });
        }
    }

    // 8. Sections & Pages
    for (const page of seedPages) {
        await prisma.section.upsert({
            where: { type: page.type },
            update: { data: page.data },
            create: { type: page.type, data: page.data },
        });
    }

    // 9. Estimator Config
    await prisma.section.upsert({
        where: { type: 'estimator-config' },
        update: { data: seedEstimatorConfig as any },
        create: { type: 'estimator-config', data: seedEstimatorConfig as any },
    });

    // 10. SEO page keys
    const seoPages = [
        { pageKey: 'home', title: { ar: 'الرئيسية | محاسبون قانونيون', en: 'Home | CPA Firm' }, description: { ar: 'خدمات التدقيق والزكاة والضرائب والاستشارات المالية', en: 'Audit, Zakat, Tax, and Financial Advisory Services' } },
        { pageKey: 'about', title: { ar: 'عن الشركة | محاسبون قانونيون', en: 'About Us | CPA Firm' }, description: { ar: 'تعرف على فريقنا وتراخيصنا المهنية', en: 'Learn about our leadership and professional accreditations' } },
        { pageKey: 'services', title: { ar: 'خدماتنا | محاسبون قانونيون', en: 'Services | CPA Firm' }, description: { ar: 'حلول متكاملة في المراجعة والتدقيق والزكاة والضرائب', en: 'Comprehensive assurance, zakat, and tax advisory services' } },
        { pageKey: 'sectors', title: { ar: 'القطاعات | محاسبون قانونيون', en: 'Sectors | CPA Firm' }, description: { ar: 'خبرات متخصصة عبر القطاعات الاقتصادية في المملكة', en: 'Specialized industry expertise across Saudi Arabia' } },
        { pageKey: 'articles', title: { ar: 'الرؤى والمقالات | محاسبون قانونيون', en: 'Articles & Insights | CPA Firm' }, description: { ar: 'مقالات وتحليلات في المحاسبة والزكاة والضرائب', en: 'Insights and updates on accounting, zakat, and tax' } },
        { pageKey: 'careers', title: { ar: 'الوظائف | محاسبون قانونيون', en: 'Careers | CPA Firm' }, description: { ar: 'انضم إلى فريقنا المهني في المملكة', en: 'Join our professional team in Saudi Arabia' } },
        { pageKey: 'contact', title: { ar: 'اتصل بنا | محاسبون قانونيون', en: 'Contact Us | CPA Firm' }, description: { ar: 'تواصل مع مكاتبنا في الرياض وجدة والخبر', en: 'Get in touch with our offices in Riyadh, Jeddah, and Khobar' } },
        { pageKey: 'privacy', title: { ar: 'سياسة الخصوصية | محاسبون قانونيون', en: 'Privacy Policy | CPA Firm' }, description: { ar: 'سياسة الخصوصية وحماية البيانات الشخصية', en: 'Privacy policy and personal data protection' } },
        { pageKey: 'terms', title: { ar: 'الشروط والأحكام | محاسبون قانونيون', en: 'Terms & Conditions | CPA Firm' }, description: { ar: 'شروط وأحكام استخدام الموقع', en: 'Website terms and conditions of use' } },
        { pageKey: 'accessibility', title: { ar: 'إمكانية الوصول | محاسبون قانونيون', en: 'Accessibility | CPA Firm' }, description: { ar: 'بيان التزامنا بمعايير الوصول الرقمي', en: 'Our commitment to digital accessibility standards' } },
    ];

    for (const seo of seoPages) {
        await prisma.seo.upsert({
            where: { pageKey: seo.pageKey },
            update: { content: { title: seo.title, description: seo.description } as any },
            create: { pageKey: seo.pageKey, content: { title: seo.title, description: seo.description } as any },
        });
    }

    console.log('CPA content seeded successfully.');
}

async function main() {
    console.log('Seeding database...');

    // Super admin
    const existingAdmin = await prisma.user.findUnique({
        where: { email: SUPER_ADMIN_EMAIL },
    });

    if (!existingAdmin) {
        if (!SUPER_ADMIN_PASSWORD) {
            throw new Error(
                'SUPER_ADMIN_PASSWORD is not set. Add it to apps/api/.env before seeding ' +
                    '(see .env.example) — no default credential is baked into the seed script.',
            );
        }
        assertSeedPasswordIsNotPlaceholder(SUPER_ADMIN_PASSWORD);
        const passwordCheck = passwordValidation.safeParse(SUPER_ADMIN_PASSWORD);
        if (!passwordCheck.success) {
            throw new Error(`SUPER_ADMIN_PASSWORD is too weak: ${passwordCheck.error.issues[0].message}`);
        }

        await prisma.user.create({
            data: {
                fullName: SUPER_ADMIN_FULL_NAME,
                email: SUPER_ADMIN_EMAIL,
                username: SUPER_ADMIN_USERNAME,
                password: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10),
                isActive: true,
                permissions: ALL_PERMISSIONS,
            },
        });
        console.log(`Created super admin: ${SUPER_ADMIN_EMAIL}`);
    } else {
        const existingPermissions = new Set(
            Array.isArray(existingAdmin.permissions) ? (existingAdmin.permissions as string[]) : [],
        );
        const missingPermissions = ALL_PERMISSIONS.filter((p) => !existingPermissions.has(p));
        if (missingPermissions.length > 0) {
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: { permissions: ALL_PERMISSIONS },
            });
            console.log(`Super admin already exists — topped up ${missingPermissions.length} missing permission(s).`);
        } else {
            console.log('Super admin already exists, permissions already up to date.');
        }
    }

    // Default sections
    const defaultSections = [
        {
            type: 'website-info',
            data: {
                facebookUrl: '', instagramUrl: '', linkedinUrl: '', youtubeUrl: '',
                email: '', phone: '', whatsapp: '', location: '',
                address: { en: '', ar: '' }, footerDescription: { en: '', ar: '' },
            },
        },
        {
            type: 'home-hero',
            data: { title: { en: '', ar: '' }, subtitle: { en: '', ar: '' }, backgroundImage: { desktop: '', tablet: '', mobile: '' } },
        },
        {
            type: 'home-about',
            data: { title: { en: '', ar: '' }, title2: { en: '', ar: '' }, subtitle: { en: '', ar: '' }, description: { en: '', ar: '' }, image: { desktop: '', tablet: '', mobile: '' } },
        },
        {
            type: 'fonts',
            data: { fonts: [] },
        },
        {
            type: 'home-why',
            data: { title: { en: '', ar: '' }, subtitle: { en: '', ar: '' }, items: [] },
        },
    ];

    for (const section of defaultSections) {
        await prisma.section.upsert({
            where: { type: section.type },
            update: {},
            create: { type: section.type, data: section.data },
        });
    }

    if (process.argv.includes('--content')) {
        await seedContent();
    }

    console.log('Default sections seeded.');
    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
