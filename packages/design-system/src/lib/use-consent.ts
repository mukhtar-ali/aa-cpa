import * as React from 'react';

export const CONSENT_COOKIE_NAME = 'aacpa_consent';
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 12 months (~31,536,000 s)

export interface ConsentCategories {
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentCookiePayload {
  /** Consent schema version from CMS/settings. Version bump triggers re-prompting. */
  v: string;
  /** Granted category choices (necessary is always implied true and omitted from storage). */
  c: ConsentCategories;
  /** Epoch timestamp in milliseconds when consent choice was made. */
  t: number;
}

export interface UseConsentOptions {
  /** Active consent policy version. When this changes from stored cookie version, user is re-prompted. Default '1.0'. */
  version?: string;
  /** Default category selections if no preference is saved yet. */
  defaultCategories?: ConsentCategories;
  /** Optional callback fired whenever consent state changes. */
  onConsentChange?: (consent: ConsentCookiePayload) => void;
}

export interface UseConsentReturn {
  /** Current consent categories, or null if no decision has been recorded for the current version. */
  consent: ConsentCategories | null;
  /** Full payload with version and timestamp, or null if unconsented. */
  payload: ConsentCookiePayload | null;
  /** Whether the user has made a valid consent choice for the active version. */
  hasConsented: boolean;
  /** Whether the bottom consent banner should be visible. */
  isBannerOpen: boolean;
  /** Whether the detailed preferences modal dialog is open. */
  isPreferencesOpen: boolean;
  /** Accept all optional categories (analytics=true, marketing=true) and persist. */
  acceptAll: () => void;
  /** Reject all optional categories (analytics=false, marketing=false) and persist. */
  rejectAll: () => void;
  /** Save customized category choices and persist. */
  savePreferences: (categories: ConsentCategories) => void;
  /** Revoke consent (equivalent to reject all and clear tracking cookies). */
  withdrawConsent: () => void;
  /** Open the preferences modal dialog. */
  openPreferences: () => void;
  /** Close the preferences modal dialog. */
  closePreferences: () => void;
  /** Dismiss the banner without making a choice (banner closes for current session). */
  closeBanner: () => void;
}

/**
 * Safely parses the `aacpa_consent` cookie value from a cookie header or string.
 */
export function parseConsentCookie(cookieStr?: string): ConsentCookiePayload | null {
  if (!cookieStr) return null;
  try {
    const raw = decodeURIComponent(cookieStr);
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.v === 'string' &&
      typeof parsed.c === 'object' &&
      parsed.c !== null &&
      typeof parsed.c.analytics === 'boolean' &&
      typeof parsed.c.marketing === 'boolean' &&
      typeof parsed.t === 'number'
    ) {
      return {
        v: parsed.v,
        c: {
          analytics: Boolean(parsed.c.analytics),
          marketing: Boolean(parsed.c.marketing),
        },
        t: parsed.t,
      };
    }
  } catch {
    /* Invalid JSON or corrupt cookie */
  }
  return null;
}

/**
 * Extracts and parses the `aacpa_consent` cookie from `document.cookie`.
 * Returns null if missing, malformed, or if running in SSR.
 */
export function getStoredConsent(): ConsentCookiePayload | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const part of cookies) {
    const [name, ...val] = part.trim().split('=');
    if (name === CONSENT_COOKIE_NAME) {
      return parseConsentCookie(val.join('='));
    }
  }
  return null;
}

/**
 * Serializes the consent payload to a cookie string complying with contract:
 * first-party, 12 months, SameSite=Lax, Secure on https.
 */
export function serializeConsentCookie(payload: ConsentCookiePayload, isSecure = false): string {
  const json = encodeURIComponent(JSON.stringify(payload));
  const secureFlag = isSecure ? '; Secure' : '';
  return `${CONSENT_COOKIE_NAME}=${json}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;
}

/**
 * Persists the consent payload to `document.cookie`.
 */
export function setStoredConsent(payload: ConsentCookiePayload): void {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = serializeConsentCookie(payload, isSecure);
}

/**
 * Deletes tracking cookies of the categories that are NOT granted: Google Analytics (`_ga*`, `_gid`) for `analytics`,
 * Meta Pixel (`_fbp`, `_fbc`) for `marketing`. Pass the current choices; with no argument both categories are purged.
 * A category the visitor granted keeps its cookies.
 */
export function deleteTrackingCookies(granted: Partial<ConsentCategories> = {}): void {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  const trackingPrefixes = [...(granted.analytics ? [] : ['_ga', '_gid']), ...(granted.marketing ? [] : ['_fbp', '_fbc'])];
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const domainParts = host ? host.split('.') : [];
  const domains: string[] = [''];
  if (host) {
    domains.push(`; domain=${host}`);
    if (domainParts.length > 1) {
      domains.push(`; domain=.${domainParts.slice(-2).join('.')}`);
    }
  }

  for (const part of cookies) {
    const cookieName = part.trim().split('=')[0] ?? '';
    if (trackingPrefixes.some((prefix) => cookieName.startsWith(prefix))) {
      for (const d of domains) {
        document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT${d}; SameSite=Lax`;
      }
    }
  }
}

/**
 * Hook managing visitor consent state according to 004 consent contract:
 * - Cookie `aacpa_consent` = `{ v, c: { analytics, marketing }, t }`
 * - Valid for 12 months, SameSite=Lax, Secure on HTTPS
 * - Re-prompts banner whenever `version` changes from stored version
 * - Provides acceptAll, rejectAll, savePreferences, withdrawConsent
 */
export function useConsent(options: UseConsentOptions = {}): UseConsentReturn {
  const { version = '1.0', defaultCategories = { analytics: false, marketing: false }, onConsentChange } = options;

  const [payload, setPayload] = React.useState<ConsentCookiePayload | null>(null);
  const [isBannerOpen, setIsBannerOpen] = React.useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false);

  // Initialize consent from cookie on client mount
  React.useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      if (stored.v === version) {
        setPayload(stored);
        setIsBannerOpen(false);
      } else {
        // Version bump re-prompts: stored version doesn't match active version
        setPayload(null);
        setIsBannerOpen(true);
      }
    } else {
      // First visit: no consent choice recorded yet
      setPayload(null);
      setIsBannerOpen(true);
    }
  }, [version]);

  const commitConsent = React.useCallback(
    (categories: ConsentCategories) => {
      const nextPayload: ConsentCookiePayload = {
        v: version,
        c: categories,
        t: Date.now(),
      };
      setStoredConsent(nextPayload);
      setPayload(nextPayload);
      setIsBannerOpen(false);
      setIsPreferencesOpen(false);

      // Clean up tracking cookies if categories were revoked or rejected
      if (!categories.analytics || !categories.marketing) {
        deleteTrackingCookies(categories);
      }

      onConsentChange?.(nextPayload);
    },
    [version, onConsentChange],
  );

  const acceptAll = React.useCallback(() => {
    commitConsent({ analytics: true, marketing: true });
  }, [commitConsent]);

  const rejectAll = React.useCallback(() => {
    commitConsent({ analytics: false, marketing: false });
  }, [commitConsent]);

  const savePreferences = React.useCallback(
    (categories: ConsentCategories) => {
      commitConsent(categories);
    },
    [commitConsent],
  );

  const withdrawConsent = React.useCallback(() => {
    commitConsent({ analytics: false, marketing: false });
  }, [commitConsent]);

  const openPreferences = React.useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = React.useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const closeBanner = React.useCallback(() => {
    setIsBannerOpen(false);
  }, []);

  return {
    consent: payload ? payload.c : null,
    payload,
    hasConsented: Boolean(payload && payload.v === version),
    isBannerOpen,
    isPreferencesOpen,
    acceptAll,
    rejectAll,
    savePreferences,
    withdrawConsent,
    openPreferences,
    closePreferences,
    closeBanner,
  };
}
