import {
    ServiceAdminModel,
    ServiceDetailWeb,
    ServiceSummaryWeb,
} from '@repo/shared';

function resolveField(val: any, lang: string): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.ar || val.en || '';
}

export class ServiceMapper {
    static toSummaryWeb(service: any, lang: string): ServiceSummaryWeb & { isFallback?: boolean } {
        const arTr = service.translations?.find((t: any) => t.language === 'ar');
        const langTr = service.translations?.find((t: any) => t.language === lang);
        const tr = langTr || arTr || service.translations?.[0] || {};
        const isFallback = lang !== 'ar' && !langTr && !!arTr;

        let imgRef: any = undefined;
        if (service.image) {
            const img = service.image;
            imgRef = {
                src: img.url || img.src || '',
                alt: resolveField(img.alt, lang) || tr.title || '',
                width: img.width || 800,
                height: img.height || 600,
            };
        }

        let highlight: any = undefined;
        if (service.highlight) {
            highlight = {
                label: resolveField(service.highlight.label, lang),
                value: resolveField(service.highlight.value, lang),
                note: resolveField(service.highlight.note, lang) || undefined,
            };
        }

        return {
            id: service.id,
            slug: service.slug,
            title: tr.title || '',
            summary: tr.summary || '',
            image: imgRef,
            href: `/${lang}/services/${service.slug}`,
            ctaLabel: lang === 'ar' ? 'تفاصيل الخدمة' : 'Service Details',
            highlight,
            isFallback,
        };
    }

    static toDetailWeb(service: any, lang: string): ServiceDetailWeb {
        const summary = this.toSummaryWeb(service, lang);
        const arTr = service.translations?.find((t: any) => t.language === 'ar');
        const langTr = service.translations?.find((t: any) => t.language === lang);
        const tr = langTr || arTr || service.translations?.[0] || {};

        const methodology = (service.methodology || []).map((m: any) => ({
            title: resolveField(m.title, lang),
            body: resolveField(m.body, lang),
        }));

        const deliverables = (service.deliverables || []).map((d: any) => ({
            title: resolveField(d.title, lang),
            body: d.body ? resolveField(d.body, lang) : undefined,
        }));

        const sectors = (service.sectors || []).map((rel: any) => {
            const sec = rel.sector || rel;
            const secTr = sec.translations?.find((t: any) => t.language === lang) || sec.translations?.find((t: any) => t.language === 'ar') || {};
            return {
                id: sec.id,
                slug: sec.slug,
                title: secTr.title || sec.slug,
            };
        });

        const faqs = (service.faqs || []).map((f: any) => ({
            id: f.id,
            question: resolveField(f.question, lang),
            answer: resolveField(f.answer, lang),
        }));

        return {
            ...summary,
            heroSubtitle: tr.heroSubtitle || undefined,
            statement: tr.statement || undefined,
            audience: tr.audience || undefined,
            whyUs: tr.whyUs || undefined,
            methodology,
            deliverables,
            sectors,
            faqs,
            seo: {
                metaTitle: tr.metaTitle || undefined,
                metaDescription: tr.metaDescription || undefined,
                keywords: tr.keywords || undefined,
                ogImage: (service.ogImage?.url || service.ogImage) || undefined,
                noindex: service.noindex ?? false,
            },
        };
    }

    static toAdmin(service: any): ServiceAdminModel {
        const arTr = service.translations?.find((t: any) => t.language === 'ar');
        const enTr = service.translations?.find((t: any) => t.language === 'en');

        const arStatus = arTr?.title && arTr?.summary ? 'complete' : arTr?.title ? 'partial' : 'missing';
        const enStatus = enTr?.title && enTr?.summary ? 'complete' : enTr?.title ? 'partial' : 'missing';

        const sectorIds = (service.sectors || []).map((s: any) => s.sectorId || s.id);
        const faqIds = (service.faqs || []).map((f: any) => f.id);

        return {
            id: service.id,
            slug: service.slug,
            image: service.image || null,
            heroImage: service.heroImage || null,
            icon: service.icon || '',
            highlight: service.highlight || null,
            methodology: service.methodology || [],
            deliverables: service.deliverables || [],
            order: service.order ?? 0,
            isPublished: service.isPublished ?? false,
            publishedAt: service.publishedAt || null,
            ogImage: service.ogImage || null,
            noindex: service.noindex ?? false,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
            title: { ar: arTr?.title || '', en: enTr?.title || '' },
            summary: { ar: arTr?.summary || '', en: enTr?.summary || '' },
            heroSubtitle: { ar: arTr?.heroSubtitle || '', en: enTr?.heroSubtitle || '' },
            statement: { ar: arTr?.statement || '', en: enTr?.statement || '' },
            audience: { ar: arTr?.audience || '', en: enTr?.audience || '' },
            whyUs: { ar: arTr?.whyUs || '', en: enTr?.whyUs || '' },
            metaTitle: { ar: arTr?.metaTitle || '', en: enTr?.metaTitle || '' },
            metaDescription: { ar: arTr?.metaDescription || '', en: enTr?.metaDescription || '' },
            keywords: { ar: arTr?.keywords || '', en: enTr?.keywords || '' },
            sectorIds,
            faqIds,
            translationStatus: {
                ar: arStatus as any,
                en: enStatus as any,
            },
            sectors: service.sectors,
            faqs: service.faqs,
        };
    }
}
