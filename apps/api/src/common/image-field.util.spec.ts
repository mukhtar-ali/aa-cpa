import sharp from 'sharp';
import {
    getImageDimensions,
    processUploadedImage,
    toImageRef,
    MAX_IMAGE_WIDTH,
} from './image-field.util';

describe('image-field.util', () => {
    describe('getImageDimensions', () => {
        it('returns width and height from an image buffer', async () => {
            const buf = await sharp({
                create: { width: 100, height: 60, channels: 4, background: '#ff0000' },
            })
                .png()
                .toBuffer();

            const dims = await getImageDimensions(buf);
            expect(dims).toEqual({ width: 100, height: 60 });
        });

        it('returns empty object for invalid buffer', async () => {
            const dims = await getImageDimensions(Buffer.from('not an image'));
            expect(dims).toEqual({});
        });
    });

    describe('processUploadedImage', () => {
        it('compresses to webp and preserves dimensions when <= 2560px', async () => {
            const buf = await sharp({
                create: { width: 800, height: 600, channels: 3, background: '#00ff00' },
            })
                .jpeg()
                .toBuffer();

            const processed = await processUploadedImage(buf);
            expect(processed.mimetype).toBe('image/webp');
            expect(processed.width).toBe(800);
            expect(processed.height).toBe(600);
            expect(processed.buffer.length).toBeGreaterThan(0);
        });

        it('resizes images larger than 2560px down to 2560px max width', async () => {
            const buf = await sharp({
                create: { width: 3000, height: 1500, channels: 3, background: '#0000ff' },
            })
                .png()
                .toBuffer();

            const processed = await processUploadedImage(buf);
            expect(processed.mimetype).toBe('image/webp');
            expect(processed.width).toBe(MAX_IMAGE_WIDTH);
            expect(processed.height).toBe(1280);
        });
    });

    describe('toImageRef', () => {
        const sampleField = {
            url: 'https://example.com/photo.webp',
            width: 1200,
            height: 800,
            alt: { ar: 'صورة تجريبية', en: 'Test photo' },
        };

        it('maps ImageField to ImageRef with language-specific alt', () => {
            expect(toImageRef(sampleField, 'ar')).toEqual({
                src: 'https://example.com/photo.webp',
                width: 1200,
                height: 800,
                alt: 'صورة تجريبية',
            });

            expect(toImageRef(sampleField, 'en')).toEqual({
                src: 'https://example.com/photo.webp',
                width: 1200,
                height: 800,
                alt: 'Test photo',
            });
        });

        it('falls back to Arabic alt when English is empty', () => {
            const field = {
                url: 'https://example.com/photo.webp',
                width: 1200,
                height: 800,
                alt: { ar: 'صورة تجريبية', en: '' },
            };

            expect(toImageRef(field, 'en')).toEqual({
                src: 'https://example.com/photo.webp',
                width: 1200,
                height: 800,
                alt: 'صورة تجريبية',
            });
        });

        it('returns null when input is null or undefined', () => {
            expect(toImageRef(null)).toBeNull();
            expect(toImageRef(undefined)).toBeNull();
        });
    });
});
