'use client';

import * as React from 'react';
import Script from 'next/script';
import {
  ConsentBanner,
  ConsentPreferences,
  type ConsentBannerTexts,
  type ConsentCategoryItem,
  type ConsentPreferencesTexts,
} from '@repo/design-system/layout';
import {
  deleteTrackingCookies,
  useConsent,
  type ConsentCategories,
  type ConsentCookiePayload,
} from '@repo/design-system/lib';
import { FBPixel } from '@/src/components/ui/FBPixel';
import type { Labels } from '@/src/lib/i18n/dictionaries';

/** CMS copy from `seo-global.consentTexts`, already localized by the API (`Localized<ConsentTexts>`). Every field is optional: the dictionaries are the default. */
export type ConsentTextsOverride = Partial<Record<'bannerTitle' | 'bannerDescription' | 'acceptAllLabel' | 'rejectAllLabel' | 'customizeLabel' | 'analyticsDescription' | 'marketingDescription', string>>;

export interface ConsentGateProps {
  labels: Labels;
  consentVersion?: string;
  consentTexts?: ConsentTextsOverride;
  gtmId?: string;
  gaMeasurementId?: string;
  metaPixelId?: string;
  analyticsEnabled?: boolean;
  /** Per-request CSP nonce for the scripts this component injects. */
  nonce?: string;
}

/**
 * Client-side consent manager and gated script loader according to 004 contract:
 * - Listens for footer `#cookie-settings` link to reopen preferences.
 * - Updates Google Consent Mode v2 via gtag('consent', 'update', ...) whenever choices change.
 * - Dynamically loads GTM / GA4 only when analytics consent is granted.
 * - Dynamically loads Meta Pixel only when marketing consent is granted.
 * - Deletes tracking cookies on withdrawal or rejection.
 */
export function ConsentGate({
  labels,
  consentVersion = '1.0',
  consentTexts,
  gtmId,
  gaMeasurementId,
  metaPixelId,
  analyticsEnabled = true,
  nonce,
}: ConsentGateProps) {
  const updateGtagConsent = React.useCallback((c: ConsentCategories) => {
    if (typeof window !== 'undefined' && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('consent', 'update', {
        analytics_storage: c.analytics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied',
      });
    }
  }, []);

  const handleConsentChange = React.useCallback(
    (payload: ConsentCookiePayload) => {
      updateGtagConsent(payload.c);
      if (!payload.c.analytics || !payload.c.marketing) {
        deleteTrackingCookies(payload.c);
      }
    },
    [updateGtagConsent],
  );

  const {
    consent,
    isBannerOpen,
    isPreferencesOpen,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useConsent({
    version: consentVersion,
    onConsentChange: handleConsentChange,
  });

  // On initial client mount with existing valid consent, sync gtag consent mode
  React.useEffect(() => {
    if (consent) {
      updateGtagConsent(consent);
    }
  }, [consent, updateGtagConsent]);

  // Handle the footer "Cookie settings" link (label from the dictionaries)
  React.useEffect(() => {
    const handleFooterClick = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest?.('a[href="#cookie-settings"]');
      if (target) {
        e.preventDefault();
        openPreferences();
      }
    };

    document.addEventListener('click', handleFooterClick);
    return () => {
      document.removeEventListener('click', handleFooterClick);
    };
  }, [openPreferences]);

  // Copy definitions merging dictionary defaults with CMS overrides
  const bannerTexts: ConsentBannerTexts = {
    title: consentTexts?.bannerTitle || labels.consent?.title,
    description: consentTexts?.bannerDescription || labels.consent?.description || '',
    acceptAll: consentTexts?.acceptAllLabel || labels.consent?.acceptAll || 'Accept all',
    rejectAll: consentTexts?.rejectAllLabel || labels.consent?.rejectAll || 'Reject non-essential',
    customize: consentTexts?.customizeLabel || labels.consent?.customize || 'Preferences',
  };

  const prefTexts: ConsentPreferencesTexts = {
    title: labels.consent?.prefsTitle || 'Cookie Preferences',
    description: labels.consent?.prefsDescription,
    save: labels.consent?.save || 'Save preferences',
    acceptAll: consentTexts?.acceptAllLabel || labels.consent?.acceptAll || 'Accept all',
    rejectAll: consentTexts?.rejectAllLabel || labels.consent?.rejectAll || 'Reject all',
    close: labels.consent?.close || 'Close',
    alwaysActive: labels.consent?.alwaysActive || 'Always active',
  };

  const categories: ConsentCategoryItem[] = [
    {
      id: 'necessary',
      label: labels.consent?.categories?.necessary?.label || 'Strictly Necessary',
      description:
        labels.consent?.categories?.necessary?.description ||
        'Essential cookies for site operation and security.',
      locked: true,
    },
    {
      id: 'analytics',
      label: labels.consent?.categories?.analytics?.label || 'Analytics',
      description:
        consentTexts?.analyticsDescription ||
        labels.consent?.categories?.analytics?.description ||
        'Cookies to understand visitor traffic and page performance.',
      locked: false,
    },
    {
      id: 'marketing',
      label: labels.consent?.categories?.marketing?.label || 'Marketing',
      description:
        consentTexts?.marketingDescription ||
        labels.consent?.categories?.marketing?.description ||
        'Cookies to measure campaign effectiveness and deliver relevant messages.',
      locked: false,
    },
  ];

  const hasAnalyticsConsent = Boolean(analyticsEnabled && consent?.analytics);
  const hasMarketingConsent = Boolean(analyticsEnabled && consent?.marketing);

  return (
    <>
      {/* GTM container only loaded after analytics consent is granted */}
      {hasAnalyticsConsent && gtmId && (
        <Script id="gtm-gated" strategy="afterInteractive" nonce={nonce}>
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

      {/* GA4 container only loaded after analytics consent is granted and GTM is not present */}
      {hasAnalyticsConsent && gaMeasurementId && !gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
            strategy="afterInteractive"
            nonce={nonce}
          />
          <Script id="ga-gated" strategy="afterInteractive" nonce={nonce}>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(gaMeasurementId)});
            `}
          </Script>
        </>
      )}

      {/* Meta pixel only loaded after marketing consent is granted */}
      {hasMarketingConsent && metaPixelId && <FBPixel pixelId={metaPixelId} nonce={nonce} />}

      {/* Presentational Consent Banner */}
      <ConsentBanner
        open={isBannerOpen}
        texts={bannerTexts}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
        onCustomize={openPreferences}
      />

      {/* Accessible Preferences Dialog */}
      <ConsentPreferences
        open={isPreferencesOpen}
        onOpenChange={(next) => (next ? openPreferences() : closePreferences())}
        texts={prefTexts}
        categories={categories}
        value={{
          analytics: Boolean(consent?.analytics),
          marketing: Boolean(consent?.marketing),
        }}
        onSave={savePreferences}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
      />
    </>
  );
}
