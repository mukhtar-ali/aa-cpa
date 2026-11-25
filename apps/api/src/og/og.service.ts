import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { OgQueryModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { publishedNow } from '@/common/visibility';
import { customEnv } from '@/config/custom-env';
import { computeOgContentHash } from './og.hash';
import { renderOgSvg } from './og.template';

export const KNOWN_PAGE_TITLES: Record<string, { ar: string; en: string }> = {
    home: {
        ar: 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية',
        en: 'Abdulrahman Al-Shubaishiri Professional Consulting',
    },
    about: { ar: 'من نحن', en: 'About Us' },
    services: { ar: 'خدماتنا', en: 'Our Services' },
    sectors: { ar: 'القطاعات', en: 'Sectors' },
    articles: { ar: 'المقالات والبحوث', en: 'Articles & Insights' },
    careers: { ar: 'انضم إلى فريقنا', en: 'Careers' },
    contact: { ar: 'تواصل معنا', en: 'Contact Us' },
    privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    terms: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
    accessibility: { ar: 'إمكانية الوصول', en: 'Accessibility Statement' },
};

@Injectable()
export class OgService {
    private readonly logger = new Logger(OgService.name);

    constructor(private readonly prisma: PrismaService) {}

    get cacheDir(): string {
        const base =
            customEnv.UPLOADS_DIR && customEnv.UPLOADS_DIR.trim() !== ''
                ? customEnv.UPLOADS_DIR
                : join(process.cwd(), 'storage');
        return join(resolve(base), 'og-cache');
    }

    async resolveContent(
        type: OgQueryModel['type'],
        key: string,
        lang: 'ar' | 'en',
    ): Promise<{ title: string; eyebrow?: string }> {
        const cleanKey = key.trim();

        if (type === 'page') {
            const seo = await this.prisma.seo.findUnique({
                where: { pageKey: cleanKey },
            });

            const content = seo?.content as any;
            const customTitle =
                content?.ogTitle?.[lang] ||
                content?.title?.[lang] ||
                content?.ogTitle?.ar ||
                content?.title?.ar;

            if (customTitle && typeof customTitle === 'string' && customTitle.trim() !== '') {
                return {
                    title: customTitle.trim(),
                    eyebrow: lang === 'ar' ? 'بوابة الشركة' : 'Firm Portal',
                };
            }

            const known = KNOWN_PAGE_TITLES[cleanKey];
            if (known) {
                return {
                    title: known[lang] || known.ar,
                    eyebrow: lang === 'ar' ? 'بوابة الشركة' : 'Firm Portal',
                };
            }

            throw new NotFoundException(`Page not found: ${cleanKey}`);
        }

        if (type === 'service') {
            const service = await this.prisma.service.findFirst({
                where: {
                    slug: cleanKey,
                    isDeleted: false,
                    ...publishedNow(),
                },
                include: {
                    translations: true,
                },
            });

            if (!service) {
                throw new NotFoundException(`Service not found: ${cleanKey}`);
            }

            const tr =
                service.translations.find((t) => t.language === lang) ||
                service.translations.find((t) => t.language === 'ar') ||
                service.translations[0];

            const title = tr?.title || tr?.heroSubtitle || cleanKey;
            return {
                title,
                eyebrow: lang === 'ar' ? 'خدماتنا' : 'Services',
            };
        }

        if (type === 'article') {
            const article = await this.prisma.news.findFirst({
                where: {
                    slug: cleanKey,
                    isDeleted: false,
                    ...publishedNow(),
                },
                include: {
                    translations: true,
                    category: true,
                },
            });

            if (!article) {
                throw new NotFoundException(`Article not found: ${cleanKey}`);
            }

            const tr =
                article.translations.find((t) => t.language === lang) ||
                article.translations.find((t) => t.language === 'ar') ||
                article.translations[0];

            const title = tr?.title || cleanKey;
            const categoryName = (article.category as any)?.name;
            return {
                title,
                eyebrow: categoryName || (lang === 'ar' ? 'المقالات والبحوث' : 'Articles & Insights'),
            };
        }

        if (type === 'job') {
            const job = await this.prisma.job.findFirst({
                where: {
                    slug: cleanKey,
                    isDeleted: false,
                    ...publishedNow(),
                },
                include: {
                    translations: true,
                    department: true,
                },
            });

            if (!job) {
                throw new NotFoundException(`Job not found: ${cleanKey}`);
            }

            const tr =
                job.translations.find((t) => t.language === lang) ||
                job.translations.find((t) => t.language === 'ar') ||
                job.translations[0];

            const title = tr?.title || cleanKey;
            const deptName = (job.department as any)?.name;
            return {
                title,
                eyebrow: deptName || (lang === 'ar' ? 'فرص العمل' : 'Careers'),
            };
        }

        throw new NotFoundException(`Unknown OG type: ${type}`);
    }

    async render(query: OgQueryModel): Promise<{ buffer: Buffer; hash: string }> {
        const lang = query.lang === 'en' ? 'en' : 'ar';
        const { title, eyebrow } = await this.resolveContent(query.type, query.key, lang);

        const hash = computeOgContentHash({
            type: query.type,
            key: query.key,
            lang,
            title,
            eyebrow,
        });

        const dir = this.cacheDir;
        await fs.mkdir(dir, { recursive: true });
        const cachePath = join(dir, `${hash}.png`);

        try {
            const cachedBuffer = await fs.readFile(cachePath);
            return { buffer: cachedBuffer, hash };
        } catch {
            // Not in cache, proceed to render
        }

        const svg = renderOgSvg({ title, eyebrow, lang });
        const buffer = await sharp(Buffer.from(svg))
            .png({ compressionLevel: 8 })
            .toBuffer();

        try {
            await fs.writeFile(cachePath, buffer);
        } catch (err) {
            this.logger.warn(`Failed to write OG image cache file: ${err}`);
        }

        return { buffer, hash };
    }
}
