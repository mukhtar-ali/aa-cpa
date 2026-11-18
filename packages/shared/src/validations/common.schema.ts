import { z } from 'zod';
import { emailValidation, urlValidation } from './base.schema';
import { MediaType } from '../enums';

export const MultiLanguageFieldSchema = z.object({
    en: z.string(),
    ar: z.string(),
});

/**
 * A multi-language field whose English text is mandatory (English is the fallback language), e.g. the title of a
 * news article, project, job or unit. Without it the admin could save a record with no title at all, which then
 * shows up blank in every list and on the public site. Arabic stays optional.
 */
export const RequiredTitleSchema = MultiLanguageFieldSchema.extend({
    en: z.string().trim().min(1, 'English title is required'),
});

export const getDefaultMultiLanguageField = () =>
    MultiLanguageFieldSchema.parse({ en: '', ar: '' });

export const MediaTypeSchema = z.nativeEnum(MediaType).default(MediaType.Image);

export const WebsiteInfoSectionSchema = z.object({
    facebookUrl: urlValidation.optional().or(z.literal('')),
    instagramUrl: urlValidation.optional().or(z.literal('')),
    linkedinUrl: urlValidation.optional().or(z.literal('')),
    youtubeUrl: urlValidation.optional().or(z.literal('')),
    email: emailValidation.optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
    location: urlValidation.optional().or(z.literal('')),
    address: MultiLanguageFieldSchema.optional().default({ en: '', ar: '' }),
    footerDescription: MultiLanguageFieldSchema.optional().default({ en: '', ar: '' }),
    // Branding — optional so existing rows without them still validate.
    siteName: MultiLanguageFieldSchema.optional(),
    tagline: MultiLanguageFieldSchema.optional(),
    logoUrl: urlValidation.optional().or(z.literal('')),
    faviconUrl: urlValidation.optional().or(z.literal('')),
    businessHours: MultiLanguageFieldSchema.optional(),
    mapEmbed: z.string().optional(),
});

export const getDefaultWebsiteInfo = () =>
    WebsiteInfoSectionSchema.parse({
        facebookUrl: 'https://facebook.com',
        instagramUrl: 'https://instagram.com',
        linkedinUrl: 'https://linkedin.com',
        youtubeUrl: 'https://youtube.com',
        email: 'example@example.com',
        phone: '000-000-0000',
        whatsapp: '000-000-0000',
        location: 'https://example.com',
        address: getDefaultMultiLanguageField(),
        footerDescription: getDefaultMultiLanguageField(),
        siteName: getDefaultMultiLanguageField(),
        tagline: getDefaultMultiLanguageField(),
        logoUrl: '',
        faviconUrl: '',
        businessHours: getDefaultMultiLanguageField(),
        mapEmbed: '',
    });

// Tracking IDs are interpolated into inline <script> code on every public page, so they must be
// strictly validated (a value like `');alert(1)//` would otherwise be stored XSS). Shared so the API,
// the admin form and the web layout all use one definition.
export const GTM_ID_REGEX = /^GTM-[A-Z0-9]+$/;
export const GA_ID_REGEX = /^G-[A-Z0-9]+$/;

// Site-wide SEO defaults + tracking — distinct from the per-page `Seo` model (title/
// description per pageKey): this is the fallback template + analytics IDs that apply
// everywhere, matching wujud's GlobalSeoSettings.
export const GlobalSeoSettingsSchema = z.object({
    metaTitleTemplate: MultiLanguageFieldSchema.optional(),
    metaDescription: MultiLanguageFieldSchema.optional(),
    ogImage: urlValidation.optional().or(z.literal('')),
    keywords: MultiLanguageFieldSchema.optional(),
    robotsDirective: z.string().default('index, follow'),
    canonicalBase: urlValidation.optional().or(z.literal('')),
    googleAnalyticsId: z.string().regex(GA_ID_REGEX, 'Must look like G-XXXXXXXXXX').optional().or(z.literal('')),
    googleTagManagerId: z.string().regex(GTM_ID_REGEX, 'Must look like GTM-XXXXXXX').optional().or(z.literal('')),
});

export const getDefaultGlobalSeoSettings = (): z.infer<typeof GlobalSeoSettingsSchema> => ({
    metaTitleTemplate: getDefaultMultiLanguageField(),
    metaDescription: getDefaultMultiLanguageField(),
    ogImage: '',
    keywords: getDefaultMultiLanguageField(),
    robotsDirective: 'index, follow',
    canonicalBase: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
});

// SMTP configuration, kept out of website-info since it's operational/credential data
// rather than public site content.
export const EmailSettingsSchema = z.object({
    smtpHost: z.string().optional().or(z.literal('')),
    smtpPort: z.coerce.number().optional(),
    smtpSecure: z.boolean().default(false),
    smtpUser: z.string().optional().or(z.literal('')),
    smtpPass: z.string().optional().or(z.literal('')),
    smtpFromEmail: emailValidation.optional().or(z.literal('')),
    smtpFromName: z.string().optional().or(z.literal('')),
});

export const getDefaultEmailSettings = (): z.infer<typeof EmailSettingsSchema> => ({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    smtpFromEmail: '',
    smtpFromName: '',
});

export const LinkWithLabelSchema = z.object({
    label: MultiLanguageFieldSchema,
    url: urlValidation.optional().or(z.literal('')),
});

export const getDefaultLinkWithLabel = () =>
    LinkWithLabelSchema.parse({ label: getDefaultMultiLanguageField(), url: '' });

export const ReRankSchema = z.object({
    movedItems: z.array(z.object({ id: z.string(), rank: z.number() })),
});
