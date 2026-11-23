import { markSanitizedHtml } from '@repo/design-system/lib';
import type { ArticleSummary, Author, ImageRef, SanitizedHtml, TocItem } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toPageHero, type HeroApi } from './hero';
import { localizeHref } from './href';
import { toImageRef, type ImageLike } from './image';

interface ArticleSummaryApi {
    id: string;
    slug: string;
    title: string;
    category: string;
    date: string;
    readingMinutes?: number;
    image: ImageLike;
    href: string;
    excerpt?: string;
    author?: { name: string; role?: string; bio?: string; avatar?: ImageLike };
    isCaseStory?: boolean;
}

export interface ArticlesPageApi {
    hero: HeroApi;
    featuredTitle: string;
    listEyebrow: string;
    listTitle: string;
    featured?: ArticleSummaryApi[];
    categories?: { id: string; slug: string; name: string; isCaseStory?: boolean }[];
    items?: ArticleSummaryApi[];
    pagination?: { page: number; pageSize: number; total: number; totalPages: number };
    seo?: unknown;
}

export interface ArticleDetailApi extends ArticleSummaryApi {
    body: string;
    toc?: TocItem[];
    tags?: string[];
    related?: ArticleSummaryApi[];
    isFallback?: boolean;
    redirectTo?: string;
    seo?: unknown;
}

export const articlePath = (slug: string) => `/articles/${slug}`;

export function toArticleSummary(a: ArticleSummaryApi, lang: Lang): ArticleSummary {
    return {
        id: a.id,
        title: a.title,
        category: a.category,
        date: a.date,
        readingMinutes: a.readingMinutes,
        image: toImageRef(a.image) as ImageRef,
        href: localizeHref(lang, a.href || articlePath(a.slug)),
        excerpt: a.excerpt,
    };
}

/** URL of the articles list with the active filters; page 1 carries no `page` param so the canonical list URL stays clean. */
export function listHref(lang: Lang, params: { category?: string; sector?: string; page?: number }): string {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.sector) q.set('sector', params.sector);
    if (params.page && params.page > 1) q.set('page', String(params.page));
    const qs = q.toString();
    return `/${lang}/articles${qs ? `?${qs}` : ''}`;
}

/** Positive integer from a query value, else 1. */
export const parsePage = (value: string | undefined) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : 1;
};

export function toArticlesProps(api: ArticlesPageApi, lang: Lang, filters: { category?: string; sector?: string; page: number }) {
    const featured = (api.featured ?? []).map((a) => toArticleSummary(a, lang));
    const isFiltered = Boolean(filters.category || filters.sector) || filters.page > 1;
    return {
        hero: toPageHero(api.hero, lang),
        // The featured block belongs to the unfiltered first page only.
        featured: isFiltered ? [] : featured,
        featuredTitle: api.featuredTitle,
        list: { eyebrow: api.listEyebrow, title: api.listTitle },
        categories: (api.categories ?? []).map((c) => ({ slug: c.slug, name: c.name, href: listHref(lang, { category: c.slug, sector: filters.sector }), active: c.slug === filters.category })),
        allHref: listHref(lang, { sector: filters.sector }),
        items: (api.items ?? []).map((a) => toArticleSummary(a, lang)),
        pageCount: api.pagination?.totalPages ?? 1,
        page: api.pagination?.page ?? filters.page,
        hrefForPage: (page: number) => listHref(lang, { category: filters.category, sector: filters.sector, page }),
    };
}

/** Give the body's h2/h3 the ids the API's table of contents points at (in order), so the anchors work. Existing ids are kept. */
export function withHeadingIds(html: string, toc: TocItem[] = []): string {
    let i = 0;
    return html.replace(/<h([23])((?:\s[^>]*)?)>/gi, (match, level: string, attrs: string) => {
        const item = toc[i++];
        if (!item || /\sid\s*=/.test(attrs)) return match;
        return `<h${level} id="${item.id}"${attrs}>`;
    });
}

export function toArticleDetailProps(api: ArticleDetailApi, lang: Lang) {
    const author: Author | undefined = api.author && { name: api.author.name, role: api.author.role, bio: api.author.bio, avatar: toImageRef(api.author.avatar, { decorative: true }) };
    return {
        summary: toArticleSummary(api, lang),
        title: api.title,
        category: api.category,
        date: api.date,
        readingMinutes: api.readingMinutes,
        isCaseStory: Boolean(api.isCaseStory),
        author,
        cover: toImageRef(api.image),
        toc: api.toc ?? [],
        bodyHtml: markSanitizedHtml(withHeadingIds(api.body, api.toc)) as SanitizedHtml,
        tags: api.tags ?? [],
        related: (api.related ?? []).map((r) => toArticleSummary(r, lang)),
        isFallback: Boolean(api.isFallback),
    };
}
