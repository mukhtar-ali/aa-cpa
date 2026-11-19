import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import { customEnv } from '@/config/custom-env';

export const MIN_FILL_TIME_MS = 3000;

export interface SpamSettingsData {
    enabled?: boolean;
    siteKey?: string;
}

@Injectable()
export class PublicFormGuard implements CanActivate {
    private readonly logger = new Logger(PublicFormGuard.name);

    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const body = req.body || {};

        // 1. Honeypot check: website field must be empty or missing
        if (body.website && typeof body.website === 'string' && body.website.trim() !== '') {
            this.logger.warn(`Spam honeypot triggered from IP ${req.ip}`);
            throw new HttpException({ success: true }, HttpStatus.CREATED);
        }

        // 2. Minimum fill time check: startedAt must be at least 3 seconds in the past and not in the future
        const now = Date.now();
        const rawStarted = body.startedAt;
        const startedAt =
            typeof rawStarted === 'string' && isNaN(Number(rawStarted))
                ? Date.parse(rawStarted)
                : Number(rawStarted);
        if (!startedAt || isNaN(startedAt) || now - startedAt < MIN_FILL_TIME_MS || startedAt > now + 5000) {
            this.logger.warn(`Spam fill time threshold triggered from IP ${req.ip} (startedAt=${startedAt}, now=${now})`);
            throw new HttpException({ success: true }, HttpStatus.CREATED);
        }
        body.startedAt = Math.floor(startedAt);

        // 3. Optional Cloudflare Turnstile verification via spam-settings section
        try {
            const section = await this.prisma.section.findUnique({
                where: { type: 'spam-settings' },
            });
            const spamSettings = section?.data as SpamSettingsData | null | undefined;
            if (spamSettings?.enabled) {
                const token = body.turnstileToken;
                const secret = customEnv.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET;
                const isValid = await this.verifyTurnstile(token, secret, req.ip);
                if (!isValid) {
                    this.logger.warn(`Turnstile verification failed from IP ${req.ip}`);
                    throw new HttpException({ success: true }, HttpStatus.CREATED);
                }
            }
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            this.logger.warn(`Error checking spam settings: ${(err as Error).message}`);
        }

        return true;
    }

    private async verifyTurnstile(token: unknown, secret?: string, ip?: string): Promise<boolean> {
        if (!token || typeof token !== 'string' || !token.trim() || !secret) {
            return false;
        }
        try {
            const formData = new URLSearchParams({
                secret,
                response: token.trim(),
            });
            if (ip) {
                formData.append('remoteip', ip);
            }

            const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });
            const data = (await response.json()) as { success?: boolean };
            return data?.success === true;
        } catch (err) {
            this.logger.error(`Turnstile verification error: ${(err as Error).message}`);
            return false;
        }
    }
}
