import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { endpoint, type ListingPageWeb, type PageHeroModelWeb, type ProjectModelWeb } from '@repo/shared';
import { getT } from '@/dictionaries/server';
import { Pagination } from '@/src/components/ui/Pagination';
import { buildPageMetadata, fetchPage, parsePageNumber } from '@/src/lib/server-data';

const PAGE_SIZE = 12;

type Props = {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ page?: string | string[] }>;
};

/** One API call: this page's SEO, its hero and one page of published projects. */
const loadPage = (lang: string, page: number) =>
    fetchPage<ListingPageWeb<PageHeroModelWeb, ProjectModelWeb>>(
        endpoint.project.pageWeb,
        lang,
        `pageNumber=${page}&pageSize=${PAGE_SIZE}`,
    );

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const [{ lang }, { page }] = await Promise.all([params, searchParams]);
    const pageNumber = parsePageNumber(page);
    const [data, t] = await Promise.all([loadPage(lang, pageNumber), getT()]);
    return buildPageMetadata(data?.seo, parent, { page: pageNumber, pageLabel: t.pagination.page });
}

export default async function ProjectsPage({ params, searchParams }: Props) {
    const [{ lang }, { page }] = await Promise.all([params, searchParams]);
    const pageNumber = parsePageNumber(page);
    const [t, data] = await Promise.all([getT(), loadPage(lang, pageNumber)]);
    const hero = data?.hero;
    const items = data?.items.items ?? [];

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h1 className="page-title">{hero?.title || t.header.menu.projects}</h1>
            {hero?.subtitle && <p className="lead">{hero.subtitle}</p>}

            {items.length === 0 && <p className="empty mt-8">No projects published yet.</p>}

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((project) => (
                    <Link key={project.slug} href={`/${lang}/${project.slug}`} className="card card-link p-5">
                        {project.thumbnail && (
                            <Image
                                src={project.thumbnail}
                                alt={project.title || project.slug || ''}
                                width={400}
                                height={225}
                                className="mb-3 aspect-video w-full rounded-md object-cover"
                            />
                        )}
                        <h2 className="font-semibold group-hover:underline">{project.title || project.slug}</h2>
                        {project.subtitle && <p className="mt-2 text-sm text-muted">{project.subtitle}</p>}
                    </Link>
                ))}
            </div>

            <Pagination basePath={`/${lang}/projects`} page={pageNumber} totalPages={data?.items.totalPages ?? 1} />
        </div>
    );
}
