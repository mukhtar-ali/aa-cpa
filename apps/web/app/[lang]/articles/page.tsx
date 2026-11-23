import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero } from '@repo/design-system/layout';
import { Pagination } from '@repo/design-system/primitives';
import { EmptyState, FeaturedNews, NewsGrid, SectionHeading } from '@repo/design-system/sections';
import { apiGet } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { FilterLinks } from '@/src/components/FilterLinks';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { EstimatorBlock } from '@/src/components/EstimatorBlock';
import { type WithEstimator } from '@/src/mappers/estimator';
import { parsePage, toArticlesProps, type ArticlesPageApi } from '@/src/mappers/articles';
import { toPageSeo } from '@/src/mappers/seo';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ category?: string; sector?: string; page?: string }> };

// Rendered per request (CI builds without an API); API fetches are cached and revalidated by tag.
export const dynamic = 'force-dynamic';

const load = (lang: 'ar' | 'en', q: { category?: string; sector?: string; page: number }) =>
    apiGet<ArticlesPageApi & WithEstimator>(endpoint.pages.articles, { lang, tags: [tags.page('articles'), tags.articles], query: { category: q.category, sector: q.sector, page: q.page > 1 ? q.page : undefined } });

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const sp = await searchParams;
    const page = await load(lang, { page: 1 }).catch(() => null);
    const meta = buildMetadata({ lang, path: '/articles', seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? (lang === 'ar' ? 'المقالات' : 'Articles') });
    // Filtered and later pages are not separate pages to index; the canonical stays on the plain list.
    return sp.category || sp.sector || parsePage(sp.page) > 1 ? { ...meta, robots: { index: false, follow: true } } : meta;
}

/** Articles (Figma 473:36031): featured block, category filter links, list, pagination links, `?sector=` filter. */
export default async function ArticlesPage({ params, searchParams }: Props) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const sp = await searchParams;
    const labels = getLabels(lang);
    const t = labels.articles;
    const filters = { category: sp.category || undefined, sector: sp.sector || undefined, page: parsePage(sp.page) };
    const raw = await load(lang, filters);
    const a = toArticlesProps(raw, lang, filters);
    const [lead, ...rest] = a.featured;

    return (
        <>
            {a.hero.image && <PageHero title={a.hero.title} subtitle={a.hero.subtitle} image={a.hero.image} breadcrumbs={a.hero.breadcrumbs} breadcrumbsLabel={labels.home.breadcrumbs} action={a.hero.action} />}
            {lead && (
                <section className="bg-bg-page py-section-lg">
                    <Container className="flex flex-col gap-10">
                        <SectionHeading title={a.featuredTitle} />
                        <FeaturedNews featured={lead} latest={rest} latestTitle={t.featuredLatest} readMoreLabel={labels.home.readMore} locale={lang} />
                    </Container>
                </section>
            )}
            <section className="bg-bg-surface-ice py-section-lg">
                <Container className="flex flex-col gap-10">
                    <SectionHeading eyebrow={a.list.eyebrow} title={a.list.title} />
                    {a.categories.length > 0 && <FilterLinks label={t.filterLabel} items={[{ label: t.all, href: a.allHref, active: !filters.category }, ...a.categories.map((c) => ({ label: c.name, href: c.href, active: c.active }))]} />}
                    {a.items.length === 0 ? (
                        <EmptyState title={labels.states.emptyTitle} body={labels.states.emptyBody} />
                    ) : (
                        <NewsGrid articles={a.items} readMoreLabel={labels.home.readMore} locale={lang} />
                    )}
                    {a.pageCount > 1 && <Pagination page={a.page} pageCount={a.pageCount} hrefFor={a.hrefForPage} labels={{ nav: t.paginationLabel, previous: t.previous, next: t.next, page: (n) => `${t.pageN} ${n}` }} />}
                </Container>
            </section>
            <EstimatorBlock lang={lang} estimator={raw.estimator} testimonial={raw.testimonial} />
        </>
    );
}
