import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { PublicFormGuard } from './public-form.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { customEnv } from '@/config/custom-env';

describe('PublicFormGuard', () => {
    let guard: PublicFormGuard;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            section: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
        };
        guard = new PublicFormGuard(mockPrisma as PrismaService);
    });

    const createMockContext = (body: any): ExecutionContext => ({
        switchToHttp: () => ({
            getRequest: () => ({ body, ip: '127.0.0.1' }),
        }),
    } as unknown as ExecutionContext);

    it('allows valid submission when honeypot is empty and fill time is >= 3 seconds', async () => {
        const ctx = createMockContext({
            consent: true,
            website: '',
            startedAt: Date.now() - 4000,
        });

        const result = await guard.canActivate(ctx);
        expect(result).toBe(true);
    });

    it('short-circuits with 201 when honeypot website field is filled', async () => {
        const ctx = createMockContext({
            consent: true,
            website: 'https://spam-bot.com',
            startedAt: Date.now() - 4000,
        });

        await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
        try {
            await guard.canActivate(ctx);
        } catch (err: any) {
            expect(err.getStatus()).toBe(HttpStatus.CREATED);
            expect(err.getResponse()).toEqual({ success: true });
        }
    });

    it('short-circuits with 201 when fill time is less than 3 seconds', async () => {
        const ctx = createMockContext({
            consent: true,
            website: '',
            startedAt: Date.now() - 1000, // 1 second
        });

        await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
        try {
            await guard.canActivate(ctx);
        } catch (err: any) {
            expect(err.getStatus()).toBe(HttpStatus.CREATED);
            expect(err.getResponse()).toEqual({ success: true });
        }
    });

    it('short-circuits with 201 when startedAt is in the future', async () => {
        const ctx = createMockContext({
            consent: true,
            website: '',
            startedAt: Date.now() + 100000,
        });

        await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
    });

    it('checks turnstile token when spam-settings enabled', async () => {
        customEnv.TURNSTILE_SECRET = 'secret-key';
        process.env.TURNSTILE_SECRET = 'secret-key';
        mockPrisma.section.findUnique.mockResolvedValue({
            data: { enabled: true, siteKey: 'turnstile-site-key' },
        });

        // Mock fetch for Cloudflare verification
        const originalFetch = global.fetch;
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: false }),
        } as any);

        const ctx = createMockContext({
            consent: true,
            website: '',
            startedAt: Date.now() - 5000,
            turnstileToken: 'invalid-token',
        });

        try {
            await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
        } finally {
            global.fetch = originalFetch;
        }
    });
});
