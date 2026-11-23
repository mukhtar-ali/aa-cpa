import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero } from '@repo/design-system/layout';
import { PhotoQuoteBand, ServiceCard, Statement } from '@repo/design-system/sections';
import { getPage, tryGetPage } from '@/src/lib/api/pages';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { toPageSeo } from '@/src/mappers/seo';
import { EstimatorBlock } from '@/src/components/EstimatorBlock';
import { type WithEstimator } from '@/src/mappers/estimator';
import { toServicesProps, type ServicesPageApi } from '@/src/mappers/services';

type Props = { params: Promise<{ lang: string }> };

// Rendered per request: CI builds the web app without an API, so a build-time prerender would fail. The API calls themselves are
// cached and revalidated by tag (`apiGet`), so this does not hit the API on every visit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const page = await tryGetPage<ServicesPageApi & { seo?: unknown }>(endpoint.pages.services, 'services', lang);
    return buildMetadata({ lang, path: '/services', seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? (lang === 'ar' ? 'خدماتنا' : 'Services') });
}

/** Services (Figma 448:41066): hero, statement, one card per service, partner quote. */
export default async function ServicesPage({ params }: Props) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);
    const raw = await getPage<ServicesPageApi & WithEstimator>(endpoint.pages.services, 'services', lang);
    const s = toServicesProps(raw, lang, labels.common.learnMore);

    return (
        <>
            {s.hero.image && <PageHero title={s.hero.title} subtitle={s.hero.subtitle} image={s.hero.image} breadcrumbs={s.hero.breadcrumbs} breadcrumbsLabel={labels.home.breadcrumbs} action={s.hero.action} />}
            <section className="bg-bg-surface-ice py-section-lg">
                <Container className="flex flex-col gap-12">
                    <Statement>{s.statement}</Statement>
                    <ul className="flex flex-col gap-8">
                        {s.services.map((service) => (
                            <li key={service.id}>
                                <ServiceCard service={service} />
                            </li>
                        ))}
                    </ul>
                </Container>
            </section>
            {s.quote?.image && <PhotoQuoteBand title={s.quote.title} body={s.quote.body} action={s.quote.action} image={s.quote.image} />}
            <EstimatorBlock lang={lang} estimator={raw.estimator} testimonial={raw.testimonial} />
        </>
    );
}
