import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { ResourceController } from './resource.controller';
import { MAX_IMAGE_BYTES, MAX_PDF_BYTES, MAX_VIDEO_BYTES } from './upload-limits';

type MulterInterceptor = new () => { multer?: { limits?: { fileSize?: number; files?: number } } };
const limitsOf = (handler: unknown) => {
    const interceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, handler as never) as MulterInterceptor[];
    return new interceptors[0]().multer?.limits;
};

describe('ResourceController upload limits (MUK-473)', () => {
    // multer aborts an oversized upload while it streams in; a pipe validator alone only runs AFTER the
    // whole file has been buffered in memory.
    it.each([
        ['uploadImage', MAX_IMAGE_BYTES],
        ['uploadVideo', MAX_VIDEO_BYTES],
        ['uploadPdf', MAX_PDF_BYTES],
    ] as const)('%s caps the upload at the multer level and accepts a single file', (name, max) => {
        expect(limitsOf(ResourceController.prototype[name])).toEqual({ fileSize: max, files: 1 });
    });

    it('uses sensible caps', () => {
        expect(MAX_IMAGE_BYTES).toBe(10 * 1024 * 1024);
        expect(MAX_PDF_BYTES).toBe(20 * 1024 * 1024);
        expect(MAX_VIDEO_BYTES).toBe(100 * 1024 * 1024);
    });
});
