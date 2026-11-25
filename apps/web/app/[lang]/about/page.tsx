import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero, Section } from '@repo/design-system/layout';
import { Button, Heading, Text } from '@repo/design-system/primitives';
import { LogoMarquee, OfficeCard, PhotoQuoteBand, SectionHeading, Statement } from '@repo/design-system/sections';
import { getPage, tryGetPage } from '@/src/lib/api/pages';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { EstimatorBlock } from '@/src/components/EstimatorBlock';
import { type WithEstimator } from '@/src/mappers/estimator';
import { toAboutProps, type AboutApi } from '@/src/mappers/about';
import { toPageSeo } from '@/src/mappers/seo';
import { localizeHref } from '@/src/mappers/href';
import { JsonLd } from '@/src/components/JsonLd';
import { buildBreadcrumbJsonLd, buildOrganizationJsonLd } from '@/src/lib/seo/json-ld';

type Props = { params: Promise<{ lang: string }> };

// Rendered per request: CI builds the web app without an API, so a build-time prerender would fail. The API calls themselves are
// cached and revalidated by tag (`apiGet`), so this does not hit the API on every visit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const page = await tryGetPage<AboutApi & { seo?: unknown }>(endpoint.pages.about, 'about', lang);
    return buildMetadata({ lang, path: '/about', seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? getLabels(lang).meta.about });
}

/** About (Figma 445:36452): hero, who we are, who signs your file, commitments, offices, partner quote. */
export default async function AboutPage({ params }: Props) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);
    const raw = await getPage<AboutApi & WithEstimator>(endpoint.pages.about, 'about', lang);
    const a = toAboutProps(raw, lang, labels.home.getDirections);

    const breadcrumbs = [
        { label: labels.home.home, href: localizeHref(lang, '/') },
        { label: a.hero.title, href: localizeHref(lang, '/about') },
    ];
    const breadcrumbJsonLd = buildBreadcrumbJsonLd({ items: breadcrumbs });
    const orgJsonLd = buildOrganizationJsonLd({
        lang,
        offices: (raw.offices ?? []).map((o) => ({
            city: o.city,
            address: o.address,
            isHeadquarters: o.isHeadquarters,
            coordinates: o.coordinates,
        })),
    });

    return (
        <>
            <JsonLd data={[orgJsonLd, breadcrumbJsonLd].filter(Boolean) as Record<string, unknown>[]} />
            {a.hero.image && <PageHero title={a.hero.title} subtitle={a.hero.subtitle} image={a.hero.image} breadcrumbs={a.hero.breadcrumbs} breadcrumbsLabel={labels.home.breadcrumbs} action={a.hero.action} />}
            <Section tone="page">
                <Container className="flex flex-col gap-12">
                    <Statement>{a.intro.statement}</Statement>
                    <div className="flex flex-col items-start gap-6 lg:ms-auto lg:max-w-188">
                        <Text size="lg">{a.intro.body}</Text>
                        {a.intro.action && <Button href={a.intro.action.href} variant={a.intro.action.variant ?? 'primary'}>{a.intro.action.label}</Button>}
                    </div>
                </Container>
                {a.marqueeRows.length > 0 && <LogoMarquee className="pt-12" label={labels.home.clients} rows={a.marqueeRows} pauseLabel={labels.home.pauseMarquee} />}
            </Section>
            {a.signatory && (
                <Section tone="ice">
                    <Container className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="flex flex-col items-start gap-6">
                            <SectionHeading eyebrow={a.signatory.eyebrow} title={a.signatory.title} accent={a.signatory.accent} />
                            {a.signatory.paragraphs.map((p) => (
                                <p key={p} className="text-body-lg text-text-body">{p}</p>
                            ))}
                            {a.signatory.action && <Button href={a.signatory.action.href} variant={a.signatory.action.variant ?? 'primary'}>{a.signatory.action.label}</Button>}
                        </div>
                        {a.signatory.image && (
                            <figure className="flex flex-col overflow-hidden rounded-cta bg-bg-inverse text-text-inverse">
                                <img src={a.signatory.image.src} alt={a.signatory.image.alt} width={a.signatory.image.width} height={a.signatory.image.height} className="h-auto w-full object-cover" />
                                {a.signatory.caption && <figcaption className="p-6 text-body-sm">{a.signatory.caption}</figcaption>}
                            </figure>
                        )}
                    </Container>
                </Section>
            )}
            <Section tone="page">
                <Container className="flex flex-col gap-10">
                    <SectionHeading title={a.commitments.title} description={a.commitments.subtitle} />
                    <ol className="flex flex-col">
                        {a.commitments.items.map((item, i) => (
                            <li key={item.title} className="flex items-start gap-6 border-b border-solid border-border-subtle py-6">
                                <span aria-hidden="true" className="text-h2 font-bold text-text-accent">{i + 1}</span>
                                <div className="flex flex-col gap-2">
                                    <Heading level={3} size="h5">{item.title}</Heading>
                                    <Text size="lg">{item.body}</Text>
                                </div>
                            </li>
                        ))}
                    </ol>
                </Container>
            </Section>
            {a.offices.items.length > 0 && (
                <Section tone="ice">
                    <Container className="flex flex-col gap-10">
                        {a.offices.title && <SectionHeading title={a.offices.title} />}
                        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {a.offices.items.map((office) => (
                                <li key={office.city}>
                                    <OfficeCard office={office} />
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>
            )}
            {a.quote?.image && <PhotoQuoteBand title={a.quote.title} body={a.quote.body} action={a.quote.action} image={a.quote.image} />}
            <EstimatorBlock lang={lang} estimator={raw.estimator} testimonial={raw.testimonial} />
        </>
    );
}
