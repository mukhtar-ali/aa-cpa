import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { endpoint, type CareersPageSettingsModelWeb, type JobModelWeb, type ListingPageWeb } from '@repo/shared';
import { getT } from '@/dictionaries/server';
import { Pagination } from '@/src/components/ui/Pagination';
import { buildPageMetadata, fetchPage, parsePageNumber } from '@/src/lib/server-data';

const PAGE_SIZE = 12;

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    full_time: 'Full time',
    part_time: 'Part time',
    contract: 'Contract',
    internship: 'Internship',
};

type Props = {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ page?: string | string[] }>;
};

/** One API call: this page's SEO, its page settings (`hero`) and one page of open jobs. */
const loadPage = (lang: string, page: number) =>
    fetchPage<ListingPageWeb<CareersPageSettingsModelWeb, JobModelWeb>>(
        endpoint.careersPage.pageWeb,
        lang,
        `pageNumber=${page}&pageSize=${PAGE_SIZE}`,
    );

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const [{ lang }, { page }] = await Promise.all([params, searchParams]);
    const pageNumber = parsePageNumber(page);
    const [data, t] = await Promise.all([loadPage(lang, pageNumber), getT()]);
    return buildPageMetadata(data?.seo, parent, { page: pageNumber, pageLabel: t.pagination.page });
}

export default async function CareersPage({ params, searchParams }: Props) {
    const [{ lang }, { page }] = await Promise.all([params, searchParams]);
    const pageNumber = parsePageNumber(page);
    const [t, data] = await Promise.all([getT(), loadPage(lang, pageNumber)]);
    const settings = data?.hero;
    const items = data?.items.items ?? [];

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <h1 className="page-title">{settings?.heroTitle || t.header.menu.about}</h1>
            {settings?.heroDescription && <p className="lead">{settings.heroDescription}</p>}

            {settings?.whyTitle && (
                <section className="mt-16">
                    <h2 className="section-title">{settings.whyTitle}</h2>
                    {settings.whyDescription && <p className="mt-3 max-w-2xl text-muted">{settings.whyDescription}</p>}
                </section>
            )}

            <section className="mt-16">
                <h2 className="section-title">{t.applyNow}</h2>
                {items.length === 0 && <p className="empty mt-4">No open positions right now.</p>}
                <div className="mt-6 space-y-3">
                    {items.map((job) => (
                        <Link
                            key={job.slug}
                            href={`/${lang}/careers/${job.slug}`}
                            className="card card-link p-5"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold">{job.title}</h3>
                                <span className="text-xs text-muted">
                                    {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
                                </span>
                            </div>
                            {job.location && <p className="mt-1 text-sm text-muted">{job.location}</p>}
                            {job.description && <p className="mt-2 text-sm text-muted">{job.description}</p>}
                        </Link>
                    ))}
                </div>
                <Pagination basePath={`/${lang}/careers`} page={pageNumber} totalPages={data?.items.totalPages ?? 1} />
            </section>
        </div>
    );
}
