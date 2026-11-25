import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero, Section } from '@repo/design-system/layout';
import { ContactItem, FaqAccordion, OfficeCard, OfficeMap, SectionHeading } from '@repo/design-system/sections';
import { getPage, tryGetPage } from '@/src/lib/api/pages';
import { getChrome } from '@/src/lib/api/site';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { ContactForm } from '@/src/components/ContactForm';
import { toChromeProps } from '@/src/mappers/chrome';
import { toContactProps, type ContactPageApi } from '@/src/mappers/contact';
import { toPageSeo } from '@/src/mappers/seo';
import { localizeHref } from '@/src/mappers/href';
import { JsonLd } from '@/src/components/JsonLd';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildOrganizationJsonLd } from '@/src/lib/seo/json-ld';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ service?: string }> };

// Rendered per request: CI builds the web app without an API, so a build-time prerender would fail. The API calls themselves are
// cached and revalidated by tag (`apiGet`), so this does not hit the API on every visit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const page = await tryGetPage<ContactPageApi>(endpoint.pages.contact, 'contact', lang);
    return buildMetadata({ lang, path: '/contact', seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? getLabels(lang).meta.contact });
}

/** Contact (Figma 524:3651): hero, channels, enquiry form, offices with map, FAQ. */
export default async function ContactPage({ params, searchParams }: Props) {
    const { lang } = await params;
    const { service } = await searchParams;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);
    const [page, chrome] = await Promise.all([getPage<ContactPageApi>(endpoint.pages.contact, 'contact', lang), getChrome(lang)]);
    const c = toContactProps(page, lang, labels.home.getDirections, chrome ? toChromeProps(chrome, lang).footer.contacts : []);

    const breadcrumbs = [
        { label: labels.home.home, href: localizeHref(lang, '/') },
        { label: c.hero.title, href: localizeHref(lang, '/contact') },
    ];
    const breadcrumbJsonLd = buildBreadcrumbJsonLd({ items: breadcrumbs });
    const phoneChannel = chrome?.footer?.contacts?.find((ct) => ct.type === 'phone');
    const hoursChannel = chrome?.footer?.contacts?.find((ct) => ct.type === 'hours');
    const orgJsonLd = buildOrganizationJsonLd({
        lang,
        telephone: phoneChannel?.value,
        openingHoursSpecification: hoursChannel?.value,
        sameAs: chrome?.footer?.socials?.map((s) => s.href),
        offices: c.offices.items.map((o) => ({
            city: o.city,
            address: o.address,
            telephone: phoneChannel?.value,
            openingHoursSpecification: hoursChannel?.value,
            isHeadquarters: o.isHeadquarters,
            coordinates: o.coordinates,
        })),
    });
    const faqJsonLd = page.faq?.items && page.faq.items.length > 0 ? buildFaqJsonLd({ lang, items: page.faq.items }) : null;

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, orgJsonLd, faqJsonLd].filter(Boolean) as Record<string, unknown>[]} />
            {c.hero.image && <PageHero title={c.hero.title} subtitle={c.hero.subtitle} image={c.hero.image} breadcrumbs={c.hero.breadcrumbs} breadcrumbsLabel={labels.home.breadcrumbs} action={c.hero.action} />}
            <Section tone="page" data-contact-location="contact">
                <Container className="grid gap-12 lg:grid-cols-2">
                    <div className="flex flex-col gap-8 lg:order-2">
                        <SectionHeading eyebrow={c.intro.eyebrow} title={c.intro.title} description={c.intro.body} />
                        <ul className="flex flex-col gap-6">
                            {c.channels.map((channel) => (
                                <li key={`${channel.type}-${channel.value}`}>
                                    <ContactItem channel={channel} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <ContactForm
                        lang={lang}
                        labels={labels.contactForm}
                        title={c.form.title}
                        description={c.form.subtitle}
                        services={c.serviceOptions.map((o) => ({ value: o.id, label: o.title }))}
                        defaultService={c.serviceOptions.find((o) => o.slug === service)?.id}
                        successMessage={`${c.form.successTitle}. ${c.form.successBody}`}
                    />
                </Container>
            </Section>
            {c.offices.items.length > 0 && (
                <Section tone="ice">
                    <Container className="flex flex-col gap-10">
                        <SectionHeading eyebrow={c.offices.eyebrow || undefined} title={c.offices.title} />
                        {c.offices.mapImage && <OfficeMap offices={c.offices.items} map={c.offices.mapImage} label={c.offices.title} />}
                        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {c.offices.items.map((office) => (
                                <li key={office.city}>
                                    <OfficeCard office={office} />
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>
            )}
            {c.faq && c.faq.items.length > 0 && (
                <Section tone="page">
                    <Container className="flex flex-col gap-10">
                        <SectionHeading eyebrow={c.faq.eyebrow} title={c.faq.title} />
                        <FaqAccordion items={c.faq.items} />
                    </Container>
                </Section>
            )}
        </>
    );
}
