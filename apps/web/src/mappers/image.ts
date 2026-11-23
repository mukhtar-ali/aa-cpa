import type { ImageRef } from '@repo/design-system/types';

export interface ImageLike {
    /** API image: `url`; web image ref: `src`. */
    url?: string;
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
}

/** Used when the API sends no dimensions (next/image needs some to reserve space and avoid layout shift). */
export const DEFAULT_IMAGE_SIZE = { width: 1200, height: 800 } as const;

/**
 * API image → design-system `ImageRef`. In development builds it warns about a non-decorative image without alt text
 * (FR-014); production stays quiet and renders the image with an empty alt so the page never breaks.
 */
export function toImageRef(image: ImageLike | null | undefined, options: { decorative?: boolean } = {}): ImageRef | undefined {
    const src = image?.url ?? image?.src;
    if (!src) return undefined;
    const alt = (image?.alt ?? '').trim();
    if (!options.decorative && !alt && process.env.NODE_ENV !== 'production') {
        console.warn(`[a11y] Image without alt text: ${src}. Add alt text in the admin, or mark the image decorative.`);
    }
    return {
        src,
        alt: options.decorative ? '' : alt,
        width: image?.width ?? DEFAULT_IMAGE_SIZE.width,
        height: image?.height ?? DEFAULT_IMAGE_SIZE.height,
        ...(options.decorative ? { decorative: true } : {}),
    };
}
