import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, Section } from '@repo/design-system/layout';
import { ArticleBody, ArticleHeader, AuthorCard, RelatedCarousel, ShareBox, TableOfContents } from '@repo/design-system/sections';
import { ApiError, apiGet } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { ShareTracker } from '@/src/components/ShareTracker';
import { getLabels, isLang, type Lang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata, siteUrl } from '@/src/lib/seo/page-metadata';
import { articlePath, toArticleDetailProps, type ArticleDetailApi } from '@/src/mappers/articles';
import { localizeHref } from '@/src/mappers/href';
import { toPageSeo } from '@/src/mappers/seo';

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = 'force-dynamic';

const load = (slug: string, lang: Lang) => apiGet<ArticleDetailApi>(`${endpoint.news.getBySlugWeb}/${slug}`, { lang, tags: [tags.article(slug), tags.articles] });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, slug } = await params;
    if (!isLang(lang)) return {};
    const page = await load(slug, lang).catch(() => null);
    if (!page || page.redirectTo) return {};
    return buildMetadata({ lang, path: articlePath(slug), seo: toPageSeo(page.seo), fallbackTitle: page.title, fallbackDescription: page.excerpt });
}

/** Article and case story (Figma 506:2706): header, body with contents, author, share, related. */
export default async function ArticlePage({ params }: Props) {
    const { lang, slug } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);
    const t = labels.articles;

    let api: ArticleDetailApi;
    try {
        api = await load(slug, lang);
    } catch (error) {
        if (error instanceof ApiError && error.isNotFound) notFound();
        throw error;
    }
    if (api.redirectTo) permanentRedirect(localizeHref(lang, articlePath(api.redirectTo)));

    const a = toArticleDetailProps(api, lang);
    const date = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(a.date));
    const meta = a.readingMinutes ? `${date} · ${a.readingMinutes} ${t.minRead}` : date;
    const url = `${siteUrl()}/${lang}${articlePath(slug)}`;
    const shareLabels = { copyLink: t.copyLink, whatsapp: t.whatsapp, linkedin: t.linkedin, x: t.x, copy: t.copy, copied: t.copied, copyFailed: t.copyFailed };
    const networks = { [t.copyLink]: 'copy', [t.copy]: 'copy', [t.whatsapp]: 'whatsapp', [t.linkedin]: 'linkedin', [t.x]: 'x' } as const;
    const share = (
        <ShareTracker networks={{ ...networks }}>
            <ShareBox variant="bar" url={url} title={t.shareTitle} shareText={a.title} labels={shareLabels} />
        </ShareTracker>
    );

    return (
        <>
            <ArticleHeader
                breadcrumbs={[
                    { label: labels.home.home, href: localizeHref(lang, '/') },
                    { label: t.articles, href: localizeHref(lang, '/articles') },
                ]}
                breadcrumbsLabel={labels.home.breadcrumbs}
                category={a.category}
                title={a.title}
                author={a.author ?? { name: '' }}
                meta={meta}
                dateISO={a.date}
                cover={a.cover}
            />
            <Section tone="page">
                <Container className="grid gap-12 lg:grid-cols-[1fr_22rem]">
                    {/* Arabic-only fallback on an English page is marked so screen readers and the layout switch direction (FR-013). */}
                    <div lang={a.isFallback && lang === 'en' ? 'ar' : undefined} dir={a.isFallback && lang === 'en' ? 'rtl' : undefined} className="flex flex-col gap-10">
                        {a.isFallback && lang === 'en' && <p className="rounded-cta bg-bg-surface-ice p-4 text-body-sm" lang="en" dir="ltr">{labels.common.translationFallback}</p>}
                        <ArticleBody tags={a.tags} tagsLabel={t.tags}>
                            <div dangerouslySetInnerHTML={{ __html: a.bodyHtml }} />
                        </ArticleBody>
                        {share}
                        {a.author && <AuthorCard author={a.author} />}
                    </div>
                    {a.toc.length > 0 && (
                        <aside className="lg:sticky lg:top-8 lg:self-start">
                            <TableOfContents title={t.toc} label={t.toc} locale={lang} items={a.toc} />
                        </aside>
                    )}
                </Container>
            </Section>
            {a.related.length > 0 && (
                <Section tone="ice">
                    <Container>
                        <RelatedCarousel title={t.relatedTitle} articles={a.related} readMoreLabel={labels.home.readMore} prevLabel={t.prev} nextLabel={t.nextSlide} progressLabel={t.relatedProgress} locale={lang} />
                    </Container>
                </Section>
            )}
        </>
    );
}
