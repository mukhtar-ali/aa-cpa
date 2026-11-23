import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container } from '@repo/design-system/layout';
import { CredentialsGrid, EmptyState, GapSection, HomeHero, LogoMarquee, NewsGrid, PhotoQuoteBand, ProcessSteps, ReasonsSection, SectionHeading, ServiceTabs } from '@repo/design-system/sections';
import { apiGet, ApiError } from '@/src/lib/api/client';
import { tags } from '@/src/lib/api/endpoints';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { toHomeProps, type HomeApi } from '@/src/mappers/home';
import { localizeHref } from '@/src/mappers/href';
import { toPageSeo } from '@/src/mappers/seo';
import { buildMetadata } from '@/src/lib/seo/page-metadata';

type Props = { params: Promise<{ lang: string }> };

const load = (lang: 'ar' | 'en') => apiGet<HomeApi & { seo?: unknown }>(endpoint.pages.home, { lang, tags: [tags.page('home')] });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const page = await load(lang).catch(() => null);
    return buildMetadata({ lang, path: '', seo: toPageSeo(page?.seo), fallbackTitle: lang === 'ar' ? 'عبدالرحمن الشبيبشيري للاستشارات المهنية' : 'Abdulrahman Al-Shabibshiri Professional Consulting' });
}

/** Home (Figma 411:169). Sections are the design-system ones; this page only maps CMS content onto them. */
export default async function HomePage({ params }: Props) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const labels = getLabels(lang);

    let api: HomeApi & { seo?: unknown };
    try {
        api = await load(lang);
    } catch (error) {
        if (error instanceof ApiError && error.isNotFound) notFound();
        throw error;
    }
    const h = toHomeProps(api, lang);
    if (!h.hero.image) return <EmptyState title={labels.states.emptyTitle} body={labels.states.emptyBody} />;

    return (
        <>
            <div className="relative bg-bg-hero">
                <HomeHero title={h.hero.title} body={h.hero.body} actions={h.hero.actions} image={h.hero.image} />
            </div>
            <GapSection {...h.gap} images={h.gap.images as never} className="relative z-10 -mt-8 rounded-t-section" />
            {h.marquee.rows.length > 0 && <LogoMarquee className="py-9" label={labels.home.clients} rows={h.marquee.rows} pauseLabel={labels.home.pauseMarquee} />}
            {h.services.items.length > 0 && (
                <ServiceTabs
                    eyebrow={h.services.head?.eyebrow}
                    title={h.services.head?.title ?? ''}
                    headline={h.services.head?.intro}
                    headlineAccent={h.services.head?.accent}
                    services={h.services.items}
                    tabsLabel={labels.home.servicesTabs}
                />
            )}
            {h.reasons.image && <ReasonsSection {...h.reasons} image={h.reasons.image} locale={lang} className="pb-0" />}
            {h.credentials.logos.length > 0 && <CredentialsGrid {...h.credentials} />}
            <section className="bg-bg-page py-section-lg">
                <Container className="flex flex-col gap-12">
                    <SectionHeading eyebrow={h.process.eyebrow} title={h.process.title} accent={h.process.accent} description={h.process.description} split />
                    <ProcessSteps steps={h.process.steps} locale={lang} />
                </Container>
            </section>
            {h.quote.image && <PhotoQuoteBand {...h.quote} image={h.quote.image} />}
            {h.news.articles.length > 0 && (
                <section className="bg-bg-surface-ice py-section-lg lg:pt-15">
                    <Container className="flex flex-col gap-12">
                        <SectionHeading eyebrow={h.news.head?.eyebrow} title={h.news.head?.title ?? ''} split action={{ label: h.news.head?.action?.label ?? labels.common.viewAll, href: localizeHref(lang, h.news.head?.action?.href ?? '/articles') }} />
                        <NewsGrid articles={h.news.articles} readMoreLabel={labels.home.readMore} locale={lang} />
                    </Container>
                </section>
            )}
        </>
    );
}
