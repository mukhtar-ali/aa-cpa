import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { decryptSecret, SMTP_PASS_PURPOSE } from '@/common/secret-box';
import { customEnv } from '@/config/custom-env';
import { PrismaService } from '@/prisma/prisma.service';
import * as handlebars from 'handlebars';
import path from 'path';
import * as fs from 'node:fs';

const EMAIL_SETTINGS_SECTION_TYPE = 'email-settings';

interface EmailSettingsData {
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    smtpPass?: string;
    smtpFromEmail?: string;
    smtpFromName?: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * The SMTP password is stored encrypted (see section.controller). Legacy plaintext values still
     * work. If it cannot be decrypted (e.g. JWT_SECRET was rotated) fall back to the .env password and
     * say so, instead of failing every email with an opaque crypto error.
     */
    private readStoredSmtpPass(stored: string | undefined): string {
        if (!stored) return '';
        try {
            return decryptSecret(stored, customEnv.JWT_SECRET, SMTP_PASS_PURPOSE);
        } catch {
            this.logger.error(
                'Could not decrypt the stored SMTP password (was JWT_SECRET rotated?). Re-enter it in Settings > Email.',
            );
            return '';
        }
    }

    /**
     * Builds a transporter from the admin-configured SMTP settings (Section type
     * 'email-settings') when present, falling back to the .env values otherwise. Built
     * fresh per send rather than cached — SMTP connection setup is cheap, and this
     * guarantees a settings change in the admin takes effect immediately.
     */
    private async getTransporter(): Promise<{ transporter: nodemailer.Transporter; from: string }> {
        const section = await this.prisma.section.findUnique({ where: { type: EMAIL_SETTINGS_SECTION_TYPE } });
        const settings = (section?.data as EmailSettingsData | undefined) ?? {};

        const host = settings.smtpHost || customEnv.EMAIL_HOST;
        const port = settings.smtpPort || customEnv.EMAIL_PORT;
        const user = settings.smtpUser || customEnv.EMAIL_USERNAME;
        const pass = this.readStoredSmtpPass(settings.smtpPass) || customEnv.EMAIL_PASSWORD;
        const fromEmail = settings.smtpFromEmail || customEnv.EMAIL_FROM;
        const fromName = settings.smtpFromName;

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: settings.smtpSecure ?? true,
            auth: user ? { user, pass } : undefined,
        });

        return { transporter, from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail };
    }

    private compileTemplate(templateName: string, context: any): string {
        const templateDir = path.resolve(__dirname, '../../public/templates');
        const templatePath = path.join(templateDir, `${templateName}.hbs`);
        if (!fs.existsSync(templatePath)) throw new Error(`Template file not found: ${templatePath}`);
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        return handlebars.compile(templateSource)(context);
    }

    async sendEmail(to: string, subject: string, templateName: string, context: any): Promise<void> {
        const htmlContent = this.compileTemplate(templateName, context);
        const { transporter, from } = await this.getTransporter();
        try {
            await transporter.sendMail({ from, to, subject, html: htmlContent });
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to send email');
            throw error;
        }
    }

    /** Sends a template-free confirmation email — used by the admin's "Send test email" button. */
    async sendTestEmail(to: string): Promise<void> {
        const { transporter, from } = await this.getTransporter();
        await transporter.sendMail({
            from,
            to,
            subject: 'Test email',
            html: '<p>This is a test email from your admin portal\'s SMTP settings. If you received this, your configuration works.</p>',
        });
    }

    /** Template-free notification for a new job application — best-effort, never throws. */
    async sendNewApplicationNotification(
        to: string,
        jobTitle: string,
        applicantName: string,
    ): Promise<void> {
        try {
            const { transporter, from } = await this.getTransporter();
            await transporter.sendMail({
                from,
                to,
                subject: `New application: ${jobTitle}`,
                html: `<p>${applicantName} just applied for <strong>${jobTitle}</strong>. Review it in the admin portal's Careers section.</p>`,
            });
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to send new-application notification');
        }
    }
}
