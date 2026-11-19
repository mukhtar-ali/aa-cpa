import nodemailer from 'nodemailer';
import { encryptSecret, SMTP_PASS_PURPOSE } from '@/common/secret-box';
import { customEnv } from '@/config/custom-env';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
    __esModule: true,
    default: { createTransport: jest.fn() },
}));

const ROOT = '9f8e7d6c5b4a39281726354453627180a1b2c3d4';

describe('EmailService SMTP password handling', () => {
    const originalSecret = customEnv.JWT_SECRET;
    const originalEnvPass = customEnv.EMAIL_PASSWORD;
    let sendMail: jest.Mock;
    let prisma: { section: { findUnique: jest.Mock } };
    let service: EmailService;

    const section = (smtpPass: string | undefined) => ({
        data: { smtpHost: 'smtp.example.com', smtpPort: 587, smtpUser: 'mailer', smtpPass, smtpFromEmail: 'a@b.co' },
    });
    const usedPass = () => (nodemailer.createTransport as jest.Mock).mock.calls[0][0].auth?.pass;

    beforeEach(() => {
        customEnv.JWT_SECRET = ROOT;
        customEnv.EMAIL_PASSWORD = 'env-fallback-password';
        sendMail = jest.fn().mockResolvedValue({});
        (nodemailer.createTransport as jest.Mock).mockReset().mockReturnValue({ sendMail });
        prisma = { section: { findUnique: jest.fn() } };
        service = new EmailService(prisma as never);
    });

    afterAll(() => {
        customEnv.JWT_SECRET = originalSecret;
        customEnv.EMAIL_PASSWORD = originalEnvPass;
    });

    it('decrypts the stored password before connecting to the SMTP server', async () => {
        prisma.section.findUnique.mockResolvedValue(section(encryptSecret('real-smtp-password', ROOT, SMTP_PASS_PURPOSE)));
        await service.sendTestEmail('to@example.com');
        expect(usedPass()).toBe('real-smtp-password');
        expect(sendMail).toHaveBeenCalledTimes(1);
    });

    it('still accepts a legacy plaintext password', async () => {
        prisma.section.findUnique.mockResolvedValue(section('legacy-plaintext'));
        await service.sendTestEmail('to@example.com');
        expect(usedPass()).toBe('legacy-plaintext');
    });

    it('falls back to the .env password when the stored one cannot be decrypted (JWT_SECRET rotated)', async () => {
        prisma.section.findUnique.mockResolvedValue(
            section(encryptSecret('real-smtp-password', 'a-different-root-secret-entirely-xxxx', SMTP_PASS_PURPOSE)),
        );
        await service.sendTestEmail('to@example.com');
        expect(usedPass()).toBe('env-fallback-password');
    });

    it('uses the .env password when none is stored', async () => {
        prisma.section.findUnique.mockResolvedValue(section(''));
        await service.sendTestEmail('to@example.com');
        expect(usedPass()).toBe('env-fallback-password');
    });
});
