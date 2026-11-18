import { decryptSecret, encryptSecret, isEncryptedSecret, SMTP_PASS_PURPOSE } from '@/common/secret-box';
import { customEnv } from '@/config/custom-env';
import { SectionService } from './section.service';

const ROOT = '9f8e7d6c5b4a39281726354453627180a1b2c3d4';

describe('SectionService legacy SMTP password upgrade', () => {
    const originalSecret = customEnv.JWT_SECRET;
    let prisma: { section: { findUnique: jest.Mock; update: jest.Mock; upsert: jest.Mock } };
    let service: SectionService;

    beforeEach(() => {
        customEnv.JWT_SECRET = ROOT;
        prisma = { section: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}), upsert: jest.fn() } };
        service = new SectionService(prisma as never);
    });

    afterAll(() => {
        customEnv.JWT_SECRET = originalSecret;
    });

    it('encrypts a legacy plaintext password in place and keeps the other settings', async () => {
        prisma.section.findUnique.mockResolvedValue({ data: { smtpHost: 'smtp.example.com', smtpPass: 'legacy-pass' } });

        await expect(service.encryptLegacySmtpPassword()).resolves.toBe(true);

        const arg = prisma.section.update.mock.calls[0][0];
        expect(arg.where).toEqual({ type: 'email-settings' });
        expect(arg.data.data.smtpHost).toBe('smtp.example.com');
        expect(isEncryptedSecret(arg.data.data.smtpPass)).toBe(true);
        expect(JSON.stringify(arg)).not.toContain('legacy-pass');
        expect(decryptSecret(arg.data.data.smtpPass, ROOT, SMTP_PASS_PURPOSE)).toBe('legacy-pass');
    });

    it.each([
        ['already encrypted', { smtpPass: encryptSecret('x', ROOT, SMTP_PASS_PURPOSE) }],
        ['empty', { smtpPass: '' }],
        ['missing', { smtpHost: 'h' }],
    ])('leaves a %s password alone', async (_label, data) => {
        prisma.section.findUnique.mockResolvedValue({ data });
        await expect(service.encryptLegacySmtpPassword()).resolves.toBe(false);
        expect(prisma.section.update).not.toHaveBeenCalled();
    });

    it('does nothing when there is no email-settings section', async () => {
        prisma.section.findUnique.mockResolvedValue(null);
        await expect(service.encryptLegacySmtpPassword()).resolves.toBe(false);
        expect(prisma.section.update).not.toHaveBeenCalled();
    });

    it('does not encrypt (and does not throw) when JWT_SECRET is empty', async () => {
        customEnv.JWT_SECRET = '';
        prisma.section.findUnique.mockResolvedValue({ data: { smtpPass: 'legacy-pass' } });
        await expect(service.encryptLegacySmtpPassword()).resolves.toBe(false);
        expect(prisma.section.update).not.toHaveBeenCalled();
    });

    it('never blocks application startup when the upgrade fails', async () => {
        prisma.section.findUnique.mockRejectedValue(new Error('db down'));
        await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
    });
});
