import { z } from 'zod';
import { emailValidation, urlValidation } from './base.schema';
import { MediaType } from '../enums';

export const MultiLanguageFieldSchema = z.object({
    en: z.string(),
    ar: z.string(),
});

/**
 * A multi-language field whose Arabic text is mandatory (Arabic is the primary language), e.g. the title of a
 * service, sector, article, job or section. English is optional and defaults to empty string.
 */
export const RequiredTitleSchema = MultiLanguageFieldSchema.extend({
    ar: z.string().trim().min(1, 'Arabic title is required'),
    en: z.string().default(''),
});

export const SlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SlugSchema = z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(SlugRegex, 'Slug must be lowercase alphanumeric with single hyphens');

export const SaudiMobileRegex = /^(?:(?:\+966|00966|0)?5\d{8}|\+[1-9]\d{6,14})$/;
export const SaudiMobileSchema = z
    .string()
    .trim()
    .regex(SaudiMobileRegex, 'Invalid mobile number (must be Saudi 05XXXXXXXX or E.164)');

export const ImageFieldSchema = z.object({
    url: z.string().trim().min(1, 'Image URL is required'),
    width: z.number().int().positive('Image width must be positive'),
    height: z.number().int().positive('Image height must be positive'),
    alt: MultiLanguageFieldSchema,
});

export const ImageRefSchema = z.object({
    src: z.string().trim().min(1, 'Image source is required'),
    alt: z.string().default(''),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
});

export const LinkRefSchema = z.object({
    label: z.string(),
    href: z.string(),
    external: z.boolean().optional(),
});

export const ActionRefSchema = LinkRefSchema.extend({
    variant: z.enum(['primary', 'secondary', 'outline-light', 'link']).optional(),
});

export const PublicFormGuardSchema = z.object({
    consent: z.literal(true, {
        message: 'Consent is required',
    }),
    website: z
        .string()
        .max(0, 'Spam detected')
        .optional()
        .or(z.literal(''))
        .default(''),
    startedAt: z.number().int(),
    turnstileToken: z.string().optional(),
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
