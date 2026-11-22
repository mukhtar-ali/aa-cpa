/**
 * Meta Pixel (Facebook Pixel) tracking helpers. `<FBPixel>` (src/components/ui/FBPixel.tsx)
 * loads the actual `fbq` base code; these are thin wrappers around the resulting global,
 * safe to call before it's loaded (no-ops until then).
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? '';

type FbqEventParams = Record<string, string | number | boolean | undefined>;

export const trackEvent = (eventName: string, params?: FbqEventParams): void => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, params);
    }
};

export const trackCustomEvent = (eventName: string, params?: FbqEventParams): void => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, params);
    }
};

export const pageview = (): void => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
    }
};

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
        _fbq?: unknown;
    }
}
