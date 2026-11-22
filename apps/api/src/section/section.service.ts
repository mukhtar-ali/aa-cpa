import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { encryptSecret, isEncryptedSecret, SMTP_PASS_PURPOSE } from '@/common/secret-box';
import { customEnv } from '@/config/custom-env';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SectionService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SectionService.name);

    constructor(private prisma: PrismaService) {}

    async onApplicationBootstrap() {
        try {
            await this.encryptLegacySmtpPassword();
        } catch (err) {
            // Never block startup; the value keeps working as legacy plaintext and is retried next boot.
            this.logger.error({ err }, 'Could not encrypt the stored SMTP password');
        }
    }

    /**
     * One-time upgrade: before the SMTP password was encrypted at rest it sat in plaintext in the
     * `email-settings` section. Encrypt such a value on startup instead of waiting for an admin to
     * re-save the form. Idempotent: already-encrypted or empty values are left alone.
     */
    async encryptLegacySmtpPassword(): Promise<boolean> {
        const section = await this.prisma.section.findUnique({ where: { type: 'email-settings' } });
        const data = section?.data as Record<string, unknown> | null | undefined;
        const stored = data?.smtpPass;
        if (typeof stored !== 'string' || stored === '' || isEncryptedSecret(stored)) return false;
        if (!customEnv.JWT_SECRET) {
            this.logger.warn('JWT_SECRET is empty; leaving the stored SMTP password unencrypted.');
            return false;
        }
        await this.prisma.section.update({
            where: { type: 'email-settings' },
            data: { data: { ...data, smtpPass: encryptSecret(stored, customEnv.JWT_SECRET, SMTP_PASS_PURPOSE) } },
        });
        this.logger.log('Encrypted the legacy plaintext SMTP password stored in the email settings.');
        return true;
    }

    async getSection(type: string) {
        const section = await this.prisma.section.findUnique({ where: { type } });
        if (!section) throw new NotFoundException(`Section '${type}' not found`);
        return section.data;
    }

    async updateSection(type: string, data: any) {
        return this.prisma.section.upsert({
            where: { type },
            update: { data },
            create: { type, data },
        });
    }
}
