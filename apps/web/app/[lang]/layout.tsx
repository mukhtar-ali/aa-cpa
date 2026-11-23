import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import localFont from 'next/font/local';
import Script from 'next/script';
import { endpoint, GA_ID_REGEX, GlobalSeoSettingsModelWeb, GTM_ID_REGEX } from '@repo/shared';
import { DesignSystemProvider, Footer, Header, UtilityBar } from '@repo/design-system/layout';
import { Logo } from '@repo/design-system/primitives';
import { SkipLink } from '@repo/design-system/sections';
import { ChromeSwitch } from '@/src/reference/ChromeSwitch';
import { FBPixel } from '@/src/components/ui/FBPixel';
import { MonitoringReporter } from '@/src/monitoring/MonitoringReporter';
import { ContactClickTracker } from '@/src/components/chrome/ContactClickTracker';
import { LocaleToggleLink } from '@/src/components/chrome/LocaleToggleLink';
import { PreviewBannerGate } from '@/src/components/chrome/PreviewBannerGate';
import { RouteFocus } from '@/src/components/chrome/RouteFocus';
import { WhatsAppFloatGate } from '@/src/components/chrome/WhatsAppFloatGate';
import { dirOf, getLabels, isLang, locales } from '@/src/lib/i18n/dictionaries';
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

    return {
        title: seo?.metaTitleTemplate || 'Starter — Web',
        description: seo?.metaDescription || 'Public website powered by Next.js',
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
        openGraph: seo?.ogImage ? { images: [seo.ogImage] } : undefined,
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
    const gtmId = analyticsEnabled && seo?.googleTagManagerId && GTM_ID_REGEX.test(seo.googleTagManagerId) ? seo.googleTagManagerId : undefined;
    const gaId = analyticsEnabled && seo?.googleAnalyticsId && GA_ID_REGEX.test(seo.googleAnalyticsId) ? seo.googleAnalyticsId : undefined;

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
                legal={chrome.footer.legal}
                backToTopLabel={chrome.footer.backToTopLabel ?? labels.common.backToTop}
                wordmark={chrome.footer.wordmark ?? chrome.logo.label}
                socialsLabel={chrome.logo.label}
            />
        </div>
    ) : null;

    return (
        <html lang={lang} dir={dir} className={`${almaraiLatin.variable} ${almaraiArabic.variable}`}>
            <head>
                {gtmId && (
                    <Script id="gtm-base" strategy="afterInteractive">
                        {`
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
                            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                            f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer',${JSON.stringify(gtmId)});
                        `}
                    </Script>
                )}
                {gaId && !gtmId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
                            strategy="afterInteractive"
                        />
                        <Script id="ga-base" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', ${JSON.stringify(gaId)});
                            `}
                        </Script>
                    </>
                )}
            </head>
            <body>
                {gtmId && (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId!)}`}
                            height="0"
                            width="0"
                            style={{ display: 'none', visibility: 'hidden' }}
                            title="Google Tag Manager"
                        />
                    </noscript>
                )}
                {analyticsEnabled && <FBPixel />}
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
            </body>
        </html>
    );
}
