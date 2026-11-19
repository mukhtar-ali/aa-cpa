import { BadRequestException, Body, Controller, Get, Post, Put, UseInterceptors } from '@nestjs/common';
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
    type EmailSettingsModel,
    endpoint,
    GlobalSeoSettingsSchema,
    HomeAboutTeaserSchema,
    HomeHeroSectionSchema,
    HomeShowcaseSchema,
    PermissionEnum,
    SeoPage,
    WebsiteInfoSectionSchema,
} from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { LocaleInterceptor } from '@/common/locale.interceptor';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { encryptSecret, isEncryptedSecret, SMTP_PASS_PURPOSE } from '@/common/secret-box';
import { customEnv } from '@/config/custom-env';
import { EmailService } from '@/email/email.service';
import { PageContentService } from './page-content.service';
import { SectionService } from './section.service';

// What the admin UI shows instead of the stored SMTP password (and sends back when unchanged).
export const MASKED_SECRET = '••••••••';

/** True when the submitted settings point at a different SMTP endpoint/identity than the stored ones. */
function smtpConnectionChanged(existing: Record<string, unknown>, body: EmailSettingsModel): boolean {
    const text = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
    const port = (value: unknown) => (value === undefined || value === null || value === '' ? undefined : Number(value));
    return (
        text(existing.smtpHost) !== text(body.smtpHost) ||
        text(existing.smtpUser) !== text(body.smtpUser) ||
        port(existing.smtpPort) !== port(body.smtpPort) ||
        Boolean(existing.smtpSecure) !== Boolean(body.smtpSecure)
    );
}

@Controller()
export class SectionController {
    constructor(
        private readonly sectionService: SectionService,
        private readonly emailService: EmailService,
        private readonly pageContent: PageContentService,
    ) {}

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.common.web)
    async getWebsiteInfoWeb() {
        return this.sectionService.getSection('website-info');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.common.websiteInfo)
    async getWebsiteInfo() {
        return this.sectionService.getSection('website-info');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.common.websiteInfo)
    async updateWebsiteInfo(@Body(new CustomZodValidationPipe(WebsiteInfoSectionSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('website-info', body);
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.common.seoGlobalWeb)
    async getGlobalSeoWeb() {
        return this.sectionService.getSection('seo-global');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.common.seoGlobal)
    async getGlobalSeo() {
        return this.sectionService.getSection('seo-global');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.common.seoGlobal)
    async updateGlobalSeo(@Body(new CustomZodValidationPipe(GlobalSeoSettingsSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('seo-global', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.common.emailSettings)
    async getEmailSettings() {
        const data = (await this.sectionService.getSection('email-settings').catch(() => ({}))) as Record<
            string,
            unknown
        >;
        // Never echo the configured password back to the admin UI.
        return { ...data, smtpPass: data.smtpPass ? MASKED_SECRET : '' };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.common.emailSettings)
    async updateEmailSettings(
        @Body(new CustomZodValidationPipe(EmailSettingsSchema)) body: EmailSettingsModel,
    ) {
        // The SMTP password is encrypted at rest (AES-256-GCM, key derived from JWT_SECRET).
        // A masked or omitted password means "unchanged" — keep the stored one instead of
        // overwriting it with literal bullet characters or wiping it (and encrypt it if it is still a
        // legacy plaintext value from before encryption existed). Only an explicit '' clears it.
        let smtpPass = body.smtpPass;
        if (smtpPass === undefined || smtpPass === MASKED_SECRET) {
            const existing = (await this.sectionService.getSection('email-settings').catch(() => ({}))) as Record<
                string,
                unknown
            >;
            const stored = typeof existing.smtpPass === 'string' ? existing.smtpPass : '';
            // Keeping the stored password while pointing the server at a different SMTP host/port/
            // security mode/user would make the API authenticate to that endpoint with the stored
            // password (e.g. an admin sets their own host and clicks "Send test email"). Require the
            // password to be typed again whenever the connection target changes.
            if (stored && smtpConnectionChanged(existing, body)) {
                throw new BadRequestException(
                    'Re-enter the SMTP password when you change the host, port, security mode or user.',
                );
            }
            smtpPass = stored && !isEncryptedSecret(stored) ? encryptSecret(stored, customEnv.JWT_SECRET, SMTP_PASS_PURPOSE) : stored;
        } else if (smtpPass !== '') {
            smtpPass = encryptSecret(smtpPass, customEnv.JWT_SECRET, SMTP_PASS_PURPOSE);
        }
        await this.sectionService.updateSection('email-settings', { ...body, smtpPass });
        return { message: 'Email settings saved.' };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Post(endpoint.common.emailSettingsTest)
    async testEmailSettings(@Body('to') to: string) {
        await this.emailService.sendTestEmail(to);
        return { message: `Test email sent to ${to}.` };
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.about.web)
    async getAboutWeb() {
        const [seo, hero, content, missionVision, coreValues, leadership, partners] = await Promise.all([
            this.pageContent.getSeo(SeoPage.About),
            this.sectionService.getSection('about-hero').catch(() => ({})),
            this.sectionService.getSection('about-content').catch(() => ({})),
            this.sectionService.getSection('about-mission-vision').catch(() => ({})),
            this.sectionService.getSection('about-core-values').catch(() => ({ items: [] })),
            this.sectionService.getSection('about-leadership').catch(() => ({ items: [] })),
            this.sectionService.getSection('about-partners').catch(() => ({ items: [] })),
        ]);
        return { seo, hero, content, missionVision, coreValues, leadership, partners };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.about.hero)
    async getAboutHero() {
        return this.sectionService.getSection('about-hero');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.about.hero)
    async updateAboutHero(@Body(new CustomZodValidationPipe(AboutUsHeroSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('about-hero', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.about.content)
    async getAboutContent() {
        return this.sectionService.getSection('about-content');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.about.content)
    async updateAboutContent(@Body(new CustomZodValidationPipe(AboutContentSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('about-content', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.about.missionVision)
    async getAboutMissionVision() {
        return this.sectionService.getSection('about-mission-vision');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.about.missionVision)
    async updateAboutMissionVision(@Body(new CustomZodValidationPipe(AboutMissionVisionSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('about-mission-vision', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.about.coreValues)
    async getAboutCoreValues() {
        return this.sectionService.getSection('about-core-values');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.about.coreValues)
    async updateAboutCoreValues(@Body(new CustomZodValidationPipe(AboutCoreValuesSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('about-core-values', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.about.leadership)
    async getAboutLeadership() {
        return this.sectionService.getSection('about-leadership');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.about.leadership)
    async updateAboutLeadership(@Body(new CustomZodValidationPipe(AboutLeadershipSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('about-leadership', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.about.partners)
    async getAboutPartners() {
        return this.sectionService.getSection('about-partners');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.about.partners)
    async updateAboutPartners(@Body(new CustomZodValidationPipe(AboutPartnersSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('about-partners', body);
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.contact.heroWeb)
    async getContactHeroWeb() {
        return this.sectionService.getSection('contact-hero');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.contact.hero)
    async getContactHero() {
        return this.sectionService.getSection('contact-hero');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.contact.hero)
    async updateContactHero(@Body(new CustomZodValidationPipe(ContactUsHeroSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('contact-hero', body);
    }

    /** The whole Contact page in one call: its SEO, hero and form section. */
    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.contact.pageWeb)
    async getContactPageWeb() {
        const [seo, hero, form] = await Promise.all([
            this.pageContent.getSeo(SeoPage.Contact),
            this.pageContent.getSection('contact-hero'),
            this.pageContent.getSection('contact-form'),
        ]);
        return { seo, hero, form };
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.contact.formWeb)
    async getContactFormSectionWeb() {
        return this.sectionService.getSection('contact-form');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.contact.form)
    async getContactFormSection() {
        return this.sectionService.getSection('contact-form');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.contact.form)
    async updateContactFormSection(@Body(new CustomZodValidationPipe(ContactUsFormSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('contact-form', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.home.hero)
    async getHomeHero() {
        return this.sectionService.getSection('home-hero');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.home.hero)
    async updateHomeHero(@Body(new CustomZodValidationPipe(HomeHeroSectionSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('home-hero', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.home.showcase)
    async getHomeShowcase() {
        return this.sectionService.getSection('home-showcase');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.home.showcase)
    async updateHomeShowcase(@Body(new CustomZodValidationPipe(HomeShowcaseSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('home-showcase', body);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.home.aboutTeaser)
    async getHomeAboutTeaser() {
        return this.sectionService.getSection('home-about-teaser');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.home.aboutTeaser)
    async updateHomeAboutTeaser(@Body(new CustomZodValidationPipe(HomeAboutTeaserSchema)) body: Record<string, unknown>) {
        return this.sectionService.updateSection('home-about-teaser', body);
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.home.web)
    async getHomeWeb() {
        const [seo, hero, showcase, aboutTeaser] = await Promise.all([
            this.pageContent.getSeo(SeoPage.Home),
            this.sectionService.getSection('home-hero').catch(() => ({ slides: [] })),
            this.sectionService.getSection('home-showcase').catch(() => ({})),
            this.sectionService.getSection('home-about-teaser').catch(() => ({})),
        ]);
        return { seo, hero, showcase, aboutTeaser };
    }
}
