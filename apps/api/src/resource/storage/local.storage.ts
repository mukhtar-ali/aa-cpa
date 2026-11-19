import { createHmac, timingSafeEqual } from 'node:crypto';
import { constants as fsConstants, promises as fs } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { InternalServerErrorException } from '@nestjs/common';
import { safeHttpUrl } from '@repo/shared';
import { customEnv } from '@/config/custom-env';
import { isOurKey, PRIVATE_KEY_PREFIX, UPLOAD_KEY_PREFIX } from './storage-keys';
import type { PutOptions, StorageDriver } from './storage-driver';

/** Public files are served from here; the folder behind PRIVATE_KEY_PREFIX is never served statically. */
export const LOCAL_PUBLIC_URL_PATH = '/uploads/';
/** Where private files are *addressed* (stored URLs); the route 404s without a signed token, so it only names them. */
export const LOCAL_PRIVATE_URL_PATH = '/private-files/';
/** The token-protected download route (see LocalFilesController). */
export const LOCAL_DOWNLOAD_PATH = '/api/files/download';

const DOWNLOAD_KEY_CONTEXT = 'local-storage-download-v1';

export interface DownloadParams {
    key: string;
    exp: string;
    sig: string;
}

/** Files on this server's disk. Reads its settings from customEnv on every call. */
export class LocalStorage implements StorageDriver {
    readonly name = 'local' as const;

    /** Absolute storage root: UPLOADS_DIR, or `storage/` in the folder the API runs from. */
    get root(): string {
        const configured = customEnv.UPLOADS_DIR.trim();
        return resolve(configured !== '' ? configured : join(process.cwd(), 'storage'));
    }

    /** Folder the /uploads route serves. Never includes the private prefix. */
    get publicDir(): string {
        return this.fileFor(UPLOAD_KEY_PREFIX.replace(/\/$/, ''), { directory: true });
    }

    /** The API's public origin, without a trailing slash. */
    get apiBaseUrl(): string {
        const configured = safeHttpUrl(customEnv.API_PUBLIC_URL);
        return (configured ?? `http://localhost:${customEnv.APP_PORT}`).replace(/\/+$/, '');
    }

    /**
     * The absolute path for a key, or a thrown error. Defence in depth: the key must be one of ours, every segment must
     * be an ordinary name, and the resolved path must stay inside the storage root.
     */
    private fileFor(key: string, options: { directory?: boolean } = {}): string {
        const segments = key.split('/');
        const ordinary = segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..' && !/[\\\0]/.test(segment));
        const allowed = options.directory ? isOurKey(`${key}/`) : isOurKey(key);
        if (!ordinary || !allowed) throw new InternalServerErrorException('Invalid storage key');
        const root = this.root;
        const path = resolve(root, ...segments);
        if (path !== root && !path.startsWith(root + sep)) throw new InternalServerErrorException('Invalid storage key');
        return path;
    }

    // Local files have no ACLs or content types: the options only matter to S3.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async put(key: string, body: Buffer, _options?: PutOptions): Promise<void> {
        const path = this.fileFor(key);
        await fs.mkdir(dirname(path), { recursive: true });
        // 'wx': never overwrite an existing file. Names carry a unique prefix, so a collision means something is wrong.
        await fs.writeFile(path, body, { flag: 'wx', mode: 0o640 });
    }

    urlForKey(key: string): string {
        const encode = (rest: string) => rest.split('/').map(encodeURIComponent).join('/');
        if (key.startsWith(UPLOAD_KEY_PREFIX)) return `${this.apiBaseUrl}${LOCAL_PUBLIC_URL_PATH}${encode(key.slice(UPLOAD_KEY_PREFIX.length))}`;
        if (key.startsWith(PRIVATE_KEY_PREFIX)) return `${this.apiBaseUrl}${LOCAL_PRIVATE_URL_PATH}${encode(key.slice(PRIVATE_KEY_PREFIX.length))}`;
        throw new InternalServerErrorException('Invalid storage key');
    }

    keyFromStoredUrl(url: string): string | undefined {
        const base = this.apiBaseUrl;
        let prefix: string;
        let keyPrefix: string;
        if (url.startsWith(`${base}${LOCAL_PUBLIC_URL_PATH}`)) {
            prefix = `${base}${LOCAL_PUBLIC_URL_PATH}`;
            keyPrefix = UPLOAD_KEY_PREFIX;
        } else if (url.startsWith(`${base}${LOCAL_PRIVATE_URL_PATH}`)) {
            prefix = `${base}${LOCAL_PRIVATE_URL_PATH}`;
            keyPrefix = PRIVATE_KEY_PREFIX;
        } else {
            return undefined;
        }
        let rest: string;
        try {
            rest = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);
        } catch {
            return undefined;
        }
        const key = `${keyPrefix}${rest}`;
        try {
            this.fileFor(key);
        } catch {
            return undefined;
        }
        return key;
    }

    async copy(fromKey: string, toKey: string): Promise<void> {
        const to = this.fileFor(toKey);
        await fs.mkdir(dirname(to), { recursive: true });
        await fs.copyFile(this.fileFor(fromKey), to, fsConstants.COPYFILE_EXCL);
        await fs.access(to);
    }

    async delete(key: string): Promise<void> {
        try {
            await fs.unlink(this.fileFor(key));
        } catch (error) {
            // Like S3, deleting something that is already gone is not an error.
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
    }

    /**
     * Public files need no signing (their URL is the link). A private file gets a short-lived link to the download
     * route: key + expiry + HMAC, so it works in a plain <a href> (no auth header) and stops working after `expiresIn`.
     */
    async signedReadUrl(url: string, expiresInSeconds: number): Promise<string> {
        const key = this.keyFromStoredUrl(url);
        if (!key || !key.startsWith(PRIVATE_KEY_PREFIX)) return url;
        const exp = String(Math.floor(Date.now() / 1000) + expiresInSeconds);
        const query = new URLSearchParams({ key, exp, sig: this.sign(key, exp) });
        return `${this.apiBaseUrl}${LOCAL_DOWNLOAD_PATH}?${query.toString()}`;
    }

    /** The file behind a valid, unexpired download link; undefined for anything else (never says why). */
    verifyDownload(params: Partial<DownloadParams>, nowSeconds = Math.floor(Date.now() / 1000)): { key: string; path: string } | undefined {
        const { key, exp, sig } = params;
        if (typeof key !== 'string' || typeof exp !== 'string' || typeof sig !== 'string') return undefined;
        if (!/^\d{1,12}$/.test(exp) || Number(exp) < nowSeconds) return undefined;
        const expected = Buffer.from(this.sign(key, exp), 'hex');
        const given = /^[0-9a-f]{64}$/i.test(sig) ? Buffer.from(sig, 'hex') : undefined;
        if (!given || given.length !== expected.length || !timingSafeEqual(given, expected)) return undefined;
        if (!key.startsWith(PRIVATE_KEY_PREFIX)) return undefined;
        try {
            return { key, path: this.fileFor(key) };
        } catch {
            return undefined;
        }
    }

    private sign(key: string, exp: string): string {
        const secret = customEnv.JWT_SECRET;
        if (secret.trim() === '') {
            throw new InternalServerErrorException('JWT_SECRET is required to sign download links for local file storage.');
        }
        // A key derived from JWT_SECRET for this purpose only, so a download signature is never a valid anything else.
        const signingKey = createHmac('sha256', secret).update(DOWNLOAD_KEY_CONTEXT).digest();
        return createHmac('sha256', signingKey).update(`${key}\n${exp}`).digest('hex');
    }

    /** Creates the folders and proves they are writable. Call once at startup so a bad volume fails at boot, not on the first upload. */
    async assertReady(): Promise<void> {
        const probeDir = this.fileFor(UPLOAD_KEY_PREFIX.replace(/\/$/, ''), { directory: true });
        await fs.mkdir(probeDir, { recursive: true });
        await fs.mkdir(this.fileFor(PRIVATE_KEY_PREFIX.replace(/\/$/, ''), { directory: true }), { recursive: true });
        const probe = join(probeDir, `.write-test-${process.pid}`);
        try {
            await fs.writeFile(probe, 'ok', { flag: 'w' });
            await fs.unlink(probe);
        } catch (error) {
            throw new Error(`Local file storage is not writable at ${this.root}: ${(error as Error).message}`);
        }
    }
}
