import type { ArticleSummary, LogoItem, ProcessStep, ServiceSummary, Stat, Pillar, ImageRef } from '@repo/design-system/types';
import type { ActionRef } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toActionRef } from './actions';
import { localizeHref } from './href';
import { toImageRef } from './image';

/** The fields of `/api/pages/home` the page reads (shape: `HomePageWebSchema` plus `clients`, `testimonial`). Loose on purpose: CMS-owned. */
export interface HomeApi {
    hero: { title: string; accent?: string; body: string; actions: Parameters<typeof toActionRef>[0][]; image?: { src: string; alt?: string; width?: number; height?: number } };
    gap: { statement: string; eyebrow: string; body: string; images?: { src: string; alt?: string; width?: number; height?: number }[] };
    clients?: { rows: { name: string; image?: { src: string; alt?: string; width?: number; height?: number }; href?: string }[][] };
    services: { eyebrow: string; title: string; accent?: string; intro: string; ctaLabel: string; items?: Record<string, unknown>[] } | Record<string, unknown>[];
    reasons: { title: string; description: string; action?: Parameters<typeof toActionRef>[0]; pillars: Pillar[]; image?: { src: string; alt?: string; width?: number; height?: number }; stats: Stat[] };
    credentials: { title: string; description?: string; logos?: { name: string; image?: { src: string; alt?: string; width?: number; height?: number }; href?: string }[] };
    process: { eyebrow: string; title: string; accent?: string; description: string; steps: { index?: number; title: string; body: string }[] };
    partnerQuote: { title: string; body: string; action?: Parameters<typeof toActionRef>[0]; image?: { src: string; alt?: string; width?: number; height?: number } };
    newsBlock?: { eyebrow: string; title: string; action?: Parameters<typeof toActionRef>[0] };
    news?: Record<string, unknown>[];
}

const logos = (rows: { name: string; image?: { src: string; alt?: string; width?: number; height?: number }; href?: string }[], lang: Lang): LogoItem[] =>
    rows.map((l) => ({ name: l.name, image: toImageRef(l.image, { decorative: false }), ...(l.href ? { href: localizeHref(lang, l.href) } : {}) }));

function services(src: HomeApi['services'], lang: Lang): { items: ServiceSummary[]; head: { eyebrow: string; title: string; accent?: string; intro: string; ctaLabel?: string } | null } {
    const list = (Array.isArray(src) ? src : (src.items ?? [])) as Record<string, any>[];
    const items = list.map((s) => ({
        id: String(s.id),
        title: String(s.title),
        summary: String(s.summary ?? ''),
        image: toImageRef(s.image, { decorative: false }),
        href: s.href ? localizeHref(lang, String(s.href)) : undefined,
        ctaLabel: s.ctaLabel as string | undefined,
        highlight: s.highlight as ServiceSummary['highlight'],
    }));
    return { items, head: Array.isArray(src) ? null : src };
}

/** Home page API payload → props for the design-system sections. */
export function toHomeProps(api: HomeApi, lang: Lang) {
    const svc = services(api.services, lang);
    const articles: ArticleSummary[] = (api.news ?? []).map((n: any) => ({
        id: String(n.id),
        title: String(n.title),
        category: String(n.category ?? ''),
        date: String(n.date),
        readingMinutes: n.readingMinutes,
        image: toImageRef(n.image) as ImageRef,
        href: localizeHref(lang, String(n.href)),
        excerpt: n.excerpt,
    }));
    const steps: ProcessStep[] = api.process.steps.map((s, i) => ({ index: s.index ?? i + 1, title: s.title, body: s.body }));
    const heroImage = toImageRef(api.hero.image);
    const gapImages = (api.gap.images ?? []).map((i) => toImageRef(i, { decorative: true })).filter((i): i is ImageRef => Boolean(i));
    const [rowA = [], rowB = []] = api.clients?.rows ?? [];
    const credentialLogos: LogoItem[] = logos(api.credentials.logos ?? [], lang);

    return {
        hero: { title: api.hero.accent ? `${api.hero.title} ${api.hero.accent}` : api.hero.title, body: api.hero.body, actions: api.hero.actions.map((a) => toActionRef(a, lang)) as ActionRef[], image: heroImage },
        gap: { statement: api.gap.statement, eyebrow: api.gap.eyebrow, body: api.gap.body, images: gapImages },
        marquee: { rows: [logos(rowA, lang), logos(rowB, lang)].filter((r) => r.length > 0) },
        services: { head: svc.head, items: svc.items },
        reasons: {
            title: api.reasons.title,
            description: api.reasons.description,
            pillars: api.reasons.pillars,
            stats: api.reasons.stats,
            image: toImageRef(api.reasons.image),
            action: api.reasons.action ? toActionRef(api.reasons.action, lang) : undefined,
        },
        credentials: { title: api.credentials.title, description: api.credentials.description, logos: credentialLogos },
        process: { eyebrow: api.process.eyebrow, title: api.process.title, accent: api.process.accent, description: api.process.description, steps },
        quote: { title: api.partnerQuote.title, body: api.partnerQuote.body, action: api.partnerQuote.action ? toActionRef(api.partnerQuote.action, lang) : undefined, image: toImageRef(api.partnerQuote.image) },
        news: { head: api.newsBlock ?? null, articles },
    };
}
export type HomeProps = ReturnType<typeof toHomeProps>;
