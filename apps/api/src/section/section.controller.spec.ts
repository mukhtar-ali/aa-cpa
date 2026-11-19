import { METHOD_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { BadRequestException, RequestMethod } from '@nestjs/common';
import {
    AboutContentSchema,
    AboutCoreValuesSchema,
    AboutLeadershipSchema,
    AboutMissionVisionSchema,
    AboutPartnersSchema,
    AboutUsHeroSchema,
    ContactUsFormSchema,
    ContactUsHeroSchema,
    EmailSettingsSchema,
    GlobalSeoSettingsSchema,
    HomeAboutTeaserSchema,
    HomeHeroSectionSchema,
    HomeShowcaseSchema,
    WebsiteInfoSectionSchema,
} from '@repo/shared';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { decryptSecret, isEncryptedSecret, SMTP_PASS_PURPOSE } from '@/common/secret-box';
import { customEnv } from '@/config/custom-env';
import { MASKED_SECRET, SectionController } from './section.controller';

const ROOT = '9f8e7d6c5b4a39281726354453627180a1b2c3d4';

// The schema every PUT handler must validate its body with. If a new @Put is added without an
// entry here (or without a CustomZodValidationPipe) the "every PUT is validated" test fails.
const EXPECTED_SCHEMAS: Record<string, unknown> = {
    updateWebsiteInfo: WebsiteInfoSectionSchema,
    updateGlobalSeo: GlobalSeoSettingsSchema,
    updateEmailSettings: EmailSettingsSchema,
    updateAboutHero: AboutUsHeroSchema,
    updateAboutContent: AboutContentSchema,
    updateAboutMissionVision: AboutMissionVisionSchema,
    updateAboutCoreValues: AboutCoreValuesSchema,
    updateAboutLeadership: AboutLeadershipSchema,
    updateAboutPartners: AboutPartnersSchema,
    updateContactHero: ContactUsHeroSchema,
    updateContactFormSection: ContactUsFormSchema,
    updateHomeHero: HomeHeroSectionSchema,
    updateHomeShowcase: HomeShowcaseSchema,
    updateHomeAboutTeaser: HomeAboutTeaserSchema,
};

function bodyPipes(handlerName: string): unknown[] {
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, SectionController, handlerName) as
        | Record<string, { index: number; pipes: unknown[] }>
        | undefined;
    // RouteParamtypes.BODY === 3
    const body = Object.entries(args ?? {}).find(([key]) => key.startsWith('3:'));
    return body ? body[1].pipes : [];
}

describe('SectionController', () => {
    describe('PUT body validation (MUK-468)', () => {
        const putHandlers = Object.getOwnPropertyNames(SectionController.prototype).filter(
            (name) =>
                name !== 'constructor' &&
                Reflect.getMetadata(METHOD_METADATA, (SectionController.prototype as never)[name]) ===
                    RequestMethod.PUT,
        );

        it('finds all 14 PUT handlers', () => {
            expect(putHandlers.sort()).toEqual(Object.keys(EXPECTED_SCHEMAS).sort());
        });

        it.each(Object.entries(EXPECTED_SCHEMAS))('%s validates its body with the matching shared schema', (name, schema) => {
            const pipes = bodyPipes(name);
            const zodPipe = pipes.find((p) => p instanceof CustomZodValidationPipe) as unknown as
                | { schema: unknown }
                | undefined;
            expect(zodPipe).toBeDefined();
            expect(zodPipe!.schema).toBe(schema);
        });
    });

    describe('tracking IDs (stored XSS)', () => {
        const parse = (patch: Record<string, unknown>) => GlobalSeoSettingsSchema.safeParse({ ...patch });

        it.each([
            ['GTM-ABC123', 'googleTagManagerId'],
            ['GTM-5XYZ9K', 'googleTagManagerId'],
            ['G-ABCDEF1234', 'googleAnalyticsId'],
            ['', 'googleTagManagerId'],
            ['', 'googleAnalyticsId'],
        ])('accepts %s for %s', (value, field) => {
            expect(parse({ [field]: value }).success).toBe(true);
        });

        it.each([
            `');alert(1)//`,
            `GTM-ABC');alert(document.cookie);//`,
            `GTM-ABC"><script>alert(1)</script>`,
            `GTM-abc123`,
            `GTM-`,
            `G-`,
            `UA-12345-1`,
            `GTM-ABC 123`,
            `G-ABC\nfetch('//evil')`,
            `javascript:alert(1)`,
        ])('rejects the injection / malformed value %j', (value) => {
            expect(parse({ googleTagManagerId: value }).success).toBe(false);
            expect(parse({ googleAnalyticsId: value }).success).toBe(false);
        });
    });

    describe('email settings: SMTP password encrypted at rest', () => {
        let sectionService: { getSection: jest.Mock; updateSection: jest.Mock };
        let controller: SectionController;
        const originalSecret = customEnv.JWT_SECRET;

        const settings = (smtpPass: string) => ({
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
            smtpSecure: false,
            smtpUser: 'mailer',
            smtpPass,
            smtpFromEmail: 'noreply@example.com',
            smtpFromName: 'Site',
        });

        beforeEach(() => {
            customEnv.JWT_SECRET = ROOT;
            sectionService = {
                getSection: jest.fn().mockResolvedValue({}),
                updateSection: jest.fn().mockResolvedValue({}),
            };
            controller = new SectionController(sectionService as never, { sendTestEmail: jest.fn() } as never, {} as never);
        });

        afterAll(() => {
            customEnv.JWT_SECRET = originalSecret;
        });

        const saved = () => sectionService.updateSection.mock.calls[0][1] as ReturnType<typeof settings>;

        it('encrypts a new password before storing it and never stores the plaintext', async () => {
            await controller.updateEmailSettings(settings('My-Smtp-P@ssw0rd') as never);

            expect(sectionService.updateSection.mock.calls[0][0]).toBe('email-settings');
            expect(isEncryptedSecret(saved().smtpPass)).toBe(true);
            expect(JSON.stringify(sectionService.updateSection.mock.calls[0][1])).not.toContain('My-Smtp-P@ssw0rd');
            expect(decryptSecret(saved().smtpPass, ROOT, SMTP_PASS_PURPOSE)).toBe('My-Smtp-P@ssw0rd');
        });

        it('keeps the stored (already encrypted) password when the masked placeholder is submitted', async () => {
            const stored = (await import('@/common/secret-box')).encryptSecret('old-password', ROOT, SMTP_PASS_PURPOSE);
            sectionService.getSection.mockResolvedValue({ ...settings(stored) });

            await controller.updateEmailSettings(settings(MASKED_SECRET) as never);

            expect(saved().smtpPass).toBe(stored);
        });

        it('treats an omitted smtpPass as "unchanged" instead of wiping the stored password', async () => {
            const stored = (await import('@/common/secret-box')).encryptSecret('old-password', ROOT, SMTP_PASS_PURPOSE);
            sectionService.getSection.mockResolvedValue({ ...settings(stored) });
            const { smtpPass: _omitted, ...withoutPassword } = settings('x');
            void _omitted;

            await controller.updateEmailSettings(withoutPassword as never);

            expect(saved().smtpPass).toBe(stored);
        });

        describe('SMTP connection change requires re-entering the password', () => {
            const encrypted = () =>
                (require('@/common/secret-box') as typeof import('@/common/secret-box')).encryptSecret(
                    'stored-password',
                    ROOT,
                    SMTP_PASS_PURPOSE,
                );

            it.each([
                ['host', { smtpHost: 'attacker.example.net' }],
                ['user', { smtpUser: 'someone-else' }],
                ['port', { smtpPort: 25 }],
                ['security mode', { smtpSecure: true }],
            ])('rejects a changed %s when the password is the masked placeholder', async (_label, change) => {
                sectionService.getSection.mockResolvedValue({ ...settings(encrypted()) });
                await expect(
                    controller.updateEmailSettings({ ...settings(MASKED_SECRET), ...change } as never),
                ).rejects.toThrow(BadRequestException);
                expect(sectionService.updateSection).not.toHaveBeenCalled();
            });

            it('rejects a changed host when smtpPass is omitted', async () => {
                sectionService.getSection.mockResolvedValue({ ...settings(encrypted()) });
                const { smtpPass: _omitted, ...withoutPassword } = settings('x');
                void _omitted;
                await expect(
                    controller.updateEmailSettings({ ...withoutPassword, smtpHost: 'attacker.example.net' } as never),
                ).rejects.toThrow(BadRequestException);
                expect(sectionService.updateSection).not.toHaveBeenCalled();
            });

            it('allows a changed host when a NEW password is typed in', async () => {
                sectionService.getSection.mockResolvedValue({ ...settings(encrypted()) });
                await controller.updateEmailSettings({ ...settings('brand-new-password'), smtpHost: 'smtp.other.com' } as never);
                expect(saved().smtpHost).toBe('smtp.other.com');
                expect(isEncryptedSecret(saved().smtpPass)).toBe(true);
            });

            it('allows the unchanged connection with the masked placeholder (case/whitespace-insensitive host)', async () => {
                const stored = encrypted();
                sectionService.getSection.mockResolvedValue({ ...settings(stored) });
                await controller.updateEmailSettings({ ...settings(MASKED_SECRET), smtpHost: ' SMTP.Example.com ' } as never);
                expect(saved().smtpPass).toBe(stored);
            });

            it('does not block changing the host when no password is stored yet', async () => {
                sectionService.getSection.mockResolvedValue({ ...settings('') });
                await controller.updateEmailSettings({ ...settings(MASKED_SECRET), smtpHost: 'smtp.new.com' } as never);
                expect(saved().smtpHost).toBe('smtp.new.com');
                expect(saved().smtpPass).toBe('');
            });
        });

        it('encrypts a legacy plaintext password when the masked placeholder is submitted', async () => {
            sectionService.getSection.mockResolvedValue({ ...settings('legacy-plaintext') });

            await controller.updateEmailSettings(settings(MASKED_SECRET) as never);

            expect(isEncryptedSecret(saved().smtpPass)).toBe(true);
            expect(saved().smtpPass).not.toContain('legacy-plaintext');
            expect(decryptSecret(saved().smtpPass, ROOT, SMTP_PASS_PURPOSE)).toBe('legacy-plaintext');
        });

        it('stores an empty password when none is set and the placeholder has nothing to keep', async () => {
            sectionService.getSection.mockRejectedValue(new Error('not found'));
            await controller.updateEmailSettings(settings(MASKED_SECRET) as never);
            expect(saved().smtpPass).toBe('');
        });

        it('lets the admin clear the password', async () => {
            await controller.updateEmailSettings(settings('') as never);
            expect(saved().smtpPass).toBe('');
        });

        it('never returns the password or the ciphertext to the admin UI', async () => {
            const stored = (await import('@/common/secret-box')).encryptSecret('old-password', ROOT, SMTP_PASS_PURPOSE);
            sectionService.getSection.mockResolvedValue({ ...settings(stored) });

            const result = (await controller.getEmailSettings()) as { smtpPass: string };

            expect(result.smtpPass).toBe(MASKED_SECRET);
            expect(JSON.stringify(result)).not.toContain('enc:v1:');
            expect(JSON.stringify(result)).not.toContain('old-password');
        });

        it('returns an empty value when no password is configured', async () => {
            sectionService.getSection.mockResolvedValue({ ...settings('') });
            expect(((await controller.getEmailSettings()) as { smtpPass: string }).smtpPass).toBe('');
        });
    });
});
