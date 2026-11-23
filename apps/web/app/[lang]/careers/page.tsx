import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero } from '@repo/design-system/layout';
import { EmptyState, JobRow, PerkTile, SectionHeading, TimelineStepper } from '@repo/design-system/sections';
import { FilterLinks } from '@/src/components/FilterLinks';
import { apiGet } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { toCareersProps, type CareersPageApi } from '@/src/mappers/careers';
import { toPageSeo } from '@/src/mappers/seo';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ department?: string }> };

// Rendered per request (CI builds without an API); API fetches are cached and revalidated by tag.
export const dynamic = 'force-dynamic';

const load = (lang: 'ar' | 'en', department?: string) => apiGet<CareersPageApi>(endpoint.pages.careers, { lang, tags: [tags.page('careers'), tags.jobs], query: { department } });

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const { department } = await searchParams;
    const page = await load(lang).catch(() => null);
    const meta = buildMetadata({ lang, path: '/careers', seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? (lang === 'ar' ? 'الوظائف' : 'Careers') });
    return department ? { ...meta, robots: { index: false, follow: true } } : meta;
}

/** Careers (Figma 519:38941): hero, perks, team, open jobs with department filter links, hiring steps. */
export default async function CareersPage({ params, searchParams }: Props) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const { department } = await searchParams;
    const labels = getLabels(lang);
    const t = labels.careers;
    const c = toCareersProps(await load(lang, department || undefined), lang, department || undefined);

    return (
        <>
            {c.hero.image && <PageHero title={c.hero.title} subtitle={c.hero.subtitle} image={c.hero.image} breadcrumbs={c.hero.breadcrumbs} breadcrumbsLabel={labels.home.breadcrumbs} action={c.hero.action} />}
            {c.perks.items.length > 0 && (
                <section className="bg-bg-page py-section-lg">
                    <Container className="flex flex-col gap-10">
                        <SectionHeading eyebrow={c.perks.eyebrow} title={c.perks.title} />
                        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {c.perks.items.map((perk) => (
                                <li key={perk.title}>
                                    <PerkTile perk={perk} />
                                </li>
                            ))}
                        </ul>
                    </Container>
                </section>
            )}
            {c.team && (
                <section className="bg-bg-surface-ice py-section-lg">
                    <Container className="grid items-center gap-12 lg:grid-cols-2">
                        <SectionHeading eyebrow={c.team.eyebrow} title={c.team.title} accent={c.team.accent} description={c.team.body} />
                        {c.team.image && <img src={c.team.image.src} alt="" width={c.team.image.width} height={c.team.image.height} className="h-auto w-full rounded-card object-cover" />}
                    </Container>
                </section>
            )}
            <section id="jobs" className="bg-bg-page py-section-lg">
                <Container className="flex flex-col gap-10">
                    <SectionHeading eyebrow={c.jobs.eyebrow} title={c.jobs.title} />
                    {c.departments.length > 0 && <FilterLinks label={t.filterLabel} items={[{ label: t.allDepartments, href: c.allHref, active: !department }, ...c.departments]} />}
                    {c.jobs.items.length === 0 ? (
                        <EmptyState title={t.noJobs} body={t.noJobsBody} />
                    ) : (
                        <ul className="flex flex-col gap-4">
                            {c.jobs.items.map((job) => (
                                <li key={job.id}>
                                    <JobRow job={job} detailsLabel={t.viewDetails} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Container>
            </section>
            {c.hiring && c.hiring.steps.length > 0 && (
                <section className="bg-bg-surface-ice py-section-lg">
                    <Container className="flex flex-col gap-10">
                        <SectionHeading eyebrow={c.hiring.eyebrow} title={c.hiring.title} />
                        <TimelineStepper steps={c.hiring.steps} locale={lang} />
                    </Container>
                </section>
            )}
        </>
    );
}
