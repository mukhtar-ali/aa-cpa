import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import localFont from 'next/font/local';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import { endpoint, GA_ID_REGEX, GlobalSeoSettingsModelWeb, GTM_ID_REGEX } from '@repo/shared';
import { WebLayout } from '@/src/components/ui/layouts/WebLayout';
import { getHeaderProjects, getWebsiteInfo } from '@/src/lib/server-data';
import { FBPixel } from '@/src/components/ui/FBPixel';
import { MonitoringReporter } from '@/src/monitoring/MonitoringReporter';
import PageTransition from '@/src/animations/PageTransition';
import { PreloaderWrapper } from '@/src/animations/PreloaderWrapper';
import '@/src/assets/styles/tailwind.css';
import 'react-toastify/dist/ReactToastify.css';

// Self-hosted (src/assets/fonts), not next/font/google: the Google variant downloads the fonts while `next build` runs, so
// an unreachable fonts.googleapis.com on the build server failed the whole image build.
const inter = localFont({
    src: '../../src/assets/fonts/inter-latin-wght-normal.woff2',
    weight: '100 900',
    variable: '--font-inter',
    display: 'swap',
});
// Inter has no Arabic glyphs, so Arabic pages would fall back to an arbitrary system font. Cairo covers Arabic and
// Latin, shipped as two single-script files; each is its own family, and tailwind.css chains them
// (latin first, arabic as the per-glyph fallback) when <html lang="ar">.
const cairoLatin = localFont({
    src: '../../src/assets/fonts/cairo-latin-wght-normal.woff2',
    weight: '200 1000',
    variable: '--font-cairo-latin',
    display: 'swap',
});
const cairoArabic = localFont({
    src: '../../src/assets/fonts/cairo-arabic-wght-normal.woff2',
    weight: '200 1000',
    variable: '--font-cairo-arabic',
    display: 'swap',
});
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
const locales = ['en', 'ar'];
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
            other: [{ rel: 'mask-icon', url: '/images/favicon/safari-pinned-tab.svg', color: '#000000' }],
        },
        manifest: '/images/favicon/site.webmanifest',
        other: { 'msapplication-config': '/images/favicon/browserconfig.xml' },
        alternates: seo?.canonicalBase ? { canonical: `${seo.canonicalBase}/${lang}` } : undefined,
        openGraph: seo?.ogImage ? { images: [seo.ogImage] } : undefined,
    };
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    if (!locales.includes(lang)) notFound();

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const [seo, websiteInfo, headerProjects] = await Promise.all([
        getGlobalSeo(lang),
        getWebsiteInfo(lang),
        getHeaderProjects(lang),
    ]);
    // These IDs are embedded in inline <script> code. They come from an admin-editable CMS field, so
    // re-validate them here (values stored before the API enforced the format may still be bad) and
    // only ever emit them as JSON string literals / encoded URL components. Invalid IDs are skipped.
    const gtmId = seo?.googleTagManagerId && GTM_ID_REGEX.test(seo.googleTagManagerId) ? seo.googleTagManagerId : undefined;
    const gaId = seo?.googleAnalyticsId && GA_ID_REGEX.test(seo.googleAnalyticsId) ? seo.googleAnalyticsId : undefined;

    return (
        <html lang={lang} dir={dir} className={`${inter.variable} ${cairoLatin.variable} ${cairoArabic.variable} ${almaraiLatin.variable} ${almaraiArabic.variable}`}>
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
                <FBPixel />
                <MonitoringReporter />
                <ToastContainer position="top-center" rtl={dir === 'rtl'} />
                <PreloaderWrapper>
                    <PageTransition>
                        <WebLayout websiteInfo={websiteInfo} projects={headerProjects}>{children}</WebLayout>
                    </PageTransition>
                </PreloaderWrapper>
            </body>
        </html>
    );
}
