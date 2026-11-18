import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { endpoint, type ListingPageWeb, type NewsModelWeb, type PageHeroModelWeb } from '@repo/shared';
import { getT } from '@/dictionaries/server';
import { Pagination } from '@/src/components/ui/Pagination';
import { buildPageMetadata, fetchPage, parsePageNumber } from '@/src/lib/server-data';

const PAGE_SIZE = 12;

type Props = {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ page?: string | string[] }>;
};

/** One API call: this page's SEO, its hero and one page of published articles. */
const loadPage = (lang: string, page: number) =>
    fetchPage<ListingPageWeb<PageHeroModelWeb, NewsModelWeb>>(
        endpoint.news.pageWeb,
        lang,
        `pageNumber=${page}&pageSize=${PAGE_SIZE}`,
    );

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const [{ lang }, { page }] = await Promise.all([params, searchParams]);
    const pageNumber = parsePageNumber(page);
    const [data, t] = await Promise.all([loadPage(lang, pageNumber), getT()]);
    return buildPageMetadata(data?.seo, parent, { page: pageNumber, pageLabel: t.pagination.page });
}

export default async function NewsPage({ params, searchParams }: Props) {
    const [{ lang }, { page }] = await Promise.all([params, searchParams]);
    const pageNumber = parsePageNumber(page);
    const [t, data] = await Promise.all([getT(), loadPage(lang, pageNumber)]);
    const hero = data?.hero;
    const items = data?.items.items ?? [];

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h1 className="page-title">{hero?.title || t.news.title}</h1>
            {hero?.subtitle && <p className="lead">{hero.subtitle}</p>}

            {items.length === 0 && <p className="empty mt-8">No articles published yet.</p>}

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((article) => (
                    <Link
                        key={article.slug}
                        href={`/${lang}/news/${article.slug}`}
                        className="card card-link p-5"
                    >
                        {article.thumbnail && (
                            <Image
                                src={article.thumbnail}
                                alt={article.title || article.slug || ''}
                                width={400}
                                height={225}
                                className="mb-3 aspect-video w-full rounded-md object-cover"
                            />
                        )}
                        <span className="text-xs font-semibold text-brand">{article.tag}</span>
                        <h2 className="mt-1 font-semibold group-hover:underline">{article.title}</h2>
                        {article.excerpt && <p className="mt-2 text-sm text-muted">{article.excerpt}</p>}
                    </Link>
                ))}
            </div>

            <Pagination basePath={`/${lang}/news`} page={pageNumber} totalPages={data?.items.totalPages ?? 1} />
        </div>
    );
}
