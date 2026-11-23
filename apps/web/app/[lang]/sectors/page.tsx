import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero } from '@repo/design-system/layout';
import { NewsGrid, SectionHeading, SectorIndex, Statement } from '@repo/design-system/sections';
import { getPage, tryGetPage } from '@/src/lib/api/pages';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { toPageSeo } from '@/src/mappers/seo';
import { EstimatorBlock } from '@/src/components/EstimatorBlock';
import { type WithEstimator } from '@/src/mappers/estimator';
import { toSectorsProps, type SectorsPageApi } from '@/src/mappers/sectors';

type Props = { params: Promise<{ lang: string }> };

// Rendered per request: CI builds the web app without an API, so a build-time prerender would fail. The API calls themselves are
// cached and revalidated by tag (`apiGet`), so this does not hit the API on every visit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const page = await tryGetPage<SectorsPageApi & { seo?: unknown }>(endpoint.pages.sectors, 'sectors', lang);
    return buildMetadata({ lang, path: '/sectors', seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? (lang === 'ar' ? 'القطاعات' : 'Sectors') });
}

/** Sectors (Figma 547:4555): hero, statement, sector index linking to each sector's articles, case stories. */
export default async function SectorsPage({ params }: Props) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);
    const raw = await getPage<SectorsPageApi & WithEstimator>(endpoint.pages.sectors, 'sectors', lang);
    const s = toSectorsProps(raw, lang);

    return (
        <>
            {s.hero.image && <PageHero title={s.hero.title} subtitle={s.hero.subtitle} image={s.hero.image} breadcrumbs={s.hero.breadcrumbs} breadcrumbsLabel={labels.home.breadcrumbs} action={s.hero.action} />}
            <section className="bg-bg-page py-section-lg">
                <Container className="flex flex-col gap-12">
                    <Statement>{s.statement}</Statement>
                    <SectionHeading title={s.index.title} description={s.index.description} />
                    <SectorIndex sectors={s.index.sectors} label={labels.pages.sectorsLabel} />
                </Container>
            </section>
            {s.caseStories && s.caseStories.items.length > 0 && (
                <section className="bg-bg-surface-ice py-section-lg">
                    <Container className="flex flex-col gap-12">
                        <SectionHeading eyebrow={s.caseStories.eyebrow} title={s.caseStories.title} split action={s.caseStories.action} />
                        <NewsGrid articles={s.caseStories.items} readMoreLabel={labels.home.readMore} locale={lang} />
                    </Container>
                </section>
            )}
            <EstimatorBlock lang={lang} estimator={raw.estimator} testimonial={raw.testimonial} />
        </>
    );
}
