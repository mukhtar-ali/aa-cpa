import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InternalServerErrorException } from '@nestjs/common';
import { safeHttpUrl } from '@repo/shared';
import { customEnv } from '@/config/custom-env';
import { resolveS3Acl } from '../s3-acl';
import { isOurKey } from './storage-keys';
import type { PutOptions, StorageDriver } from './storage-driver';

/** Amazon S3 and S3-compatible stores (Cloudflare R2, MinIO, ...). Reads its settings from customEnv on every call. */
export class S3Storage implements StorageDriver {
    readonly name = 's3' as const;
    private client?: S3Client;

    // Built lazily (not in the constructor) so the API can boot without S3 configured —
    // only actually uploading a file requires the env vars to be set.
    private getClient(): S3Client {
        if (!customEnv.S3_BUCKET_REGION) {
            throw new InternalServerErrorException(
                'S3 is not configured. Set S3_BUCKET_NAME, S3_BUCKET_ACCESS_KEY_ID, S3_BUCKET_SECRET_ACCESS_KEY, and S3_BUCKET_REGION.',
            );
        }
        if (!this.client) {
            this.client = new S3Client({
                credentials: {
                    accessKeyId: customEnv.S3_BUCKET_ACCESS_KEY_ID,
                    secretAccessKey: customEnv.S3_BUCKET_SECRET_ACCESS_KEY,
                },
                region: customEnv.S3_BUCKET_REGION,
                // S3-compatible stores (R2, MinIO): custom endpoint, and MinIO needs path-style addressing.
                // Trimmed: startup validation accepts these after trimming, so runtime must use the same value
                // (a whitespace-only endpoint is "unset", not an invalid endpoint).
                ...(customEnv.S3_ENDPOINT.trim() ? { endpoint: customEnv.S3_ENDPOINT.trim() } : {}),
                ...(customEnv.S3_FORCE_PATH_STYLE.trim().toLowerCase() === 'true' ? { forcePathStyle: true } : {}),
            });
        }
        return this.client;
    }

    async put(key: string, body: Buffer, options: PutOptions): Promise<void> {
        // Resolved per upload so a bad S3_OBJECT_ACL fails loudly instead of uploading with the wrong ACL.
        // `none` sends no ACL at all (buckets with "Bucket owner enforced" ownership reject any ACL).
        const acl = resolveS3Acl(options.acl ?? (options.isPrivate ? 'none' : customEnv.S3_OBJECT_ACL));
        await this.getClient().send(
            new PutObjectCommand({
                Bucket: customEnv.S3_BUCKET_NAME,
                Key: key,
                Body: body,
                ContentType: options.contentType,
                ...(acl ? { ACL: acl } : {}),
            }),
        );
    }

    /**
     * The URL stored for an object key. With S3_PUBLIC_BASE_URL (e.g. an R2 public domain or a CDN) it is built from
     * that; otherwise it is the plain AWS S3 virtual-hosted URL. Each key segment is percent-encoded
     * (keyFromStoredUrl decodes it back), so any character that survived safeStorageFilename (e.g. Arabic letters)
     * is a valid URL character.
     */
    urlForKey(key: string): string {
        const encodedKey = key.split('/').map(encodeURIComponent).join('/');
        const publicBase = safeHttpUrl(customEnv.S3_PUBLIC_BASE_URL);
        return publicBase
            ? `${publicBase.replace(/\/+$/, '')}/${encodedKey}`
            : `https://${customEnv.S3_BUCKET_NAME}.s3.amazonaws.com/${encodedKey}`;
    }

    async copy(fromKey: string, toKey: string): Promise<void> {
        const client = this.getClient();
        const Bucket = customEnv.S3_BUCKET_NAME;
        const copySource = `${Bucket}/${fromKey.split('/').map(encodeURIComponent).join('/')}`;
        await client.send(new CopyObjectCommand({ Bucket, Key: toKey, CopySource: copySource }));
        await client.send(new HeadObjectCommand({ Bucket, Key: toKey }));
    }

    async delete(key: string): Promise<void> {
        await this.getClient().send(new DeleteObjectCommand({ Bucket: customEnv.S3_BUCKET_NAME, Key: key }));
    }

    /**
     * Recognises the three shapes urlForKey/the config can produce (S3_PUBLIC_BASE_URL, AWS virtual-hosted,
     * S3_ENDPOINT path-style) and only accepts keys under our two prefixes, so a stored value can never make us
     * sign an arbitrary object.
     */
    keyFromStoredUrl(url: string): string | undefined {
        const prefixes: string[] = [];
        const publicBase = safeHttpUrl(customEnv.S3_PUBLIC_BASE_URL);
        if (publicBase) prefixes.push(`${publicBase.replace(/\/+$/, '')}/`);
        prefixes.push(`https://${customEnv.S3_BUCKET_NAME}.s3.amazonaws.com/`);
        const endpoint = customEnv.S3_ENDPOINT.trim();
        if (endpoint) prefixes.push(`${endpoint.replace(/\/+$/, '')}/${customEnv.S3_BUCKET_NAME}/`);

        const prefix = prefixes.find((candidate) => url.startsWith(candidate));
        if (!prefix) return undefined;
        let key: string;
        try {
            key = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);
        } catch {
            return undefined;
        }
        return isOurKey(key) ? key : undefined;
    }

    async signedReadUrl(url: string, expiresInSeconds: number): Promise<string> {
        const key = this.keyFromStoredUrl(url);
        if (!key) return url;
        return getSignedUrl(this.getClient(), new GetObjectCommand({ Bucket: customEnv.S3_BUCKET_NAME, Key: key }), { expiresIn: expiresInSeconds });
    }
}
