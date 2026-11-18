import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import { basename, extname } from 'node:path';
import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { resolveStorageDriverName } from './storage/storage-config';
import { customEnv } from '@/config/custom-env';
import { LOCAL_DOWNLOAD_PATH, LocalStorage } from './storage/local.storage';

const CONTENT_TYPES: Record<string, string> = { '.pdf': 'application/pdf' };

/**
 * Download link for private files (applicants' résumés) when files live on local disk. It is deliberately NOT behind a
 * login: like an S3 presigned URL, the link itself (key + expiry + HMAC from LocalStorage.signedReadUrl) is the
 * authorisation, so the admin can open it from a plain link. Every failure is the same 404.
 */
@Controller()
export class LocalFilesController {
    private readonly storage = new LocalStorage();

    @Throttle({ default: { limit: 60, ttl: 15 * 60 * 1000 } })
    @Get(LOCAL_DOWNLOAD_PATH)
    async download(@Query() query: Record<string, string>, @Res() res: Response): Promise<void> {
        if (resolveStorageDriverName(customEnv) !== 'local') throw new NotFoundException();
        const found = this.storage.verifyDownload({ key: query.key, exp: query.exp, sig: query.sig });
        if (!found) throw new NotFoundException();
        try {
            await fs.access(found.path);
        } catch {
            throw new NotFoundException();
        }

        const name = basename(found.path);
        res.setHeader('Content-Type', CONTENT_TYPES[extname(name).toLowerCase()] ?? 'application/octet-stream');
        // Always a download, never rendered in the browser. The stored name only contains letters, digits . _ -.
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
        res.setHeader('Cache-Control', 'private, no-store');
        createReadStream(found.path).on('error', () => res.destroy()).pipe(res);
    }
}
