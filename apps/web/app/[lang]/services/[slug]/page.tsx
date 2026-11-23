import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero } from '@repo/design-system/layout';
import { Button } from '@repo/design-system/primitives';
import { CtaCards, FaqAccordion, MethodologyList, SectionHeading, Statement } from '@repo/design-system/sections';
import { ApiError, apiGet } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { getLabels, isLang, locales } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { localizeHref } from '@/src/mappers/href';
import { toPageSeo } from '@/src/mappers/seo';
import { servicePath, toServiceDetailProps, type ServiceDetailApi } from '@/src/mappers/services';

type Props = { params: Promise<{ lang: string; slug: string }> };

const load = (slug: string, lang: 'ar' | 'en') => apiGet<ServiceDetailApi>(endpoint.services.getBySlug(slug), { lang, tags: [tags.service(slug), tags.services] });

export async function generateStaticParams() {
    const list = await Promise.all(
        locales.map((lang) =>
            apiGet<{ slug: string }[]>(endpoint.services.list, { lang, tags: [tags.services] }).then((items) => items.map((s) => ({ lang, slug: s.slug }))).catch(() => []),
        ),
    );
    return list.flat();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, slug } = await params;
    if (!isLang(lang)) return {};
    const page = await load(slug, lang).catch(() => null);
    if (!page || page.redirectTo) return {};
    return buildMetadata({ lang, path: servicePath(slug), seo: toPageSeo(page.seo), fallbackTitle: page.title, fallbackDescription: page.summary });
}

/** Service details (Figma 448:41873). A moved slug answers with a permanent redirect (FR-003). */
export default async function ServicePage({ params }: Props) {
    const { lang, slug } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);

    let api: ServiceDetailApi;
    try {
        api = await load(slug, lang);
    } catch (error) {
        if (error instanceof ApiError && error.isNotFound) notFound();
        throw error;
    }
    if (api.redirectTo) permanentRedirect(localizeHref(lang, servicePath(api.redirectTo)));

    const s = toServiceDetailProps(api, lang);
    const t = labels.services;
    return (
        <>
            {s.image && (
                <PageHero
                    title={s.title}
                    subtitle={s.subtitle}
                    image={s.image}
                    breadcrumbs={[
                        { label: labels.home.home, href: localizeHref(lang, '/') },
                        { label: labels.home.servicesTabs, href: localizeHref(lang, '/services') },
                    ]}
                    breadcrumbsLabel={labels.home.breadcrumbs}
                    action={{ label: t.requestQuote, href: s.contactHref }}
                />
            )}
            <section className="bg-bg-page py-section-lg">
                <Container className="flex flex-col gap-12">
                    {s.statement && <Statement>{s.statement}</Statement>}
                    {s.audience && <SectionHeading title={t.audience} description={s.audience} />}
                    {s.whyUs && <SectionHeading title={t.whyUs} description={s.whyUs} />}
                    {s.methodology.length > 0 && <MethodologyList title={t.methodology} rows={s.methodology} />}
                    {s.deliverables.length > 0 && (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-h2 font-bold text-text-heading">{t.deliverables}</h2>
                            <ul className="grid gap-4 md:grid-cols-2">
                                {s.deliverables.map((d) => (
                                    <li key={d.title} className="rounded-cta border border-solid border-border-subtle bg-bg-surface p-6">
                                        <h3 className="text-h5 font-bold text-text-heading">{d.title}</h3>
                                        {d.body && <p className="mt-2 text-body-sm text-text-body">{d.body}</p>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {s.sectors.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-h2 font-bold text-text-heading">{t.sectors}</h2>
                            <ul className="flex flex-wrap gap-3">
                                {s.sectors.map((sector) => (
                                    <li key={sector.id}>
                                        <Button href={sector.href} variant="secondary">{sector.title}</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Container>
            </section>
            <section className="bg-bg-surface-ice py-section-lg">
                <Container className="flex flex-col gap-12">
                    {s.faqs.length > 0 && <FaqAccordion id="faq" title={t.faqHeading} items={s.faqs} />}
                    <CtaCards
                        title={t.notSure}
                        cards={[
                            { icon: 'help', title: t.faqTitle, body: t.faqBody, action: { label: t.faqCta, href: '#faq' } },
                            { icon: 'message', title: t.expertTitle, body: t.expertBody, action: { label: t.expertCta, href: s.contactHref }, tone: 'dark' },
                        ]}
                    />
                </Container>
            </section>
        </>
    );
}
