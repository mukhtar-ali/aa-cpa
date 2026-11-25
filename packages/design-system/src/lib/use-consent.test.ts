import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  CONSENT_COOKIE_NAME,
  deleteTrackingCookies,
  getStoredConsent,
  parseConsentCookie,
  serializeConsentCookie,
  setStoredConsent,
  useConsent,
} from './use-consent';

describe('use-consent', () => {
  // jsdom has a real cookie jar; start every test with it empty.
  const clearCookies = () => {
    for (const part of document.cookie.split(';')) {
      const name = part.trim().split('=')[0];
      if (name) document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  };

  beforeEach(() => {
    clearCookies();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cookie serialization & parsing', () => {
    it('serializes and parses consent payload with Lax and 12-month max-age', () => {
      const payload = {
        v: '1.0',
        c: { analytics: true, marketing: false },
        t: 1700000000000,
      };

      const serialized = serializeConsentCookie(payload, false);
      expect(serialized).toContain(`${CONSENT_COOKIE_NAME}=`);
      expect(serialized).toContain('Max-Age=31536000');
      expect(serialized).toContain('SameSite=Lax');
      expect(serialized).not.toContain('Secure');

      const secureSerialized = serializeConsentCookie(payload, true);
      expect(secureSerialized).toContain('Secure');

      const parsed = parseConsentCookie(encodeURIComponent(JSON.stringify(payload)));
      expect(parsed).toEqual(payload);
    });

    it('returns null on malformed or empty cookie values', () => {
      expect(parseConsentCookie('')).toBeNull();
      expect(parseConsentCookie('not-json')).toBeNull();
      expect(parseConsentCookie(encodeURIComponent(JSON.stringify({ invalid: true })))).toBeNull();
    });

    it('stores and retrieves consent via document.cookie', () => {
      const payload = {
        v: '2.0',
        c: { analytics: true, marketing: true },
        t: Date.now(),
      };
      setStoredConsent(payload);
      const retrieved = getStoredConsent();
      expect(retrieved).toEqual(payload);
    });

    it('deletes tracking cookies on revocation', () => {
      document.cookie = '_ga=GA1.2.12345; path=/';
      document.cookie = '_fbp=fb.1.12345; path=/';
      document.cookie = 'unrelated=keep_me; path=/';

      deleteTrackingCookies();

      expect(document.cookie).not.toContain('_ga=');
      expect(document.cookie).not.toContain('_fbp=');
      expect(document.cookie).toContain('unrelated=keep_me');
    });
  });

  describe('useConsent hook', () => {
    it('prompts banner when no consent cookie exists', () => {
      const { result } = renderHook(() => useConsent({ version: '1.0' }));
      expect(result.current.hasConsented).toBe(false);
      expect(result.current.isBannerOpen).toBe(true);
      expect(result.current.consent).toBeNull();
    });

    it('accepts all categories and closes banner and preferences', () => {
      const onConsentChange = vi.fn();
      const { result } = renderHook(() => useConsent({ version: '1.0', onConsentChange }));

      act(() => {
        result.current.acceptAll();
      });

      expect(result.current.hasConsented).toBe(true);
      expect(result.current.isBannerOpen).toBe(false);
      expect(result.current.consent).toEqual({ analytics: true, marketing: true });
      expect(onConsentChange).toHaveBeenCalledWith(
        expect.objectContaining({
          v: '1.0',
          c: { analytics: true, marketing: true },
        }),
      );
    });

    it('rejects all categories and persists decision', () => {
      const { result } = renderHook(() => useConsent({ version: '1.0' }));

      act(() => {
        result.current.rejectAll();
      });

      expect(result.current.hasConsented).toBe(true);
      expect(result.current.isBannerOpen).toBe(false);
      expect(result.current.consent).toEqual({ analytics: false, marketing: false });
    });

    it('saves custom per-category choices', () => {
      const { result } = renderHook(() => useConsent({ version: '1.0' }));

      act(() => {
        result.current.savePreferences({ analytics: true, marketing: false });
      });

      expect(result.current.hasConsented).toBe(true);
      expect(result.current.consent).toEqual({ analytics: true, marketing: false });
    });

    it('re-prompts banner when consent version is bumped', () => {
      // First save consent for version 1.0
      setStoredConsent({
        v: '1.0',
        c: { analytics: true, marketing: true },
        t: Date.now(),
      });

      // User visits site with version 2.0
      const { result } = renderHook(() => useConsent({ version: '2.0' }));

      // Banner should be re-opened and hasConsented false
      expect(result.current.hasConsented).toBe(false);
      expect(result.current.isBannerOpen).toBe(true);
      expect(result.current.consent).toBeNull();
    });

    it('withdraws consent and resets state', () => {
      const { result } = renderHook(() => useConsent({ version: '1.0' }));

      act(() => {
        result.current.acceptAll();
      });
      expect(result.current.hasConsented).toBe(true);

      act(() => {
        result.current.withdrawConsent();
      });
      expect(result.current.consent).toEqual({ analytics: false, marketing: false });
    });
  });
});

describe('deleteTrackingCookies keeps what the visitor granted', () => {
    const names = () => document.cookie.split(';').map((c) => c.trim().split('=')[0]).filter(Boolean);
    const seed = () => {
        document.cookie = '_ga=1; Path=/';
        document.cookie = '_fbp=1; Path=/';
    };

    it('purges only the marketing cookie when analytics is granted', async () => {
        
        seed();
        deleteTrackingCookies({ analytics: true, marketing: false });
        expect(names()).toContain('_ga');
        expect(names()).not.toContain('_fbp');
    });

    it('purges both when nothing is granted', async () => {
        
        seed();
        deleteTrackingCookies({ analytics: false, marketing: false });
        expect(names()).not.toContain('_ga');
        expect(names()).not.toContain('_fbp');
    });
});
