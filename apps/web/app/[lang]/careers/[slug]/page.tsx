import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { markSanitizedHtml } from '@repo/design-system/lib';
import { Container, Section } from '@repo/design-system/layout';
import { Breadcrumbs, Button, Heading, Text } from '@repo/design-system/primitives';
import { EmptyState, JobRow, PerkTile, SectionHeading } from '@repo/design-system/sections';
import { ApplyForm } from '@/src/components/ApplyForm';
import { ApiError, apiGet } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { getLabels, isLang, type Lang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { jobPath, toJobDetailProps, type JobDetailApi } from '@/src/mappers/careers';
import { localizeHref } from '@/src/mappers/href';
import { toPageSeo } from '@/src/mappers/seo';
import { JsonLd } from '@/src/components/JsonLd';
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd } from '@/src/lib/seo/json-ld';

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = 'force-dynamic';

const load = (slug: string, lang: Lang) => apiGet<JobDetailApi>(endpoint.jobs.getBySlug(slug), { lang, tags: [tags.job(slug), tags.jobs] });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, slug } = await params;
    if (!isLang(lang)) return {};
    const job = await load(slug, lang).catch(() => null);
    if (!job || job.redirectTo) return {};
    const meta = buildMetadata({ lang, path: jobPath(slug), seo: toPageSeo(job.seo), fallbackTitle: job.title, fallbackDescription: job.summary });
    return job.isOpen === false ? { ...meta, robots: { index: false, follow: true } } : meta;
}

/** Job details (Figma 514:3194): summary, lists, benefits, application form, similar jobs; a closed job shows the closed state instead of the form. */
export default async function JobPage({ params }: Props) {
    const { lang, slug } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);
    const t = labels.careers;

    let api: JobDetailApi;
    try {
        api = await load(slug, lang);
    } catch (error) {
        if (error instanceof ApiError && error.isNotFound) notFound();
        throw error;
    }
    if (api.redirectTo) permanentRedirect(localizeHref(lang, jobPath(api.redirectTo)));
    const j = toJobDetailProps(api, lang);
    const factLabel = t as unknown as Record<string, string>;

    const breadcrumbs = [
        { label: labels.home.home, href: localizeHref(lang, '/') },
        { label: t.backToJobs, href: localizeHref(lang, '/careers') },
        { label: j.title, href: localizeHref(lang, jobPath(slug)) },
    ];
    const breadcrumbJsonLd = buildBreadcrumbJsonLd({ items: breadcrumbs });
    const jobJsonLd = buildJobPostingJsonLd({
        lang,
        slug,
        title: api.title,
        summary: api.summary,
        bodyHtml: api.body,
        postedAt: api.postedAt,
        closesAt: api.closesAt,
        contract: api.contract,
        city: api.city,
    });

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, jobJsonLd].filter(Boolean) as Record<string, unknown>[]} />
            <Section tone="hero">
                <Container className="flex flex-col items-start gap-6 pt-24">
                    <Breadcrumbs
                        tone="dark"
                        label={labels.home.breadcrumbs}
                        items={[
                            { label: labels.home.home, href: localizeHref(lang, '/') },
                            { label: t.backToJobs, href: localizeHref(lang, '/careers') },
                        ]}
                    />
                    <Heading level={1} tone="inverse">{j.title}</Heading>
                    {j.lead && <Text tone="inverse">{j.lead}</Text>}
                    {j.isOpen && <Button href="#apply">{t.applyNow}</Button>}
                </Container>
            </Section>
            <Section tone="page">
                <Container className="flex flex-col gap-12">
                    <dl className="grid gap-4 rounded-card bg-bg-surface-ice p-6 sm:grid-cols-2 lg:grid-cols-4">
                        {j.facts.map(([key, value]) => (
                            <div key={key} className="flex flex-col gap-1">
                                <dt className="text-body-sm text-text-muted">{factLabel[key]}</dt>
                                <dd className="font-bold text-text-heading">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    {j.bodyHtml && <div className="ds-prose" dangerouslySetInnerHTML={{ __html: markSanitizedHtml(j.bodyHtml) }} />}
                    {j.responsibilities.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <Heading level={2} size="h3">{t.responsibilities}</Heading>
                            <ul className="ds-prose">{j.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
                        </div>
                    )}
                    {j.requirements.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <Heading level={2} size="h3">{t.requirements}</Heading>
                            <ul className="ds-prose">{j.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
                        </div>
                    )}
                    {j.benefits.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <Heading level={2} size="h3">{t.benefits}</Heading>
                            <ul className="grid gap-4 md:grid-cols-2">
                                {j.benefits.map((b) => (
                                    <li key={b.title}>
                                        <PerkTile perk={b} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Container>
            </Section>
            <Section tone="ice">
                <Container>
                    {j.isOpen ? (
                        <ApplyForm lang={lang} slug={slug} department={api.department} labels={t} formLabels={labels.contactForm} />
                    ) : (
                        <div className="flex flex-col items-start gap-6">
                            <EmptyState title={t.closedTitle} body={t.closedBody} />
                            <Button href={localizeHref(lang, '/careers')}>{t.backToJobs}</Button>
                        </div>
                    )}
                </Container>
            </Section>
            {j.similar.length > 0 && (
                <Section tone="page">
                    <Container className="flex flex-col gap-8">
                        <SectionHeading title={t.similar} />
                        <ul className="flex flex-col gap-4">
                            {j.similar.map((job) => (
                                <li key={job.id}>
                                    <JobRow job={job} detailsLabel={t.viewDetails} />
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>
            )}
        </>
    );
}
