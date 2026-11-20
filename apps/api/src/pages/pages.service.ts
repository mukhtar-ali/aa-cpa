import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { localize } from '@/common/localize';
import { toImageRef } from '@/common/image-field.util';
import { ServiceMapper } from '@/service/service.mapper';
import { SectorMapper } from '@/sector/sector.mapper';
import { NewsMapper } from '@/news/helpers/news.mapper';
import { JobMapper } from '@/careers/helpers/job.mapper';
import { ReferenceMapper } from '@/reference/reference.mapper';
import { customEnv } from '@/config/custom-env';

const DEFAULT_IMAGE_REF = {
    src: '/uploads/placeholder.webp',
    alt: 'أحمد بن عبدالله للمحاسبة القانونية',
    width: 1200,
    height: 800,
};

const VALID_LEGAL_KEYS = ['privacy', 'terms', 'accessibility'] as const;

@Injectable()
export class PagesService {
    constructor(private readonly prisma: PrismaService) {}

    private str(val: unknown, lang: string, fallback = ''): string {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        const localized = localize(val, lang as any);
        return typeof localized === 'string' && localized.trim().length > 0
            ? localized
            : fallback;
    }

    private img(val: unknown, lang: string, fallbackAlt = 'صورة') {
        const ref = toImageRef(val as any, lang as any);
        if (ref && ref.src) {
            return ref;
        }
        return {
            ...DEFAULT_IMAGE_REF,
            alt: fallbackAlt,
        };
    }

    private action(val: any, lang: string, defaultLabel = 'تواصل معنا', defaultHref = '/contact') {
        if (!val || typeof val !== 'object') {
            return { label: defaultLabel, href: defaultHref, variant: 'primary' as const };
        }
        return {
            label: this.str(val.label, lang, defaultLabel),
            href: typeof val.href === 'string' && val.href ? val.href : defaultHref,
            ...(val.variant ? { variant: val.variant } : {}),
        };
    }

    private hero(rawHero: any, lang: string, defaultTitle: string) {
        const title = this.str(rawHero?.title, lang, defaultTitle);
        const subtitle = this.str(rawHero?.subtitle, lang);
        return {
            title,
            ...(subtitle ? { subtitle } : {}),
            image: this.img(rawHero?.image, lang, title),
        };
    }

    private async getSeo(pageKey: string, lang: string) {
        const seo = await this.prisma.seo?.findUnique({ where: { pageKey } }).catch(() => null);
        return seo ? localize(seo, lang as any) : { pageKey, title: '', description: '' };
    }

    private async getSectionData(type: string): Promise<any> {
        const row = await this.prisma.section.findUnique({ where: { type } });
        return (row?.data as Record<string, any>) ?? {};
    }

    private async getPublicEstimator(lang: string) {
        const data = await this.getSectionData('estimator-config');
        if (!data || Object.keys(data).length === 0) return null;
        const allowDraft = Boolean(customEnv.ESTIMATOR_ALLOW_DRAFT);
        if (data.status !== 'approved' && !allowDraft) {
            return null;
        }
        return {
            currency: data.currency || 'SAR',
            disclaimer: this.str(data.disclaimer, lang, 'تقدير استرشادي فقط'),
            questions: Array.isArray(data.questions)
                ? data.questions.map((q: any) => ({
                      id: String(q.id ?? ''),
                      title: this.str(q.title, lang),
                      ...(q.subtitle ? { subtitle: this.str(q.subtitle, lang) } : {}),
                      type: q.type || 'select',
                      options: Array.isArray(q.options)
                          ? q.options.map((o: any) => ({
                                id: String(o.id ?? o.value ?? ''),
                                label: this.str(o.label, lang),
                                value: o.value ?? o.id ?? '',
                            }))
                          : [],
                  }))
                : [],
            ...(data.labels ? { labels: localize(data.labels, lang as any) } : {}),
        };
    }

    private async getTestimonialsForPlacement(placement: string, lang: string) {
        const rows = await this.prisma.testimonial.findMany({
            where: { isPublished: true, isDeleted: false },
            orderBy: { order: 'asc' },
        });
        const matched = rows.filter((r: any) => {
            const p = Array.isArray(r.placement) ? r.placement : [];
            return p.length === 0 || p.includes(placement);
        });
        return matched.map((r: any) => ReferenceMapper.testimonialToWeb(r, lang as any));
    }

    async getSiteChrome(lang: string) {
        const [raw, services, offices] = await Promise.all([
            this.getSectionData('site-chrome'),
            this.prisma.service.findMany({
                where: { isPublished: true, isDeleted: false },
                orderBy: { order: 'asc' },
                include: { translations: true },
            }),
            this.prisma.office.findMany({
                where: { isPublished: true, isDeleted: false },
                orderBy: { order: 'asc' },
            }),
        ]);

        const utilityRaw = raw.utility || raw.utilityBar || {};
        const phoneRaw = utilityRaw.phone || (Array.isArray(raw.contactChannels) ? raw.contactChannels[0] : null) || {};
        const navRaw = Array.isArray(raw.nav)
            ? raw.nav
            : Array.isArray(raw.navItems)
              ? raw.navItems
              : [{ label: { ar: 'الرئيسية', en: 'Home' }, href: '/' }];

        const socialsRaw = Array.isArray(raw.footer?.socials)
            ? raw.footer.socials
            : Array.isArray(raw.socials)
              ? raw.socials
              : [];

        const contactsRaw = Array.isArray(raw.footer?.contacts)
            ? raw.footer.contacts
            : Array.isArray(raw.contactChannels)
              ? raw.contactChannels
              : [];

        const serviceLinks = services.map((s: any) => {
            const summary = ServiceMapper.toSummaryWeb(s, lang);
            return {
                label: summary.title,
                href: summary.href || `/${lang}/services/${summary.slug}`,
            };
        });

        const navLinks = navRaw.map((item: any) => ({
            label: this.str(item.label, lang, 'الرابط'),
            href: item.href || '/',
        }));

        const registryList: string[] = Array.isArray(raw.footer?.registry)
            ? raw.footer.registry
            : raw.registryNumbers
              ? Object.values(raw.registryNumbers).filter((v): v is string => typeof v === 'string')
              : [];

        return {
            logo: {
                href: '/',
                label: this.str(raw.wordmark || raw.footer?.wordmark, lang, 'أحمد بن عبدالله للمحاسبة القانونية'),
            },
            utility: {
                license: this.str(utilityRaw.license || utilityRaw.licence, lang, 'ترخيص مهني رقم 118'),
                network: this.str(utilityRaw.network, lang, 'عضو مستقل في شبكة دولية'),
                city: this.str(utilityRaw.city, lang, 'الرياض، المملكة العربية السعودية'),
                phone: {
                    type: 'phone' as const,
                    label: this.str(phoneRaw.label, lang, 'الهاتف'),
                    value: phoneRaw.value || '+966110000000',
                    ...(phoneRaw.href ? { href: phoneRaw.href } : {}),
                },
            },
            nav: navLinks,
            cta: this.action(raw.headerCta || raw.cta, lang, 'تواصل معنا', '/contact'),
            footer: {
                description: this.str(
                    raw.footer?.description || raw.footerDescription,
                    lang,
                    'مكتب محاسبة قانونية ومراجعة واستشارات زكوية وضريبية',
                ),
                socials: socialsRaw.map((s: any) => ({
                    network: (['linkedin', 'x', 'instagram', 'whatsapp'].includes(s.network)
                        ? s.network
                        : 'linkedin') as 'linkedin' | 'x' | 'instagram' | 'whatsapp',
                    href: s.href || s.url || 'https://linkedin.com',
                    label: this.str(s.label, lang, s.network || 'LinkedIn'),
                })),
                columns: [
                    {
                        title: lang === 'en' ? 'Quick Links' : 'روابط سريعة',
                        links: navLinks,
                    },
                    {
                        title: lang === 'en' ? 'Services' : 'خدماتنا',
                        links: serviceLinks,
                    },
                ],
                contacts: contactsRaw.map((c: any) => ({
                    type: (['phone', 'email', 'whatsapp', 'hours'].includes(c.type)
                        ? c.type
                        : 'phone') as 'phone' | 'email' | 'whatsapp' | 'hours',
                    label: this.str(c.label, lang, 'تواصل'),
                    value: this.str(c.value, lang, ''),
                    ...(c.href ? { href: c.href } : {}),
                })),
                legal: {
                    copyright: this.str(
                        raw.footer?.copyright || raw.copyright,
                        lang,
                        'جميع الحقوق محفوظة',
                    ),
                    registry: registryList,
                    links: [
                        { label: lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية', href: `/${lang}/legal/privacy` },
                        { label: lang === 'en' ? 'Terms of Use' : 'شروط الاستخدام', href: `/${lang}/legal/terms` },
                        { label: lang === 'en' ? 'Accessibility' : 'إمكانية الوصول', href: `/${lang}/legal/accessibility` },
                    ],
                },
                wordmark: this.str(raw.wordmark || raw.footer?.wordmark, lang, 'أحمد بن عبدالله'),
                offices: offices.map((o: any) => ReferenceMapper.officeToWeb(o, lang as any)),
            },
        };
    }

    async getHomePage(lang: string) {
        const [seo, raw, services, articles, credentials, clientLogos, testimonials, estimator] =
            await Promise.all([
                this.getSeo('home', lang),
                this.getSectionData('page-home'),
                this.prisma.service.findMany({
                    where: { isPublished: true, isDeleted: false },
                    orderBy: { order: 'asc' },
                    include: { translations: true },
                }),
                this.prisma.news.findMany({
                    where: { isPublished: true, isDeleted: false },
                    orderBy: { publishedAt: 'desc' },
                    take: 4,
                    include: {
                        translations: true,
                        category: true,
                        author: true,
                        sectors: { include: { sector: { include: { translations: true } } } },
                        services: { include: { service: { include: { translations: true } } } },
                    },
                }),
                this.prisma.credential.findMany({
                    where: { isPublished: true, isDeleted: false },
                    orderBy: { order: 'asc' },
                }),
                this.prisma.clientLogo.findMany({
                    where: { isPublished: true, isDeleted: false },
                    orderBy: { order: 'asc' },
                }),
                this.getTestimonialsForPlacement('home', lang),
                this.getPublicEstimator(lang),
            ]);

        const heroActions = Array.isArray(raw.hero?.actions) && raw.hero.actions.length > 0
            ? raw.hero.actions.map((a: any) => this.action(a, lang))
            : [this.action(null, lang, 'اطلب عرض سعر', '/contact')];

        const pillars = Array.isArray(raw.reasons?.pillars)
            ? raw.reasons.pillars.map((p: any) => ({
                  icon: p.icon || 'shield-check',
                  title: this.str(p.title, lang, 'ميزة'),
                  body: this.str(p.body, lang, 'وصف الميزة'),
              }))
            : [];

        const stats = Array.isArray(raw.reasons?.stats)
            ? raw.reasons.stats.map((s: any) => ({
                  value: s.value ?? '+20',
                  ...(s.prefix ? { prefix: s.prefix } : {}),
                  ...(s.suffix ? { suffix: s.suffix } : {}),
                  label: this.str(s.label, lang, 'خبرة'),
              }))
            : [];

        const steps = Array.isArray(raw.process?.steps)
            ? raw.process.steps.map((st: any, idx: number) => ({
                  index: st.index ?? idx + 1,
                  title: this.str(st.title, lang, 'خطوة'),
                  body: this.str(st.body, lang, 'تفاصيل الخطوة'),
              }))
            : [];

        const serviceItems = services.map((s: any) => ServiceMapper.toSummaryWeb(s, lang));
        const articleItems = articles.map((a: any) => NewsMapper.toSummaryWeb(a, lang as any));
        const logoRow1 = clientLogos
            .filter((l: any) => (l.row ?? 1) === 1)
            .map((l: any) => ReferenceMapper.clientLogoToWeb(l));
        const logoRow2 = clientLogos
            .filter((l: any) => l.row === 2)
            .map((l: any) => ReferenceMapper.clientLogoToWeb(l));

        const estimatorBlockRaw = raw.estimatorBlock || raw.estimator || {};
        const newsBlockRaw = raw.newsBlock || raw.news || {};

        return {
            seo,
            hero: {
                title: this.str(raw.hero?.title, lang, 'مكتب محاسبة ومراجعة قانونية'),
                ...(raw.hero?.accent ? { accent: this.str(raw.hero.accent, lang) } : {}),
                body: this.str(raw.hero?.body, lang, 'نقدم خدمات المراجعة والزكاة والضرائب'),
                actions: heroActions,
                image: this.img(raw.hero?.image, lang, 'Hero'),
            },
            gap: {
                statement: this.str(raw.gap?.statement, lang, 'نسد الفجوة بين الأرقام والقرار'),
                eyebrow: this.str(raw.gap?.eyebrow, lang, 'رؤيتنا المهنية'),
                body: this.str(raw.gap?.body, lang, 'نراجع القوائم المالية بدقة وشفافية'),
                ...(Array.isArray(raw.gap?.images)
                    ? { images: raw.gap.images.map((im: any) => this.img(im, lang)) }
                    : {}),
            },
            clients: {
                rows: [logoRow1, logoRow2],
            },
            services: {
                eyebrow: this.str(raw.services?.eyebrow, lang, 'خدماتنا المهنية'),
                title: this.str(raw.services?.title, lang, 'حلول متكاملة'),
                ...(raw.services?.accent ? { accent: this.str(raw.services.accent, lang) } : {}),
                intro: this.str(raw.services?.intro, lang, 'نقدم خدمات المراجعة والزكاة والاستشارات'),
                ctaLabel: this.str(raw.services?.ctaLabel, lang, 'استكشف الخدمة'),
                items: serviceItems,
            },
            reasons: {
                title: this.str(raw.reasons?.title, lang, 'لماذا يختارنا العملاء'),
                description: this.str(raw.reasons?.description, lang, 'التزام كامل بالمعايير المهنية'),
                ...(raw.reasons?.action ? { action: this.action(raw.reasons.action, lang) } : {}),
                pillars,
                ...(raw.reasons?.image ? { image: this.img(raw.reasons.image, lang) } : {}),
                stats,
            },
            credentials: {
                title: this.str(raw.credentials?.title, lang, 'الاعتمادات والتراخيص المهنية'),
                ...(raw.credentials?.description
                    ? { description: this.str(raw.credentials.description, lang) }
                    : {}),
                logos: credentials.map((c: any) => ReferenceMapper.credentialToWeb(c, lang as any)),
            },
            process: {
                eyebrow: this.str(raw.process?.eyebrow, lang, 'منهجية العمل'),
                title: this.str(raw.process?.title, lang, 'خطوات واضحة'),
                ...(raw.process?.accent ? { accent: this.str(raw.process.accent, lang) } : {}),
                description: this.str(raw.process?.description, lang, 'نعمل وفق منهجية معتمدة'),
                steps,
            },
            partnerQuote: {
                title: this.str(raw.partnerQuote?.title, lang, 'كلمة الشريك المدير'),
                body: this.str(raw.partnerQuote?.body, lang, 'نلتزم بأعلى معايير الجودة المهنية'),
                ...(raw.partnerQuote?.action
                    ? { action: this.action(raw.partnerQuote.action, lang) }
                    : {}),
                ...(raw.partnerQuote?.image
                    ? { image: this.img(raw.partnerQuote.image, lang) }
                    : {}),
            },
            newsBlock: {
                eyebrow: this.str(newsBlockRaw.eyebrow, lang, 'المدونة المهنية'),
                title: this.str(newsBlockRaw.title, lang, 'أحدث المقالات والإصدارات'),
                ...(newsBlockRaw.action ? { action: this.action(newsBlockRaw.action, lang) } : {}),
            },
            news: articleItems,
            estimatorBlock: {
                title: this.str(estimatorBlockRaw.title, lang, 'حاسبة الأتعاب التقديرية'),
                body: this.str(estimatorBlockRaw.body, lang, 'احصل على تقدير استرشادي فوري'),
            },
            estimator,
            testimonials,
            testimonial: testimonials[0] ?? null,
        };
    }

    async getAboutPage(lang: string) {
        const [seo, raw, credentials, clientLogos, offices, testimonials, estimator] =
            await Promise.all([
                this.getSeo('about', lang),
                this.getSectionData('page-about'),
                this.prisma.credential.findMany({
                    where: { isPublished: true, isDeleted: false },
                    orderBy: { order: 'asc' },
                }),
                this.prisma.clientLogo.findMany({
                    where: { isPublished: true, isDeleted: false },
                    orderBy: { order: 'asc' },
                }),
                this.prisma.office.findMany({
                    where: { isPublished: true, isDeleted: false },
                    orderBy: { order: 'asc' },
                }),
                this.getTestimonialsForPlacement('about', lang),
                this.getPublicEstimator(lang),
            ]);

        const sigRaw = raw.signatoryBlock || raw.signatory;
        const commitmentsItems = Array.isArray(raw.commitments?.items)
            ? raw.commitments.items.map((item: any) => ({
                  title: this.str(item.title, lang, 'التزام'),
                  body: this.str(item.body, lang, 'تفاصيل الالتزام'),
              }))
            : [];

        return {
            seo,
            hero: this.hero(raw.hero, lang, 'عن المكتب'),
            statement: this.str(raw.statement, lang, 'خبرة مهنية راسخة في المحاسبة والمراجعة'),
            licenceBody: this.str(raw.licenceBody, lang, 'مرخصون من الهيئة السعودية للمراجعين والمحاسبين'),
            ...(raw.action ? { action: this.action(raw.action, lang) } : {}),
            ...(sigRaw
                ? {
                      signatoryBlock: {
                          eyebrow: this.str(sigRaw.eyebrow, lang, 'الشريك المدير'),
                          title: this.str(sigRaw.title, lang, 'أحمد بن عبدالله'),
                          ...(sigRaw.accent ? { accent: this.str(sigRaw.accent, lang) } : {}),
                          paragraphs: Array.isArray(sigRaw.paragraphs)
                              ? sigRaw.paragraphs.map((p: any) => this.str(p, lang))
                              : [],
                          ...(sigRaw.action ? { action: this.action(sigRaw.action, lang) } : {}),
                          ...(sigRaw.image ? { image: this.img(sigRaw.image, lang) } : {}),
                          ...(sigRaw.caption ? { caption: this.str(sigRaw.caption, lang) } : {}),
                      },
                  }
                : {}),
            commitments: {
                title: this.str(raw.commitments?.title, lang, 'التزاماتنا المهنية'),
                ...(raw.commitments?.subtitle
                    ? { subtitle: this.str(raw.commitments.subtitle, lang) }
                    : {}),
                items: commitmentsItems,
            },
            officesTitle: this.str(raw.officesTitle, lang, 'مكاتبنا في المملكة'),
            ...(raw.partnerQuote
                ? {
                      partnerQuote: {
                          title: this.str(raw.partnerQuote.title, lang),
                          body: this.str(raw.partnerQuote.body, lang),
                          ...(raw.partnerQuote.action
                              ? { action: this.action(raw.partnerQuote.action, lang) }
                              : {}),
                          ...(raw.partnerQuote.image
                              ? { image: this.img(raw.partnerQuote.image, lang) }
                              : {}),
                      },
                  }
                : {}),
            credentials: credentials.map((c: any) => ReferenceMapper.credentialToWeb(c, lang as any)),
            clients: clientLogos.map((l: any) => ReferenceMapper.clientLogoToWeb(l)),
            offices: offices.map((o: any) => ReferenceMapper.officeToWeb(o, lang as any)),
            testimonial: testimonials[0] ?? null,
            estimator,
        };
    }

    async getServicesPage(lang: string) {
        const [seo, raw, services, testimonials, estimator] = await Promise.all([
            this.getSeo('services', lang),
            this.getSectionData('page-services'),
            this.prisma.service.findMany({
                where: { isPublished: true, isDeleted: false },
                orderBy: { order: 'asc' },
                include: { translations: true },
            }),
            this.getTestimonialsForPlacement('services', lang),
            this.getPublicEstimator(lang),
        ]);

        return {
            seo,
            hero: this.hero(raw.hero, lang, 'خدماتنا المهنية'),
            statement: this.str(raw.statement, lang, 'نقدم حزمة متكاملة من الخدمات المهنية'),
            items: services.map((s: any) => ServiceMapper.toSummaryWeb(s, lang)),
            ...(raw.partnerQuote
                ? {
                      partnerQuote: {
                          title: this.str(raw.partnerQuote.title, lang),
                          body: this.str(raw.partnerQuote.body, lang),
                          ...(raw.partnerQuote.action
                              ? { action: this.action(raw.partnerQuote.action, lang) }
                              : {}),
                          ...(raw.partnerQuote.image
                              ? { image: this.img(raw.partnerQuote.image, lang) }
                              : {}),
                      },
                  }
                : {}),
            testimonial: testimonials[0] ?? null,
            estimator,
        };
    }

    async getSectorsPage(lang: string) {
        const [seo, raw, sectors, clientLogos, caseStoryArticles, estimator] = await Promise.all([
            this.getSeo('sectors', lang),
            this.getSectionData('page-sectors'),
            this.prisma.sector.findMany({
                where: { isPublished: true, isDeleted: false },
                orderBy: { order: 'asc' },
                include: { translations: true },
            }),
            this.prisma.clientLogo.findMany({
                where: { isPublished: true, isDeleted: false },
                orderBy: { order: 'asc' },
            }),
            this.prisma.news.findMany({
                where: {
                    isPublished: true,
                    isDeleted: false,
                    category: { isCaseStory: true },
                },
                orderBy: { publishedAt: 'desc' },
                take: 4,
                include: {
                    translations: true,
                    category: true,
                    author: true,
                    sectors: { include: { sector: { include: { translations: true } } } },
                    services: { include: { service: { include: { translations: true } } } },
                },
            }),
            this.getPublicEstimator(lang),
        ]);

        const sectorItems = sectors.map((s: any) => SectorMapper.toSummaryWeb(s, lang));
        const featuredSector = sectorItems.find((s: any) => s.featured) ?? null;

        return {
            seo,
            hero: this.hero(raw.hero, lang, 'القطاعات التي نخدمها'),
            statement: this.str(raw.statement, lang, 'خبرة قطاعية متعمقة'),
            indexTitle: this.str(raw.indexTitle, lang, 'القطاعات الاقتصادية'),
            indexDescription: this.str(raw.indexDescription, lang, 'نواكب متطلبات مختلف القطاعات'),
            items: sectorItems,
            featuredBand: featuredSector,
            clients: clientLogos.map((l: any) => ReferenceMapper.clientLogoToWeb(l)),
            caseStories: {
                eyebrow: this.str(raw.caseStories?.eyebrow, lang, 'قصص نجاح'),
                title: this.str(raw.caseStories?.title, lang, 'تجارب واقعية مع عملائنا'),
                ...(raw.caseStories?.action
                    ? { action: this.action(raw.caseStories.action, lang) }
                    : {}),
                items: caseStoryArticles.map((a: any) => NewsMapper.toSummaryWeb(a, lang as any)),
            },
            estimator,
        };
    }

    async getArticlesPage(
        lang: string,
        query: { category?: string; page?: number; pageSize?: number } = {},
    ) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 12;

        const where: any = {
            isPublished: true,
            isDeleted: false,
            ...(query.category ? { category: { slug: query.category } } : {}),
        };

        const [seo, raw, featuredRows, categories, articleRows, testimonials, estimator] =
            await Promise.all([
                this.getSeo('articles', lang),
                this.getSectionData('page-articles'),
                this.prisma.news.findMany({
                    where: { isPublished: true, isDeleted: false, isFeatured: true },
                    orderBy: { publishedAt: 'desc' },
                    take: 3,
                    include: {
                        translations: true,
                        category: true,
                        author: true,
                        sectors: { include: { sector: { include: { translations: true } } } },
                        services: { include: { service: { include: { translations: true } } } },
                    },
                }),
                this.prisma.articleCategory.findMany({
                    orderBy: { order: 'asc' },
                }),
                this.prisma.news.findMany({
                    where,
                    orderBy: { publishedAt: 'desc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    include: {
                        translations: true,
                        category: true,
                        author: true,
                        sectors: { include: { sector: { include: { translations: true } } } },
                        services: { include: { service: { include: { translations: true } } } },
                    },
                }),
                this.getTestimonialsForPlacement('articles', lang),
                this.getPublicEstimator(lang),
            ]);

        return {
            seo,
            hero: this.hero(raw.hero, lang, 'المدونة والمقالات المهنية'),
            featuredTitle: this.str(raw.featuredTitle, lang, 'مقالات مختارة'),
            listEyebrow: this.str(raw.listEyebrow, lang, 'الإصدارات المهنية'),
            listTitle: this.str(raw.listTitle, lang, 'جميع المقالات'),
            featured: featuredRows.map((a: any) => NewsMapper.toSummaryWeb(a, lang as any)),
            categories: categories.map((c: any) => ({
                id: c.id,
                slug: c.slug,
                name: this.str(c.name, lang),
                isCaseStory: Boolean(c.isCaseStory),
            })),
            items: articleRows.map((a: any) => NewsMapper.toSummaryWeb(a, lang as any)),
            testimonial: testimonials[0] ?? null,
            estimator,
        };
    }

    async getCareersPage(lang: string, query: { department?: string } = {}) {
        const now = new Date();
        const jobWhere: any = {
            isPublished: true,
            isDeleted: false,
            OR: [{ closesAt: null }, { closesAt: { gt: now } }],
            ...(query.department ? { department: { slug: query.department } } : {}),
        };

        const [seo, raw, departments, jobs] = await Promise.all([
            this.getSeo('careers', lang),
            this.getSectionData('page-careers'),
            this.prisma.jobDepartment.findMany({
                orderBy: { order: 'asc' },
            }),
            this.prisma.job.findMany({
                where: jobWhere,
                orderBy: { order: 'asc' },
                include: {
                    translations: true,
                    department: true,
                    office: true,
                },
            }),
        ]);

        const perksItems = Array.isArray(raw.perks?.items)
            ? raw.perks.items.map((p: any) => ({
                  ...(p.icon ? { icon: p.icon } : {}),
                  title: this.str(p.title, lang, 'ميزة'),
                  body: this.str(p.body, lang, 'وصف الميزة'),
              }))
            : [];

        const hiringSteps = Array.isArray(raw.hiringSteps?.steps)
            ? raw.hiringSteps.steps.map((st: any) => ({
                  title: this.str(st.title, lang, 'خطوة التوظيف'),
                  body: this.str(st.body, lang, 'وصف الخطوة'),
              }))
            : [];

        return {
            seo,
            hero: this.hero(raw.hero, lang, 'انضم إلى فريقنا المهني'),
            perks: {
                eyebrow: this.str(raw.perks?.eyebrow, lang, 'بيئة العمل'),
                title: this.str(raw.perks?.title, lang, 'مزايا العمل معنا'),
                items: perksItems,
            },
            ...(raw.team
                ? {
                      team: {
                          eyebrow: this.str(raw.team.eyebrow, lang, 'فريقنا'),
                          title: this.str(raw.team.title, lang, 'بيئة مهنية محفزة'),
                          ...(raw.team.accent ? { accent: this.str(raw.team.accent, lang) } : {}),
                          body: this.str(raw.team.body, lang, 'ندعم التطور المهني المستمر'),
                          ...(raw.team.image ? { image: this.img(raw.team.image, lang) } : {}),
                      },
                  }
                : {}),
            jobsEyebrow: this.str(raw.jobsEyebrow, lang, 'الفرص المتاحة'),
            jobsTitle: this.str(raw.jobsTitle, lang, 'الوظائف الشاغرة'),
            departments: departments.map((d: any) => ({
                id: d.id,
                slug: d.slug,
                name: this.str(d.name, lang),
            })),
            items: jobs.map((j: any) => JobMapper.toSummaryWeb(j, lang as any)),
            hiringSteps: {
                eyebrow: this.str(raw.hiringSteps?.eyebrow, lang, 'رحلة التوظيف'),
                title: this.str(raw.hiringSteps?.title, lang, 'خطوات الانضمام'),
                steps: hiringSteps,
            },
        };
    }

    async getContactPage(lang: string) {
        const [seo, raw, offices, faqs, services] = await Promise.all([
            this.getSeo('contact', lang),
            this.getSectionData('page-contact'),
            this.prisma.office.findMany({
                where: { isPublished: true, isDeleted: false },
                orderBy: { order: 'asc' },
            }),
            this.prisma.faqItem.findMany({
                where: { isPublished: true, isDeleted: false, scope: 'contact' },
                orderBy: { order: 'asc' },
            }),
            this.prisma.service.findMany({
                where: { isPublished: true, isDeleted: false },
                orderBy: { order: 'asc' },
                include: { translations: true },
            }),
        ]);

        const officeItems = offices.map((o: any) => ReferenceMapper.officeToWeb(o, lang as any));
        const faqItems = faqs.map((f: any) => ReferenceMapper.faqToWeb(f, lang as any));
        const serviceOptions = services.map((s: any) => {
            const summary = ServiceMapper.toSummaryWeb(s, lang);
            return { id: summary.id, slug: summary.slug, title: summary.title };
        });

        return {
            seo,
            hero: this.hero(raw.hero, lang, 'تواصل معنا'),
            intro: {
                eyebrow: this.str(raw.intro?.eyebrow, lang, 'قنوات التواصل'),
                title: this.str(raw.intro?.title, lang, 'نسعد بخدمتكم'),
                body: this.str(raw.intro?.body, lang, 'فريقنا جاهز للرد على استفساراتكم المهنية'),
            },
            form: {
                title: this.str(raw.form?.title, lang, 'أرسل استفسارك'),
                subtitle: this.str(raw.form?.subtitle, lang, 'سنقوم بالرد خلال يوم عمل واحد'),
                successTitle: this.str(raw.form?.successTitle, lang, 'تم استلام طلبكم بنجاح'),
                successBody: this.str(raw.form?.successBody, lang, 'سيتواصل معكم فريقنا المختص قريباً'),
            },
            offices: {
                eyebrow: this.str(raw.offices?.eyebrow, lang, 'فروعنا'),
                title: this.str(raw.offices?.title, lang, 'مكاتبنا في المملكة'),
                ...(raw.offices?.mapImage
                    ? { mapImage: this.img(raw.offices.mapImage, lang, 'خريطة المكاتب') }
                    : {}),
                items: officeItems,
            },
            faq: {
                eyebrow: this.str(raw.faq?.eyebrow, lang, 'الأسئلة الشائعة'),
                title: this.str(raw.faq?.title, lang, 'إجابات سريعة'),
                items: faqItems,
            },
            serviceOptions,
        };
    }

    async getLegalPage(key: string, lang: string) {
        if (!VALID_LEGAL_KEYS.includes(key as any)) {
            throw new NotFoundException(`Legal page not found: ${key}`);
        }

        const [seo, raw] = await Promise.all([
            this.getSeo(key, lang),
            this.getSectionData(`legal-${key}`),
        ]);

        const summary = Array.isArray(raw.summary)
            ? raw.summary.map((item: any) => this.str(item, lang))
            : [];

        const sections = Array.isArray(raw.sections)
            ? raw.sections.map((sec: any, idx: number) => ({
                  id: String(sec.id || `sec-${idx + 1}`),
                  title: this.str(sec.title, lang, 'بند'),
                  body: this.str(sec.body, lang, ''),
              }))
            : [];

        const pdfUrl = this.str(raw.pdfUrl, lang);

        return {
            seo,
            version: String(raw.version || '1.0'),
            updatedAt: String(raw.updatedAt || '2026-11-18'),
            hero: {
                title: this.str(raw.hero?.title, lang, 'السياسات القانونية'),
                ...(raw.hero?.subtitle ? { subtitle: this.str(raw.hero.subtitle, lang) } : {}),
            },
            summary,
            sections,
            ...(pdfUrl ? { pdfUrl } : {}),
            ...(raw.questionCard
                ? {
                      questionCard: {
                          title: this.str(raw.questionCard.title, lang),
                          body: this.str(raw.questionCard.body, lang),
                          action: this.action(raw.questionCard.action, lang),
                      },
                  }
                : {}),
        };
    }
}
