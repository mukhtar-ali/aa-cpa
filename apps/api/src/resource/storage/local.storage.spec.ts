import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { customEnv } from '@/config/custom-env';
import { LocalStorage, LOCAL_DOWNLOAD_PATH } from './local.storage';
import { PRIVATE_KEY_PREFIX, UPLOAD_KEY_PREFIX } from './storage-keys';

const PUBLIC_KEY = `${UPLOAD_KEY_PREFIX}2026-11-12/abc-photo.webp`;
const PRIVATE_KEY = `${PRIVATE_KEY_PREFIX}2026-11-12/abc-cv.pdf`;
const opts = { contentType: 'application/pdf', isPrivate: false };

describe('LocalStorage', () => {
    const original = { ...customEnv };
    let dir: string;
    let storage: LocalStorage;

    beforeEach(async () => {
        dir = await fs.mkdtemp(join(tmpdir(), 'local-storage-'));
        customEnv.UPLOADS_DIR = dir;
        customEnv.API_PUBLIC_URL = 'https://api.example.com/';
        customEnv.JWT_SECRET = 'a-test-secret-that-is-long-enough-123456';
        storage = new LocalStorage();
    });

    afterEach(async () => {
        Object.assign(customEnv, original);
        await fs.rm(dir, { recursive: true, force: true });
    });

    describe('writing and reading back', () => {
        it('writes the file under the root at its key and never overwrites an existing one', async () => {
            await storage.put(PUBLIC_KEY, Buffer.from('one'), opts);
            expect(await fs.readFile(join(dir, ...PUBLIC_KEY.split('/')), 'utf8')).toBe('one');
            await expect(storage.put(PUBLIC_KEY, Buffer.from('two'), opts)).rejects.toThrow();
            expect(await fs.readFile(join(dir, ...PUBLIC_KEY.split('/')), 'utf8')).toBe('one');
        });

        it('copies (and refuses to overwrite) and deletes; deleting a missing file is not an error', async () => {
            await storage.put(PUBLIC_KEY, Buffer.from('data'), opts);
            await storage.copy(PUBLIC_KEY, PRIVATE_KEY);
            expect(await fs.readFile(join(dir, ...PRIVATE_KEY.split('/')), 'utf8')).toBe('data');
            await expect(storage.copy(PUBLIC_KEY, PRIVATE_KEY)).rejects.toThrow();
            await storage.delete(PUBLIC_KEY);
            await expect(storage.delete(PUBLIC_KEY)).resolves.toBeUndefined();
        });
    });

    describe('stored URLs', () => {
        it('public files get an absolute /uploads URL built from API_PUBLIC_URL (trailing slash ignored)', () => {
            expect(storage.urlForKey(PUBLIC_KEY)).toBe('https://api.example.com/uploads/2026-11-12/abc-photo.webp');
        });

        it('private files are addressed under /private-files, which is not the public /uploads route', () => {
            const url = storage.urlForKey(PRIVATE_KEY);
            expect(url).toBe('https://api.example.com/private-files/2026-11-12/abc-cv.pdf');
            expect(url).not.toContain('/uploads/');
        });

        it('round-trips keys, including percent-encoded Arabic names', () => {
            const key = `${UPLOAD_KEY_PREFIX}2026-11-12/abc-سيرة_ذاتية.pdf`;
            expect(storage.keyFromStoredUrl(storage.urlForKey(key))).toBe(key);
            expect(storage.keyFromStoredUrl(storage.urlForKey(PRIVATE_KEY))).toBe(PRIVATE_KEY);
        });

        it('defaults the base to http://localhost:<APP_PORT> when API_PUBLIC_URL is unset', () => {
            customEnv.API_PUBLIC_URL = '';
            expect(storage.urlForKey(PUBLIC_KEY)).toBe(`http://localhost:${customEnv.APP_PORT}/uploads/2026-11-12/abc-photo.webp`);
        });

        it.each([
            ['another host', 'https://evil.example.com/uploads/2026-11-12/a.webp'],
            ['an unrelated path', 'https://api.example.com/api/users'],
            ['a traversal', 'https://api.example.com/uploads/../../etc/passwd'],
            ['an encoded traversal', 'https://api.example.com/uploads/%2e%2e/%2e%2e/secret'],
            ['a backslash', 'https://api.example.com/uploads/..%5C..%5Cx'],
            ['a NUL byte', 'https://api.example.com/uploads/a%00.webp'],
            ['an empty segment', 'https://api.example.com/uploads/2026-11-12//a.webp'],
            ['a malformed escape', 'https://api.example.com/uploads/%E0%A4%A'],
        ])('refuses %s', (_label, url) => {
            expect(storage.keyFromStoredUrl(url)).toBeUndefined();
        });
    });

    describe('path safety', () => {
        it.each([
            ['outside our prefixes', 'etc/passwd'],
            ['a traversal inside a prefix', `${UPLOAD_KEY_PREFIX}../../escape.txt`],
            ['a sibling of the prefix', 'nest-next-starter/other/file.txt'],
        ])('put refuses a key %s and writes nothing', async (_label, key) => {
            await expect(storage.put(key, Buffer.from('x'), opts)).rejects.toThrow('Invalid storage key');
            await expect(fs.readdir(dir)).resolves.toEqual([]);
        });
    });

    describe('signed private downloads', () => {
        const NOW = 1_800_000_000;
        const link = async (url: string) => Object.fromEntries(new URL(url).searchParams) as { key: string; exp: string; sig: string };

        it('public files need no signing: the same URL comes back', async () => {
            const url = storage.urlForKey(PUBLIC_KEY);
            await expect(storage.signedReadUrl(url, 900)).resolves.toBe(url);
        });

        it('URLs that are not ours are returned untouched', async () => {
            await expect(storage.signedReadUrl('https://elsewhere.example.com/cv.pdf', 900)).resolves.toBe('https://elsewhere.example.com/cv.pdf');
        });

        it('a private file gets a link to the download route with key, expiry and signature', async () => {
            const url = await storage.signedReadUrl(storage.urlForKey(PRIVATE_KEY), 900);
            expect(url.startsWith(`https://api.example.com${LOCAL_DOWNLOAD_PATH}?`)).toBe(true);
            const params = await link(url);
            expect(params.key).toBe(PRIVATE_KEY);
            expect(params.sig).toMatch(/^[0-9a-f]{64}$/);
        });

        it('verifies a fresh link and resolves the file path inside the root', async () => {
            const params = await link(await storage.signedReadUrl(storage.urlForKey(PRIVATE_KEY), 900));
            const found = storage.verifyDownload(params);
            expect(found?.key).toBe(PRIVATE_KEY);
            expect(found?.path).toBe(join(dir, ...PRIVATE_KEY.split('/')));
        });

        it('rejects an expired link', async () => {
            const params = await link(await storage.signedReadUrl(storage.urlForKey(PRIVATE_KEY), 900));
            expect(storage.verifyDownload(params, Number(params.exp) + 1)).toBeUndefined();
            expect(storage.verifyDownload(params, Number(params.exp))).toBeDefined();
        });

        it('rejects a tampered key, expiry or signature', async () => {
            const params = await link(await storage.signedReadUrl(storage.urlForKey(PRIVATE_KEY), 900));
            expect(storage.verifyDownload({ ...params, key: `${PRIVATE_KEY}x` })).toBeUndefined();
            expect(storage.verifyDownload({ ...params, exp: String(Number(params.exp) + 3600) })).toBeUndefined();
            expect(storage.verifyDownload({ ...params, sig: params.sig.replace(/^./, (c) => (c === 'a' ? 'b' : 'a')) })).toBeUndefined();
            expect(storage.verifyDownload({ ...params, sig: 'not-hex' })).toBeUndefined();
            expect(storage.verifyDownload({ ...params, sig: undefined })).toBeUndefined();
        });

        it('a link signed under another JWT_SECRET no longer works', async () => {
            const params = await link(await storage.signedReadUrl(storage.urlForKey(PRIVATE_KEY), 900));
            customEnv.JWT_SECRET = 'a-different-secret-that-is-long-enough-99';
            expect(storage.verifyDownload(params)).toBeUndefined();
        });

        it('never validates a link for a PUBLIC key, even with a correct-looking signature (the route is for private files)', async () => {
            const exp = String(NOW + 900);
            const forged = { key: PUBLIC_KEY, exp, sig: 'a'.repeat(64) };
            expect(storage.verifyDownload(forged, NOW)).toBeUndefined();
        });

        it('refuses to sign without a JWT_SECRET instead of using an empty key', async () => {
            customEnv.JWT_SECRET = '';
            await expect(storage.signedReadUrl(storage.urlForKey(PRIVATE_KEY), 900)).rejects.toThrow('JWT_SECRET');
        });
    });

    describe('assertReady', () => {
        it('creates the public and private folders and leaves no probe file behind', async () => {
            await storage.assertReady();
            expect(await fs.readdir(storage.publicDir)).toEqual([]);
            expect(await fs.readdir(join(dir, 'nest-next-starter'))).toEqual(expect.arrayContaining(['uploads', 'private']));
        });

        it('fails with a clear message when the root cannot be used', async () => {
            const blocker = join(dir, 'file-not-folder');
            await fs.writeFile(blocker, 'x');
            customEnv.UPLOADS_DIR = blocker;
            await expect(new LocalStorage().assertReady()).rejects.toThrow();
        });

        it('exposes only the public folder, never the private one', () => {
            expect(storage.publicDir).toBe(join(dir, 'nest-next-starter', 'uploads'));
        });
    });
});
