import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, DesignSystemProvider, Footer, Header, UtilityBar, WhatsAppFloat } from '@repo/design-system/layout';
import { LanguageToggle, Logo } from '@repo/design-system/primitives';
import { CredentialsGrid, GapSection, HomeHero, LogoMarquee, NewsGrid, PhotoQuoteBand, ProcessSteps, ReasonsSection, SectionHeading, ServiceTabs } from '@repo/design-system/sections';
import { homeAr } from '@/src/reference/home.ar';
import { homeEn } from '@/src/reference/home.en';
import { ReferenceEstimator } from '@/src/reference/ReferenceEstimator';

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
            <div className="relative bg-bg-hero">
                <UtilityBar {...chrome.utility} localeSwitch={toggle} />
                <Header
                    className="absolute inset-x-0 top-11"
                    theme="hero"
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
            <GapSection {...c.gap} className="relative z-10 -mt-8 rounded-t-section" />
            <LogoMarquee label={c.marquee.label} rows={c.marquee.rows} pauseLabel={c.marquee.pauseLabel} />
            <ServiceTabs eyebrow={c.services.eyebrow} title={c.services.title} services={c.services.items} tabsLabel={c.labels.services} />
            <ReasonsSection {...c.reasons} locale={lang} />
            <CredentialsGrid {...c.credentials} showPlaceholders />
            <section className="bg-bg-page py-section-lg">
                <Container className="flex flex-col gap-12">
                    <SectionHeading eyebrow={c.process.eyebrow} title={c.process.title} description={c.process.description} />
                    <ProcessSteps steps={c.process.steps} locale={lang} />
                </Container>
            </section>
            <PhotoQuoteBand {...c.quote} />
            <section className="bg-bg-page py-section-lg">
                <Container className="flex flex-col gap-12">
                    <SectionHeading eyebrow={c.news.eyebrow} title={c.news.title} />
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
