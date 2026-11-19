import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createUniqueFilename } from '@repo/shared';
import sharp from 'sharp';
import { customEnv } from '@/config/custom-env';
import { getImageDimensions, processUploadedImage } from '@/common/image-field.util';
import type { S3AclSetting } from './s3-acl';
import { LocalStorage } from './storage/local.storage';
import { S3Storage } from './storage/s3.storage';
import { resolveStorageDriverName } from './storage/storage-config';
import type { StorageDriver } from './storage/storage-driver';
import { PRIVATE_KEY_PREFIX, UPLOAD_KEY_PREFIX } from './storage/storage-keys';

export { PRIVATE_KEY_PREFIX, UPLOAD_KEY_PREFIX };

export interface ImageUploadResult {
    url: string;
    width?: number;
    height?: number;
}

/** Longest file-name part of a key once percent-encoded (keeps the whole stored URL well under 500 characters). */
export const MAX_ENCODED_FILENAME_LENGTH = 120;

/** How long a signed read link stays valid. Short on purpose: the admin list re-fetches on focus. */
export const SIGNED_URL_TTL_SECONDS = 15 * 60;

/**
 * A storage-safe version of an uploaded file's name. The name is chosen by the uploader (anonymous job applicants
 * included) and becomes part of the object key and URL, so '#', '?', '%', '/', spaces and the like would corrupt
 * the URL and later make the key unrecoverable for signing. Letters and digits of any script (Arabic names are
 * normal here), '.', '_' and '-' are kept; everything else becomes '_'.
 */
export function safeStorageFilename(name: string): string {
    const lastSegment = name.split(/[\\/]/).pop() ?? '';
    const cleaned = lastSegment
        .normalize('NFC')
        .replace(/[^\p{L}\p{N}._-]+/gu, '_')
        .replace(/^[._]+/, '');
    // Keep the END of the name (the extension matters). Trim by code point, not UTF-16 unit (cutting an astral-plane
    // letter in half leaves a lone surrogate that makes encodeURIComponent throw), and by ENCODED length: the URL is
    // stored in a VARCHAR(500) column and one Arabic letter becomes 6 characters once percent-encoded.
    const kept: string[] = [];
    let encodedLength = 0;
    for (const char of Array.from(cleaned).reverse()) {
        encodedLength += encodeURIComponent(char).length;
        if (encodedLength > MAX_ENCODED_FILENAME_LENGTH) break;
        kept.unshift(char);
    }
    const trimmed = kept.join('').replace(/^[._]+/, '');
    return trimmed || 'file';
}

@Injectable()
export class ResourceService {
    private readonly logger = new Logger(ResourceService.name);
    private readonly s3 = new S3Storage();
    private readonly local = new LocalStorage();

    /** The storage backend for uploads. Resolved per call so a changed setting (and tests) take effect at once. */
    get driver(): StorageDriver {
        return resolveStorageDriverName(customEnv) === 's3' ? this.s3 : this.local;
    }

    /**
     * Stores a file and returns its URL. `options.acl` overrides the S3_OBJECT_ACL default for this one upload (S3
     * only). `visibility: 'private'` is for files that must never be public (applicants' résumés): it stores them
     * under PRIVATE_KEY_PREFIX, never public; read them back with signedReadUrl.
     */
    async uploadFile(file: Express.Multer.File, options: { acl?: S3AclSetting; visibility?: 'public' | 'private' } = {}) {
        const isPrivate = options.visibility === 'private';
        try {
            if (file.mimetype.startsWith('image/')) {
                file = await this.compressImage(file);
            }
        } catch {
            throw new InternalServerErrorException('Failed to process file');
        }

        const dateFolder = new Date().toISOString().split('T')[0];
        const fileKey = `${isPrivate ? PRIVATE_KEY_PREFIX : UPLOAD_KEY_PREFIX}${dateFolder}/${createUniqueFilename(safeStorageFilename(file.originalname))}`;

        const driver = this.driver;
        // Built BEFORE the write so an encoding failure can never leave a stored object without a link.
        const url = driver.urlForKey(fileKey);
        await driver.put(fileKey, file.buffer, { contentType: file.mimetype, isPrivate, acl: options.acl });
        return url;
    }

    /**
     * Uploads an image, compressing and resizing it (max 2560px), and returns the URL with width/height.
     */
    async uploadImage(file: Express.Multer.File, options: { acl?: S3AclSetting; visibility?: 'public' | 'private' } = {}): Promise<ImageUploadResult> {
        let width: number | undefined;
        let height: number | undefined;
        try {
            if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
                const processed = await processUploadedImage(file.buffer);
                file = {
                    ...file,
                    buffer: processed.buffer,
                    mimetype: processed.mimetype,
                    originalname: file.originalname.replace(/\.[^/.]+$/, '.webp'),
                };
                width = processed.width;
                height = processed.height;
            } else if (file.mimetype.includes('svg')) {
                const dims = await getImageDimensions(file.buffer);
                width = dims.width;
                height = dims.height;
            }
        } catch {
            throw new InternalServerErrorException('Failed to process image');
        }

        const url = await this.uploadFile(file, options);
        return { url, width, height };
    }

    /** See StorageDriver.urlForKey. */
    urlForKey(key: string): string {
        return this.driver.urlForKey(key);
    }

    /** Copies an object to another key (the copy is private) and confirms the copy exists. */
    copyObject(fromKey: string, toKey: string): Promise<void> {
        return this.driver.copy(fromKey, toKey);
    }

    deleteObject(key: string): Promise<void> {
        return this.driver.delete(key);
    }

    /** The object key behind a URL uploadFile returned, or undefined for any other URL. */
    keyFromStoredUrl(url: string): string | undefined {
        return this.driver.keyFromStoredUrl(url);
    }

    /**
     * A short-lived link for reading an object this service stored (works for private and public objects).
     * URLs that are not ours are returned unchanged. Throws if the backend is not configured.
     */
    signedReadUrl(url: string, expiresIn = SIGNED_URL_TTL_SECONDS): Promise<string> {
        return this.driver.signedReadUrl(url, expiresIn);
    }

    /** signedReadUrl for list/detail responses: one bad or unsignable link must not fail the whole response. */
    async signedReadUrlOrOriginal(url: string): Promise<string> {
        try {
            return await this.signedReadUrl(url);
        } catch (error) {
            this.logger.warn(`Could not sign a read URL, returning the stored one: ${(error as Error).message}`);
            return url;
        }
    }

    private async compressImage(file: Express.Multer.File): Promise<Express.Multer.File> {
        if (file.mimetype.includes('svg')) return file;
        const processed = await processUploadedImage(file.buffer);

        return {
            ...file,
            buffer: processed.buffer,
            mimetype: processed.mimetype,
            originalname: file.originalname.replace(/\.[^/.]+$/, '.webp'),
        };
    }
}
