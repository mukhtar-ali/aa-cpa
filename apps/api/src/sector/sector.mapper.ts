import {
    SectorAdmin,
    SectorDetailWeb,
    SectorSummaryWeb,
} from '@repo/shared';

function resolveField(val: any, lang: string): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.ar || val.en || '';
}

export class SectorMapper {
    static toSummaryWeb(sector: any, lang: string): SectorSummaryWeb & { isFallback?: boolean } {
        const arTr = sector.translations?.find((t: any) => t.language === 'ar');
        const langTr = sector.translations?.find((t: any) => t.language === lang);
        const tr = langTr || arTr || sector.translations?.[0] || {};
        const isFallback = lang !== 'ar' && !langTr && !!arTr;

        let bandImgRef: any = undefined;
        if (sector.bandImage) {
            const img = sector.bandImage;
            bandImgRef = {
                src: img.url || img.src || '',
                alt: resolveField(img.alt, lang) || tr.title || '',
                width: img.width || 1200,
                height: img.height || 400,
            };
        }

        return {
            id: sector.id,
            slug: sector.slug,
            title: tr.title || '',
            summary: tr.summary || '',
            icon: sector.icon || undefined,
            featured: sector.featured ?? false,
            bandImage: bandImgRef,
            bandTitle: tr.bandTitle || undefined,
            bandBody: tr.bandBody || undefined,
            bandCtaLabel: tr.bandCtaLabel || undefined,
            href: `/${lang}/sectors/${sector.slug}`,
            isFallback,
        };
    }

    static toDetailWeb(sector: any, lang: string): SectorDetailWeb {
        const summary = this.toSummaryWeb(sector, lang);

        const services = (sector.services || []).map((rel: any) => {
            const serv = rel.service || rel;
            const servTr = serv.translations?.find((t: any) => t.language === lang) || serv.translations?.find((t: any) => t.language === 'ar') || {};
            return {
                id: serv.id,
                slug: serv.slug,
                title: servTr.title || serv.slug,
            };
        });

        return {
            ...summary,
            services,
        };
    }

    static toAdmin(sector: any): SectorAdmin {
        const arTr = sector.translations?.find((t: any) => t.language === 'ar') || {};
        const enTr = sector.translations?.find((t: any) => t.language === 'en') || {};

        const hasArTitle = Boolean(arTr.title?.trim());
        const hasArSummary = Boolean(arTr.summary?.trim());
        const arStatus = hasArTitle && hasArSummary ? 'complete' : hasArTitle || hasArSummary ? 'partial' : 'missing';

        const hasEnTitle = Boolean(enTr.title?.trim());
        const hasEnSummary = Boolean(enTr.summary?.trim());
        const enStatus = hasEnTitle && hasEnSummary ? 'complete' : hasEnTitle || hasEnSummary ? 'partial' : 'missing';

        return {
            id: sector.id,
            slug: sector.slug,
            icon: sector.icon || '',
            featured: sector.featured ?? false,
            bandImage: sector.bandImage || null,
            order: sector.order,
            isPublished: sector.isPublished,
            publishedAt: sector.publishedAt,
            title: {
                ar: arTr.title || '',
                en: enTr.title || '',
            },
            summary: {
                ar: arTr.summary || '',
                en: enTr.summary || '',
            },
            bandTitle: {
                ar: arTr.bandTitle || '',
                en: enTr.bandTitle || '',
            },
            bandBody: {
                ar: arTr.bandBody || '',
                en: enTr.bandBody || '',
            },
            bandCtaLabel: {
                ar: arTr.bandCtaLabel || '',
                en: enTr.bandCtaLabel || '',
            },
            stats: [],
            painPoints: [],
            serviceIds: (sector.services || []).map((s: any) => s.serviceId || s.id),
            faqIds: [],
            createdAt: sector.createdAt,
            updatedAt: sector.updatedAt,
            translationStatus: {
                ar: arStatus,
                en: enStatus,
            },
            services: sector.services,
            faqs: [],
        };
    }
}
