import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, DesignSystemProvider, Footer, Header, UtilityBar, WhatsAppFloat } from '@repo/design-system/layout';
import { LanguageToggle, Logo } from '@repo/design-system/primitives';
import { CredentialsGrid, GapSection, HomeHero, LogoMarquee, NewsGrid, PhotoQuoteBand, ProcessSteps, ReasonsSection, SectionHeading, ServiceTabs } from '@repo/design-system/sections';
import { homeAr } from '@/src/reference/home.ar';
import { homeEn } from '@/src/reference/home.en';
import { ReferenceEstimator } from '@/src/reference/ReferenceEstimator';

// The gate reads an env var: never bake the answer in at build time.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Reference composition of the approved homepage (Figma 411:169) built only from design-system components with mock content. */
export default async function ReferenceHomePage({ params }: { params: Promise<{ lang: string }> }) {
    // Opt-in: the page does not exist in production unless ENABLE_REFERENCE_PAGES=true.
    if (process.env.ENABLE_REFERENCE_PAGES !== 'true') notFound();
    const { lang } = await params;
    if (lang !== 'ar' && lang !== 'en') notFound();
    const c = lang === 'ar' ? homeAr : homeEn;
    const { chrome } = c;
    const logo = (
        <a href={chrome.logo.href}>
            <Logo variant="on-dark" label={chrome.logo.label} />
        </a>
    );
    const toggle = <LanguageToggle href={chrome.localeSwitch.href} label={chrome.localeSwitch.label} targetLang={lang === 'ar' ? 'en' : 'ar'} />;

    return (
        <DesignSystemProvider locale={lang}>
            {/* Parity harness: heights below mirror the Figma frame (411:169) section heights at 1512 px. */}
            <div className="relative bg-bg-hero lg:min-h-[787px]">
                <UtilityBar {...chrome.utility} localeSwitch={toggle} />
                <Header
                    className="absolute inset-x-0 top-11"
                    theme="hero"
                    desktopLocaleSwitch={false}
                    logo={logo}
                    nav={chrome.nav}
                    cta={chrome.cta}
                    localeSwitch={toggle}
                    menuLabel={c.labels.menu}
                    closeLabel={c.labels.closeMenu}
                    navLabel={c.labels.mainNav}
                />
                <HomeHero {...c.hero} />
            </div>
            <GapSection {...c.gap} className="relative z-10 -mt-8 rounded-t-section lg:min-h-[795px]" />
            <LogoMarquee className="py-9" label={c.marquee.label} rows={c.marquee.rows} pauseLabel={c.marquee.pauseLabel} />
            <ServiceTabs className="lg:min-h-[1033px]" eyebrow={c.services.eyebrow} title={c.services.title} headline={c.services.headline} headlineAccent={c.services.headlineAccent} services={c.services.items} tabsLabel={c.labels.services} />
            <ReasonsSection {...c.reasons} locale={lang} className="pb-0 lg:min-h-[983px]" />
            <CredentialsGrid {...c.credentials} showPlaceholders className="lg:min-h-[339px]" />
            <section className="bg-bg-page py-section-lg lg:min-h-[676px]">
                <Container className="flex flex-col gap-12">
                    <SectionHeading eyebrow={c.process.eyebrow} title={c.process.title} accent={c.process.accent} description={c.process.description} split />
                    <ProcessSteps steps={c.process.steps} locale={lang} />
                </Container>
            </section>
            <PhotoQuoteBand {...c.quote} />
            <section className="bg-bg-surface-ice py-section-lg lg:pt-15">
                <Container className="flex flex-col gap-12">
                    <SectionHeading eyebrow={c.news.eyebrow} title={c.news.title} split action={{ label: c.news.allLabel, href: '#' }} />
                    <NewsGrid articles={c.news.articles} readMoreLabel={c.news.readMore} locale={lang} />
                </Container>
            </section>
            <ReferenceEstimator content={c.estimator} locale={lang} />
            <Footer
                {...chrome.footer}
                logo={
                    <a href={chrome.logo.href}>
                        <Logo variant="on-dark" label={chrome.logo.label} />
                    </a>
                }
                socialsLabel={c.labels.socials}
            />
            <WhatsAppFloat href={c.whatsapp.href} label={c.whatsapp.label} />
        </DesignSystemProvider>
    );
}
