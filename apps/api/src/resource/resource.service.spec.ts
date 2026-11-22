import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { S3Client } from '@aws-sdk/client-s3';
import { InternalServerErrorException } from '@nestjs/common';
import { customEnv } from '@/config/custom-env';
import { ResourceService } from './resource.service';

const sent: Array<Record<string, unknown>> = [];
jest.mock('@aws-sdk/client-s3', () => {
    const actual = jest.requireActual('@aws-sdk/client-s3');
    return {
        ...actual,
        S3Client: jest.fn().mockImplementation(() => ({
            send: jest.fn(async (command: { input: Record<string, unknown> }) => {
                sent.push(command.input);
                return {};
            }),
        })),
    };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn(async (_client: unknown, command: { input: { Bucket: string; Key: string } }, options: { expiresIn: number }) =>
        `https://signed.test/${command.input.Bucket}/${command.input.Key}?X-Amz-Expires=${options.expiresIn}`),
}));

const pdf = (name = 'cv.pdf') =>
    ({ originalname: name, mimetype: 'application/pdf', buffer: Buffer.from('%PDF-1.4'), size: 8 }) as Express.Multer.File;

describe('ResourceService.uploadFile ACL handling (MUK-473)', () => {
    const original = { ...customEnv };
    let service: ResourceService;

    beforeEach(() => {
        sent.length = 0;
        customEnv.S3_BUCKET_NAME = 'my-bucket';
        customEnv.S3_BUCKET_REGION = 'eu-west-1';
        customEnv.S3_BUCKET_ACCESS_KEY_ID = 'AKIATEST';
        customEnv.S3_BUCKET_SECRET_ACCESS_KEY = 'secret-for-test';
        customEnv.S3_OBJECT_ACL = '';
        customEnv.S3_ENDPOINT = '';
        customEnv.S3_FORCE_PATH_STYLE = '';
        customEnv.S3_PUBLIC_BASE_URL = '';
        (S3Client as unknown as jest.Mock).mockClear();
        service = new ResourceService();
    });

    afterAll(() => Object.assign(customEnv, original));

    it('keeps the historical default: uploads are public-read', async () => {
        await service.uploadFile(pdf());
        expect(sent[0].ACL).toBe('public-read');
    });

    it('honours S3_OBJECT_ACL=private', async () => {
        customEnv.S3_OBJECT_ACL = 'private';
        await service.uploadFile(pdf());
        expect(sent[0].ACL).toBe('private');
    });

    it('S3_OBJECT_ACL=none sends NO ACL key at all (so Bucket-owner-enforced buckets and R2/MinIO accept the upload)', async () => {
        customEnv.S3_OBJECT_ACL = 'none';
        await service.uploadFile(pdf());
        expect(sent).toHaveLength(1);
        expect(sent[0]).not.toHaveProperty('ACL');
    });

    it('a per-upload ACL overrides the environment default', async () => {
        customEnv.S3_OBJECT_ACL = 'public-read';
        await service.uploadFile(pdf(), { acl: 'private' });
        expect(sent[0].ACL).toBe('private');
        await service.uploadFile(pdf(), { acl: 'none' });
        expect(sent[1]).not.toHaveProperty('ACL');
    });

    it('fails loudly on an invalid S3_OBJECT_ACL and uploads nothing', async () => {
        customEnv.S3_OBJECT_ACL = 'world-writable';
        await expect(service.uploadFile(pdf())).rejects.toThrow(/S3_OBJECT_ACL must be one of/);
        expect(sent).toHaveLength(0);
    });

    it('sends the right bucket, content type and a dated key, and returns the object URL', async () => {
        const url = await service.uploadFile(pdf('Résumé 1.pdf'));
        expect(sent[0]).toMatchObject({ Bucket: 'my-bucket', ContentType: 'application/pdf' });
        expect(String(sent[0].Key)).toMatch(/^nest-next-starter\/uploads\/\d{4}-\d{2}-\d{2}\//);
        // Key segments are percent-encoded in the returned URL ("Résumé" -> "R%C3%A9sum%C3%A9").
        const encoded = String(sent[0].Key).split('/').map(encodeURIComponent).join('/');
        expect(url).toBe(`https://my-bucket.s3.amazonaws.com/${encoded}`);
    });

    describe('S3-compatible stores (R2, MinIO)', () => {
        const clientConfig = () => (S3Client as unknown as jest.Mock).mock.calls[0][0] as Record<string, unknown>;

        it('uses plain AWS settings by default (no endpoint, no path-style)', async () => {
            await service.uploadFile(pdf());
            expect(clientConfig()).not.toHaveProperty('endpoint');
            expect(clientConfig()).not.toHaveProperty('forcePathStyle');
        });

        it('passes a custom endpoint and path-style addressing to the client', async () => {
            customEnv.S3_ENDPOINT = 'http://minio:9000';
            customEnv.S3_FORCE_PATH_STYLE = 'TRUE';
            await service.uploadFile(pdf());
            expect(clientConfig()).toMatchObject({ endpoint: 'http://minio:9000', forcePathStyle: true });
        });

        it('uses the same trimmed endpoint that startup validation accepted', async () => {
            customEnv.S3_ENDPOINT = '  https://acct.r2.cloudflarestorage.com  ';
            customEnv.S3_FORCE_PATH_STYLE = ' true ';
            await service.uploadFile(pdf());
            expect(clientConfig()).toMatchObject({ endpoint: 'https://acct.r2.cloudflarestorage.com', forcePathStyle: true });
        });

        it('treats a whitespace-only endpoint as unset', async () => {
            customEnv.S3_ENDPOINT = '   ';
            await service.uploadFile(pdf());
            expect(clientConfig()).not.toHaveProperty('endpoint');
        });

        it('builds the returned link from S3_PUBLIC_BASE_URL (trailing slashes ignored)', async () => {
            customEnv.S3_PUBLIC_BASE_URL = 'https://cdn.example.com//';
            const url = await service.uploadFile(pdf());
            expect(url).toBe(`https://cdn.example.com/${sent[0].Key}`);
        });

        it('ignores an unsafe S3_PUBLIC_BASE_URL and falls back to the AWS URL', async () => {
            customEnv.S3_PUBLIC_BASE_URL = 'javascript:alert(1)';
            const url = await service.uploadFile(pdf());
            expect(url).toBe(`https://my-bucket.s3.amazonaws.com/${sent[0].Key}`);
        });
    });

    it('still reports a clear error when S3 is not configured', async () => {
        customEnv.S3_BUCKET_REGION = '';
        await expect(service.uploadFile(pdf())).rejects.toThrow(InternalServerErrorException);
    });
});

describe('ResourceService signed read URLs (MUK-482)', () => {
    const original = { ...customEnv };
    const KEY = 'nest-next-starter/uploads/2026-11-10/abc-cv.pdf';
    let service: ResourceService;

    beforeEach(() => {
        customEnv.S3_BUCKET_NAME = 'my-bucket';
        customEnv.S3_BUCKET_REGION = 'eu-west-1';
        customEnv.S3_BUCKET_ACCESS_KEY_ID = 'AKIATEST';
        customEnv.S3_BUCKET_SECRET_ACCESS_KEY = 'secret-for-test';
        customEnv.S3_ENDPOINT = '';
        customEnv.S3_PUBLIC_BASE_URL = '';
        service = new ResourceService();
    });

    afterAll(() => Object.assign(customEnv, original));

    describe('private uploads', () => {
        it("stores 'private' files under the private prefix with NO ACL, even when S3_OBJECT_ACL is public-read", async () => {
            customEnv.S3_OBJECT_ACL = 'public-read';
            sent.length = 0;
            const url = await service.uploadFile(pdf('resume.pdf'), { visibility: 'private' });
            expect(sent[0].Key).toEqual(expect.stringMatching(/^nest-next-starter\/private\/\d{4}-\d{2}-\d{2}\//));
            expect(sent[0]).not.toHaveProperty('ACL');
            expect(service.keyFromStoredUrl(url)).toBe(sent[0].Key);
            expect(await service.signedReadUrl(url)).toContain(`/my-bucket/${sent[0].Key}?`);
        });

        it('public uploads are unchanged: uploads prefix and the configured ACL', async () => {
            customEnv.S3_OBJECT_ACL = 'public-read';
            sent.length = 0;
            await service.uploadFile(pdf());
            expect(sent[0].Key).toEqual(expect.stringContaining('nest-next-starter/uploads/'));
            expect(sent[0].ACL).toBe('public-read');
        });
    });

    describe('awkward file names (applicants choose them)', () => {
        const names = ['CV #2.pdf', 'cv?.pdf', '100%.pdf', '%41.pdf', 'a&b=c.pdf', 'سيرة ذاتية.pdf', '../../etc/passwd.pdf', 'dir\\evil.pdf', '...pdf', 'x'.repeat(300) + '.pdf', '𝒜'.repeat(150) + '.pdf', 'a' + '𝒜'.repeat(60) + 'b.pdf', ''];

        it.each(names)('round-trips %j: the key is URL-safe and the signer recovers exactly the uploaded key', async (name) => {
            sent.length = 0;
            const url = await service.uploadFile(pdf(name), { visibility: 'private' });
            const key = sent[0].Key as string;
            expect(key).toMatch(/^nest-next-starter\/private\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}-[^/#?%&=\s]+$/u);
            expect(key.split('/')).not.toContain('..');
            expect(service.keyFromStoredUrl(url)).toBe(key);
            expect(await service.signedReadUrl(url)).toContain(`/my-bucket/${key}?`);
        });

        it('keeps ordinary and Arabic names readable and the extension intact', async () => {
            sent.length = 0;
            await service.uploadFile(pdf('My CV (final).pdf'));
            expect(sent[0].Key).toMatch(/-My_CV_final_\.pdf$/);
            sent.length = 0;
            await service.uploadFile(pdf('سيرة.pdf'));
            expect(sent[0].Key).toMatch(/-سيرة\.pdf$/u);
        });
    });

    describe('stored URL length', () => {
        it('stays far below the VARCHAR(500) column even for a very long Arabic file name (6 characters per letter once encoded)', async () => {
            sent.length = 0;
            const url = await service.uploadFile(pdf('س'.repeat(400) + '.pdf'), { visibility: 'private' });
            expect(url.length).toBeLessThan(300);
            expect(url.endsWith('.pdf')).toBe(true);
            expect(service.keyFromStoredUrl(url)).toBe(sent[0].Key);
        });

        it('urlForKey encodes each segment and honours S3_PUBLIC_BASE_URL', () => {
            expect(service.urlForKey('nest-next-starter/private/d/a b.pdf')).toBe('https://my-bucket.s3.amazonaws.com/nest-next-starter/private/d/a%20b.pdf');
            customEnv.S3_PUBLIC_BASE_URL = 'https://cdn.example.com/';
            expect(service.urlForKey('nest-next-starter/uploads/d/x.pdf')).toBe('https://cdn.example.com/nest-next-starter/uploads/d/x.pdf');
        });
    });

    describe('keyFromStoredUrl', () => {
        it('recognises the AWS virtual-hosted URL uploadFile returns', () => {
            expect(service.keyFromStoredUrl(`https://my-bucket.s3.amazonaws.com/${KEY}`)).toBe(KEY);
        });

        it('recognises S3_PUBLIC_BASE_URL links (trailing slash ignored) and path-style endpoint links', () => {
            customEnv.S3_PUBLIC_BASE_URL = 'https://cdn.example.com/';
            expect(service.keyFromStoredUrl(`https://cdn.example.com/${KEY}`)).toBe(KEY);
            customEnv.S3_ENDPOINT = 'http://minio.local:9000/';
            expect(service.keyFromStoredUrl(`http://minio.local:9000/my-bucket/${KEY}`)).toBe(KEY);
        });

        it('ignores any query string or fragment and decodes the key', () => {
            expect(service.keyFromStoredUrl(`https://my-bucket.s3.amazonaws.com/${KEY}?x=1#y`)).toBe(KEY);
            expect(service.keyFromStoredUrl('https://my-bucket.s3.amazonaws.com/nest-next-starter/uploads/d/a%20b.pdf')).toBe(
                'nest-next-starter/uploads/d/a b.pdf',
            );
        });

        it('refuses URLs that are not ours: other hosts, other buckets, keys outside the upload prefix, traversal, junk', () => {
            expect(service.keyFromStoredUrl(`https://evil.example.com/${KEY}`)).toBeUndefined();
            expect(service.keyFromStoredUrl(`https://other-bucket.s3.amazonaws.com/${KEY}`)).toBeUndefined();
            expect(service.keyFromStoredUrl('https://my-bucket.s3.amazonaws.com/private/payroll.xlsx')).toBeUndefined();
            expect(service.keyFromStoredUrl(`https://my-bucket.s3.amazonaws.com/${KEY}/../../secret`)).toBeUndefined();
            expect(service.keyFromStoredUrl('https://my-bucket.s3.amazonaws.com/nest-next-starter/uploads/%E0%A4%A')).toBeUndefined();
            expect(service.keyFromStoredUrl('not a url')).toBeUndefined();
        });
    });

    describe('signedReadUrl', () => {
        it('signs a GET for the stored object with the default 15 minute lifetime', async () => {
            const url = await service.signedReadUrl(`https://my-bucket.s3.amazonaws.com/${KEY}`);
            expect(url).toBe(`https://signed.test/my-bucket/${KEY}?X-Amz-Expires=900`);
        });

        it('accepts a custom lifetime and returns foreign URLs untouched (never signs what it does not own)', async () => {
            expect(await service.signedReadUrl(`https://my-bucket.s3.amazonaws.com/${KEY}`, 60)).toContain('X-Amz-Expires=60');
            expect(await service.signedReadUrl('https://evil.example.com/x.pdf')).toBe('https://evil.example.com/x.pdf');
        });

        it('signedReadUrlOrOriginal falls back to the stored URL when S3 is not configured instead of throwing', async () => {
            customEnv.S3_BUCKET_REGION = '';
            const stored = `https://my-bucket.s3.amazonaws.com/${KEY}`;
            await expect(service.signedReadUrl(stored)).rejects.toThrow(InternalServerErrorException);
            await expect(service.signedReadUrlOrOriginal(stored)).resolves.toBe(stored);
        });
    });
});

describe('ResourceService with local disk storage', () => {
    const original = { ...customEnv };
    let dir: string;
    let service: ResourceService;

    beforeEach(async () => {
        sent.length = 0;
        dir = await fs.mkdtemp(join(tmpdir(), 'resource-local-'));
        Object.assign(customEnv, {
            STORAGE_DRIVER: '',
            S3_BUCKET_NAME: '',
            S3_BUCKET_REGION: '',
            UPLOADS_DIR: dir,
            API_PUBLIC_URL: 'https://api.example.com',
            JWT_SECRET: 'a-test-secret-that-is-long-enough-123456',
        });
        service = new ResourceService();
    });

    afterEach(async () => {
        Object.assign(customEnv, original);
        await fs.rm(dir, { recursive: true, force: true });
    });

    it('with no S3 bucket configured, an upload lands on disk and returns an /uploads URL (nothing goes to S3)', async () => {
        const url = await service.uploadFile(pdf('brochure.pdf'));
        expect(url).toMatch(/^https:\/\/api\.example\.com\/uploads\/\d{4}-\d{2}-\d{2}\/.+brochure\.pdf$/);
        const key = service.keyFromStoredUrl(url) as string;
        expect((await fs.readFile(join(dir, ...key.split('/')))).toString()).toBe('%PDF-1.4');
        expect(sent).toHaveLength(0);
    });

    it("a private upload (résumé) goes to the private folder, and the admin link is a signed download link", async () => {
        const url = await service.uploadFile(pdf('resume.pdf'), { visibility: 'private' });
        expect(url).toContain('/private-files/');
        const key = service.keyFromStoredUrl(url) as string;
        expect(key.startsWith('nest-next-starter/private/')).toBe(true);
        const link = await service.signedReadUrl(url);
        expect(link).toContain('/api/files/download?');
        expect(link).toContain('sig=');
    });

    it('images are still compressed to webp on local disk', async () => {
        const sharp = (await import('sharp')).default;
        const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#c2410c' } }).png().toBuffer();
        const url = await service.uploadFile({ originalname: 'logo.png', mimetype: 'image/png', buffer: png, size: png.length } as Express.Multer.File);
        expect(url.endsWith('.webp')).toBe(true);
    });

    it('STORAGE_DRIVER=s3 uses S3 even when a bucket is not auto-detected, and a bucket auto-selects S3', async () => {
        customEnv.S3_BUCKET_NAME = 'my-bucket';
        customEnv.S3_BUCKET_REGION = 'eu-west-1';
        expect(service.driver.name).toBe('s3');
        customEnv.S3_BUCKET_NAME = '';
        customEnv.STORAGE_DRIVER = 's3';
        expect(service.driver.name).toBe('s3');
        customEnv.STORAGE_DRIVER = 'local';
        expect(service.driver.name).toBe('local');
    });
});
