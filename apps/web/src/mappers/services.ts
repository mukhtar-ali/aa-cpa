import type { ActionRef, FaqItem, ImageRef, MethodologyRow, ServiceSummary } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toActionRef } from './actions';
import { toPageHero, type HeroApi } from './hero';
import { localizeHref } from './href';
import { toImageRef, type ImageLike } from './image';

type Act = Parameters<typeof toActionRef>[0];

interface ServiceApi {
    id: string;
    slug: string;
    title: string;
    summary: string;
    image?: ImageLike;
    href?: string;
    ctaLabel?: string;
    highlight?: ServiceSummary['highlight'];
}

export interface ServicesPageApi {
    hero: HeroApi;
    statement: string;
    items?: ServiceApi[];
    partnerQuote?: { title: string; body: string; action?: Act; image?: ImageLike };
}

export interface ServiceDetailApi extends ServiceApi {
    heroSubtitle?: string;
    statement?: string;
    audience?: string;
    whyUs?: string;
    methodology: { title: string; body: string }[];
    deliverables: { title: string; body?: string }[];
    sectors?: { id: string; slug: string; title: string }[];
    faqs?: FaqItem[];
    redirectTo?: string;
    isFallback?: boolean;
    seo?: unknown;
}

/** Path of a service page without the locale. */
export const servicePath = (slug: string) => `/services/${slug}`;

export function toServiceSummary(s: ServiceApi, lang: Lang, fallbackCta: string): ServiceSummary {
    return {
        id: s.id,
        title: s.title,
        summary: s.summary,
        image: toImageRef(s.image),
        href: localizeHref(lang, s.href ?? servicePath(s.slug)),
        ctaLabel: s.ctaLabel ?? fallbackCta,
        highlight: s.highlight,
    };
}

export function toServicesProps(api: ServicesPageApi, lang: Lang, fallbackCta: string) {
    return {
        hero: toPageHero(api.hero, lang),
        statement: api.statement,
        services: (api.items ?? []).map((s) => toServiceSummary(s, lang, fallbackCta)),
        quote: api.partnerQuote && { title: api.partnerQuote.title, body: api.partnerQuote.body, action: api.partnerQuote.action ? (toActionRef(api.partnerQuote.action, lang) as ActionRef) : undefined, image: toImageRef(api.partnerQuote.image) as ImageRef | undefined },
    };
}

/** Contact CTA carrying the service so the form can preselect it (`?service=`, FR-003). */
export const contactHref = (lang: Lang, slug: string) => localizeHref(lang, `/contact?service=${encodeURIComponent(slug)}`);

export function toServiceDetailProps(api: ServiceDetailApi, lang: Lang) {
    const methodology: MethodologyRow[] = api.methodology.map((m) => ({ title: m.title, body: m.body }));
    return {
        title: api.title,
        subtitle: api.heroSubtitle ?? api.summary,
        image: toImageRef(api.image, { decorative: true }),
        statement: api.statement,
        audience: api.audience,
        whyUs: api.whyUs,
        methodology,
        deliverables: api.deliverables,
        sectors: (api.sectors ?? []).map((s) => ({ ...s, href: localizeHref(lang, `/sectors#${s.slug}`) })),
        faqs: api.faqs ?? [],
        contactHref: contactHref(lang, api.slug),
        isFallback: Boolean(api.isFallback),
    };
}
