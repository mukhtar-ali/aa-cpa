import sharp from 'sharp';
import { ImageFieldSchema, ImageRefSchema } from '@repo/shared';
import { z } from 'zod';

export type ImageField = z.infer<typeof ImageFieldSchema>;
export type ImageRef = z.infer<typeof ImageRefSchema>;

export const MAX_IMAGE_WIDTH = 2560;

/**
 * Extracts width and height metadata from an image buffer using sharp.
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width?: number; height?: number }> {
    try {
        const metadata = await sharp(buffer).metadata();
        return { width: metadata.width, height: metadata.height };
    } catch {
        return {};
    }
}

/**
 * Resizes images > 2560px without enlargement, converts to webp (quality 80).
 */
export async function processUploadedImage(buffer: Buffer): Promise<{
    buffer: Buffer;
    mimetype: string;
    width: number;
    height: number;
}> {
    const instance = sharp(buffer)
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 });

    const compressedBuffer = await instance.toBuffer();
    const metadata = await sharp(compressedBuffer).metadata();

    return {
        buffer: compressedBuffer,
        mimetype: 'image/webp',
        width: metadata.width || 0,
        height: metadata.height || 0,
    };
}

/**
 * Maps an ImageField ({ url, width, height, alt: { ar, en } })
 * to an ImageRef ({ src, width, height, alt: string }) for public web endpoints.
 */
export function toImageRef(image: ImageField | null | undefined, lang: 'ar' | 'en' = 'ar'): ImageRef | null {
    if (!image || !image.url) {
        return null;
    }
    const altText = image.alt
        ? (lang === 'en' && image.alt.en && image.alt.en.trim() !== '' ? image.alt.en : image.alt.ar || '')
        : '';

    return {
        src: image.url,
        width: image.width,
        height: image.height,
        alt: altText,
    };
}
