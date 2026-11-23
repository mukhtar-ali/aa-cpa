import type { ArticleSummary, ImageRef, SectorSummary } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toActionRef } from './actions';
import { toPageHero, type HeroApi } from './hero';
import { localizeHref } from './href';
import { toImageRef, type ImageLike } from './image';

export interface SectorsPageApi {
    hero: HeroApi;
    statement: string;
    indexTitle: string;
    indexDescription: string;
    items?: { id: string; slug: string; title: string; summary: string }[];
    caseStories?: { eyebrow: string; title: string; action?: Parameters<typeof toActionRef>[0]; items?: Record<string, any>[] };
}

/** A sector row links to that sector's articles and case stories (spec US1, research R2). */
export const sectorArticlesHref = (lang: Lang, slug: string) => localizeHref(lang, `/articles?sector=${encodeURIComponent(slug)}`);

export function toSectorsProps(api: SectorsPageApi, lang: Lang) {
    const sectors: SectorSummary[] = (api.items ?? []).map((s) => ({ id: s.id, title: s.title, summary: s.summary, href: sectorArticlesHref(lang, s.slug) }));
    const stories: ArticleSummary[] = (api.caseStories?.items ?? []).map((n) => ({
        id: String(n.id),
        title: String(n.title),
        category: String(n.category ?? ''),
        date: String(n.date),
        image: toImageRef(n.image as ImageLike) as ImageRef,
        href: localizeHref(lang, String(n.href)),
    }));
    return {
        hero: toPageHero(api.hero, lang),
        statement: api.statement,
        index: { title: api.indexTitle, description: api.indexDescription, sectors },
        caseStories: api.caseStories && { eyebrow: api.caseStories.eyebrow, title: api.caseStories.title, action: api.caseStories.action ? toActionRef(api.caseStories.action, lang) : undefined, items: stories },
    };
}
