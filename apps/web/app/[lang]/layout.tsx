import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import localFont from 'next/font/local';
import Script from 'next/script';
import { endpoint, GA_ID_REGEX, GTM_ID_REGEX, type GlobalSeoSettingsModelWeb } from '@repo/shared';
import { DesignSystemProvider, Footer, Header, UtilityBar } from '@repo/design-system/layout';
import { Logo } from '@repo/design-system/primitives';
import { SkipLink } from '@repo/design-system/sections';
import { ChromeSwitch } from '@/src/reference/ChromeSwitch';
import { ConsentGate } from '@/src/components/chrome/ConsentGate';
import { MonitoringReporter } from '@/src/monitoring/MonitoringReporter';
import { ContactClickTracker } from '@/src/components/chrome/ContactClickTracker';
import { LocaleToggleLink } from '@/src/components/chrome/LocaleToggleLink';
import { PreviewBannerGate } from '@/src/components/chrome/PreviewBannerGate';
import { RouteFocus } from '@/src/components/chrome/RouteFocus';
import { WhatsAppFloatGate } from '@/src/components/chrome/WhatsAppFloatGate';
import { defaultLocale, dirOf, getLabels, isLang, locales } from '@/src/lib/i18n/dictionaries';
import { defaultDescription } from '@/src/lib/seo/page-metadata';
import { getChrome } from '@/src/lib/api/site';
import { toChromeProps } from '@/src/mappers/chrome';
import '@/src/assets/styles/tailwind.css';

// Self-hosted Almarai (design-system fonts): latin and arabic files, chained per glyph in tailwind.css.
const almaraiLatin = localFont({
    src: [
        { path: '../../../../packages/design-system/assets/fonts/almarai-latin-300.woff2', weight: '300', style: 'normal' },
        { path: '../../../../packages/design-system/assets/fonts/almarai-latin-400.woff2', weight: '400', style: 'normal' },
        { path: '../../../../packages/design-system/assets/fonts/almarai-latin-700.woff2', weight: '700', style: 'normal' },
        { path: '../../../../packages/design-system/assets/fonts/almarai-latin-800.woff2', weight: '800', style: 'normal' },
    ],
    variable: '--font-almarai-latin',
    display: 'swap',
});
const almaraiArabic = localFont({
    src: [
        { path: '../../../../packages/design-system/assets/fonts/almarai-arabic-300.woff2', weight: '300', style: 'normal' },
        { path: '../../../../packages/design-system/assets/fonts/almarai-arabic-400.woff2', weight: '400', style: 'normal' },
        { path: '../../../../packages/design-system/assets/fonts/almarai-arabic-700.woff2', weight: '700', style: 'normal' },
        { path: '../../../../packages/design-system/assets/fonts/almarai-arabic-800.woff2', weight: '800', style: 'normal' },
    ],
    variable: '--font-almarai-arabic',
    display: 'swap',
});
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

async function getGlobalSeo(lang: string): Promise<GlobalSeoSettingsModelWeb | null> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint.common.seoGlobalWeb}?lang=${lang}`, {
            headers: { 'Accept-Language': lang },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return (await res.json()) as GlobalSeoSettingsModelWeb;
    } catch {
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const seo = await getGlobalSeo(lang);
    // Pages that never reach a page-level generateMetadata (the 404) fall back to the firm name, not a template string.
    const fallbackLang = isLang(lang) ? lang : defaultLocale;

    return {
        title: seo?.metaTitleTemplate || getLabels(fallbackLang).meta.home,
        description: seo?.metaDescription || defaultDescription(fallbackLang, ''),
        keywords: seo?.keywords || undefined,
        robots: seo?.robotsDirective || 'index, follow',
        // Favicon set lives in public/images/favicon (generated with realfavicongenerator).
        icons: {
            // icon.svg recolours itself (black on light themes, white on dark ones) with an embedded
            // prefers-color-scheme rule. `media` on <link rel=icon> is not honoured by every browser (Firefox
            // ignores it), so the PNG/ICO fallbacks below are plain black for browsers without SVG favicons.
            icon: [
                { url: '/images/favicon/icon.svg', type: 'image/svg+xml', sizes: 'any' },
                { url: '/images/favicon/favicon.ico', sizes: '48x48' },
                { url: '/images/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
                { url: '/images/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            ],
            apple: [{ url: '/images/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
            // allow-raw: browser pinned-tab colour in the icon manifest, not a style
        other: [{ rel: 'mask-icon', url: '/images/favicon/safari-pinned-tab.svg', color: '#000000' }],
        },
        manifest: '/images/favicon/site.webmanifest',
        other: { 'msapplication-config': '/images/favicon/browserconfig.xml' },
        alternates: seo?.canonicalBase ? { canonical: `${seo.canonicalBase}/${lang}` } : undefined,
        openGraph: seo?.ogImage ? { images: [String(seo.ogImage)] } : undefined,
    };
}

export function generateStaticParams() {
    return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    // Per-request CSP nonce set by proxy.ts. Reading headers() also makes every route render per request, which the nonce needs.
    const nonce = (await headers()).get('x-nonce') ?? undefined;

    const dir = dirOf(lang);
    const labels = getLabels(lang);
    const other = lang === 'ar' ? 'en' : 'ar';
    const [seo, rawChrome] = await Promise.all([getGlobalSeo(lang), getChrome(lang)]);
    const chrome = rawChrome ? toChromeProps(rawChrome, lang) : null;
    // These IDs are embedded in inline <script> code. They come from an admin-editable CMS field, so
    // re-validate them here (values stored before the API enforced the format may still be bad) and
    // only ever emit them as JSON string literals / encoded URL components. Invalid IDs are skipped.
    // Environments that serve the design-system reference pages (staging, local) are not production traffic: no analytics hits from them.
    const analyticsEnabled = process.env.ENABLE_REFERENCE_PAGES !== 'true';

    const validGtm = (id?: string) => (id && GTM_ID_REGEX.test(id) ? id : undefined);
    const validGa = (id?: string) => (id && GA_ID_REGEX.test(id) ? id : undefined);
    const gtmId = analyticsEnabled ? (validGtm(seo?.googleTagManagerId) ?? validGtm(seo?.gtmId)) : undefined;
    const gaMeasurementId = analyticsEnabled ? (validGa(seo?.googleAnalyticsId) ?? validGa(seo?.gaMeasurementId)) : undefined;
    // Digits only: the id is placed inside inline script code by FBPixel.
    const metaPixelId = analyticsEnabled && seo?.metaPixelId && /^\d{5,20}$/.test(seo.metaPixelId) ? seo.metaPixelId : undefined;
    const consentVersion = seo?.consentVersion || '1.0';
    const consentTexts = seo?.consentTexts;

    const toggle = chrome?.localeSwitch ? (
        <LocaleToggleLink target={other} label={chrome.localeSwitch.label} accessibleLabel={labels.a11y.switchLanguage} />
    ) : undefined;
    const headerLogo = chrome ? (
        <a href={chrome.logo.href}>
            <Logo variant="on-dark" label={chrome.logo.label} />
        </a>
    ) : null;

    const header =
        chrome && headerLogo ? (
            <div data-contact-location="header" className="bg-bg-hero">
                <UtilityBar {...chrome.utility} localeSwitch={toggle} />
                <Header
                    theme="hero"
                    desktopLocaleSwitch={false}
                    logo={headerLogo}
                    nav={chrome.nav}
                    cta={chrome.cta}
                    localeSwitch={toggle}
                    menuLabel={labels.a11y.openMenu}
                    closeLabel={labels.a11y.closeMenu}
                    navLabel={labels.a11y.mainNavigation}
                />
            </div>
        ) : null;

    const cookieSettingsLabel = labels.consent?.cookieSettings ?? 'Cookie settings';
    const legalLinks = chrome ? [...chrome.footer.legal.links] : [];
    if (chrome && !legalLinks.some((l) => l.href === '#cookie-settings')) {
        legalLinks.push({ href: '#cookie-settings', label: cookieSettingsLabel });
    }

    const footer = chrome ? (
        <div data-contact-location="footer">
            <Footer
                logo={
                    <a href={chrome.logo.href}>
                        <Logo variant="on-dark" label={chrome.logo.label} />
                    </a>
                }
                description={chrome.footer.description}
                socials={chrome.footer.socials}
                columns={chrome.footer.columns}
                contacts={chrome.footer.contacts}
                legal={{ ...chrome.footer.legal, links: legalLinks }}
                backToTopLabel={chrome.footer.backToTopLabel ?? labels.common.backToTop}
                wordmark={chrome.footer.wordmark ?? chrome.logo.label}
                socialsLabel={chrome.logo.label}
            />
        </div>
    ) : null;

    return (
        <html lang={lang} dir={dir} className={`${almaraiLatin.variable} ${almaraiArabic.variable}`}>
            <head>
                {/* Inline Google Consent Mode v2 defaults: all denied before any GTM/tracking executes */}
                <Script id="consent-mode-default" strategy="beforeInteractive" nonce={nonce}>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('consent', 'default', {
                            'ad_storage': 'denied',
                            'ad_user_data': 'denied',
                            'ad_personalization': 'denied',
                            'analytics_storage': 'denied',
                            'wait_for_update': 500
                        });
                    `}
                </Script>
            </head>
            <body>
                <MonitoringReporter />
                <ContactClickTracker />
                <RouteFocus />
                <DesignSystemProvider locale={lang}>
                    <SkipLink label={labels.a11y.skipToContent} />
                    <PreviewBannerGate message={labels.preview.banner} exitLabel={labels.preview.exit} />
                    <ChromeSwitch header={header} footer={footer}>
                        {children}
                    </ChromeSwitch>
                    {chrome?.whatsapp ? <WhatsAppFloatGate href={chrome.whatsapp.href} label={labels.common.whatsapp} /> : null}
                </DesignSystemProvider>
                {/* Last in the DOM so the skip link stays the first tab stop; the banner is fixed to the bottom of the viewport. */}
                <ConsentGate
                    labels={labels}
                    consentVersion={consentVersion}
                    consentTexts={consentTexts}
                    gtmId={gtmId}
                    gaMeasurementId={gaMeasurementId}
                    metaPixelId={metaPixelId}
                    analyticsEnabled={analyticsEnabled}
                    nonce={nonce}
                />
            </body>
        </html>
    );
}
