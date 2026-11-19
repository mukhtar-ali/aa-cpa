import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { NotFoundException } from '@nestjs/common';
import { customEnv } from '@/config/custom-env';
import { LocalFilesController } from './local-files.controller';
import { LocalStorage } from './storage/local.storage';
import { PRIVATE_KEY_PREFIX } from './storage/storage-keys';

const KEY = `${PRIVATE_KEY_PREFIX}2026-11-12/abc-cv.pdf`;

function fakeResponse() {
    const headers: Record<string, string> = {};
    const chunks: Buffer[] = [];
    const sink = new Writable({
        write(chunk, _enc, done) {
            chunks.push(Buffer.from(chunk));
            done();
        },
    });
    const done = new Promise<void>((resolve) => sink.on('finish', resolve));
    return Object.assign(sink, { setHeader: (k: string, v: string) => void (headers[k] = v), headers, body: () => Buffer.concat(chunks).toString(), done });
}

describe('LocalFilesController', () => {
    const original = { ...customEnv };
    let dir: string;
    let storage: LocalStorage;
    let controller: LocalFilesController;

    beforeEach(async () => {
        dir = await fs.mkdtemp(join(tmpdir(), 'local-files-'));
        Object.assign(customEnv, { UPLOADS_DIR: dir, API_PUBLIC_URL: 'https://api.example.com', JWT_SECRET: 'a-test-secret-that-is-long-enough-123456', STORAGE_DRIVER: '', S3_BUCKET_NAME: '' });
        storage = new LocalStorage();
        controller = new LocalFilesController();
        await storage.put(KEY, Buffer.from('%PDF-1.4 resume'), { contentType: 'application/pdf', isPrivate: true });
    });

    afterEach(async () => {
        Object.assign(customEnv, original);
        await fs.rm(dir, { recursive: true, force: true });
    });

    const signed = async () => Object.fromEntries(new URL(await storage.signedReadUrl(storage.urlForKey(KEY), 900)).searchParams) as Record<string, string>;

    it('streams a private file as an attachment with the right type and no caching', async () => {
        const res = fakeResponse();
        await controller.download(await signed(), res as never);
        await res.done;
        expect(res.body()).toBe('%PDF-1.4 resume');
        expect(res.headers['Content-Type']).toBe('application/pdf');
        expect(res.headers['Content-Disposition']).toBe("attachment; filename*=UTF-8''abc-cv.pdf");
        expect(res.headers['Cache-Control']).toBe('private, no-store');
    });

    it('answers 404 for a bad, tampered or missing token (the same answer every time)', async () => {
        const res = fakeResponse();
        const query = await signed();
        await expect(controller.download({ ...query, sig: 'b'.repeat(64) }, res as never)).rejects.toThrow(NotFoundException);
        await expect(controller.download({}, res as never)).rejects.toThrow(NotFoundException);
    });

    it('answers 404 when the file is gone', async () => {
        const query = await signed();
        await fs.unlink(join(dir, ...KEY.split('/')));
        await expect(controller.download(query, fakeResponse() as never)).rejects.toThrow(NotFoundException);
    });

    it('is a 404 when files are stored on S3 instead', async () => {
        customEnv.STORAGE_DRIVER = 's3';
        await expect(controller.download(await signed(), fakeResponse() as never)).rejects.toThrow(NotFoundException);
    });
});
