import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, PageHero } from '@repo/design-system/layout';
import { ContactItem, FaqAccordion, OfficeCard, OfficeMap, SectionHeading } from '@repo/design-system/sections';
import { getPage, tryGetPage } from '@/src/lib/api/pages';
import { getChrome } from '@/src/lib/api/site';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { toChromeProps } from '@/src/mappers/chrome';
import { toContactProps, type ContactPageApi } from '@/src/mappers/contact';
import { toPageSeo } from '@/src/mappers/seo';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ service?: string }> };

// Rendered per request: CI builds the web app without an API, so a build-time prerender would fail. The API calls themselves are
// cached and revalidated by tag (`apiGet`), so this does not hit the API on every visit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const page = await tryGetPage<ContactPageApi>(endpoint.pages.contact, 'contact', lang);
    return buildMetadata({ lang, path: '/contact', seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? (lang === 'ar' ? 'تواصل معنا' : 'Contact us') });
}

/** Contact (Figma 524:3651): hero, channels, form slot (US2), offices with map, FAQ. */
export default async function ContactPage({ params }: Props) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);
    const [page, chrome] = await Promise.all([getPage<ContactPageApi>(endpoint.pages.contact, 'contact', lang), getChrome(lang)]);
    const c = toContactProps(page, lang, labels.home.getDirections, chrome ? toChromeProps(chrome, lang).footer.contacts : []);

    return (
        <>
            {c.hero.image && <PageHero title={c.hero.title} subtitle={c.hero.subtitle} image={c.hero.image} breadcrumbs={c.hero.breadcrumbs} breadcrumbsLabel={labels.home.breadcrumbs} action={c.hero.action} />}
            <section className="bg-bg-page py-section-lg" data-contact-location="contact-page">
                <Container className="grid gap-12 lg:grid-cols-2">
                    <div className="flex flex-col gap-8">
                        <SectionHeading eyebrow={c.intro.eyebrow} title={c.intro.title} description={c.intro.body} />
                        <ul className="flex flex-col gap-6">
                            {c.channels.map((channel) => (
                                <li key={`${channel.type}-${channel.value}`}>
                                    <ContactItem channel={channel} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* The enquiry form is mounted here by US2 (T031) with the `?service=` preselection. */}
                    <div id="contact-form" />
                </Container>
            </section>
            {c.offices.items.length > 0 && (
                <section className="bg-bg-surface-ice py-section-lg">
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
                </section>
            )}
            {c.faq && c.faq.items.length > 0 && (
                <section className="bg-bg-page py-section-lg">
                    <Container className="flex flex-col gap-10">
                        <SectionHeading eyebrow={c.faq.eyebrow} title={c.faq.title} />
                        <FaqAccordion items={c.faq.items} />
                    </Container>
                </section>
            )}
        </>
    );
}
