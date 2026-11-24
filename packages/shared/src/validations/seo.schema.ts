import { z } from 'zod';
import {
    GA_ID_REGEX,
    getDefaultMultiLanguageField,
    GTM_ID_REGEX,
    ImageFieldSchema,
    MultiLanguageFieldSchema,
} from './common.schema';
import { urlValidation } from './base.schema';

export const OrganizationSeoSchema = z.object({
    name: MultiLanguageFieldSchema.optional(),
    legalName: MultiLanguageFieldSchema.optional(),
    licenseNumber: z.string().optional().default('522'),
    foundingYear: z.number().int().optional().default(2015),
    logo: z.string().optional().or(z.literal('')),
    sameAs: z.array(z.string()).optional().default([]),
});

export const ConsentTextsSchema = z.object({
    bannerTitle: MultiLanguageFieldSchema.optional(),
    bannerDescription: MultiLanguageFieldSchema.optional(),
    acceptAllLabel: MultiLanguageFieldSchema.optional(),
    rejectAllLabel: MultiLanguageFieldSchema.optional(),
    customizeLabel: MultiLanguageFieldSchema.optional(),
    analyticsDescription: MultiLanguageFieldSchema.optional(),
    marketingDescription: MultiLanguageFieldSchema.optional(),
});

// Site-wide SEO defaults + tracking per contracts/api-additions.md
export const GlobalSeoSettingsSchema = z.object({
    metaTitleTemplate: MultiLanguageFieldSchema.optional(),
    metaDescription: MultiLanguageFieldSchema.optional(),
    ogImage: urlValidation.optional().or(z.literal('')),
    keywords: MultiLanguageFieldSchema.optional(),
    robotsDirective: z.string().default('index, follow'),
    canonicalBase: urlValidation.optional().or(z.literal('')),
    googleAnalyticsId: z.string().regex(GA_ID_REGEX, 'Must look like G-XXXXXXXXXX').optional().or(z.literal('')),
    googleTagManagerId: z.string().regex(GTM_ID_REGEX, 'Must look like GTM-XXXXXXX').optional().or(z.literal('')),
    gtmId: z.string().regex(GTM_ID_REGEX, 'Must look like GTM-XXXXXXX').optional().or(z.literal('')),
    gaMeasurementId: z.string().regex(GA_ID_REGEX, 'Must look like G-XXXXXXXXXX').optional().or(z.literal('')),
    metaPixelId: z.string().optional().or(z.literal('')),
    consentVersion: z.string().default('1.0'),
    consentTexts: ConsentTextsSchema.optional(),
    organization: OrganizationSeoSchema.optional(),
});

export const GlobalSeoSchema = GlobalSeoSettingsSchema;

export const getDefaultGlobalSeoSettings = (): z.infer<typeof GlobalSeoSettingsSchema> => ({
    metaTitleTemplate: getDefaultMultiLanguageField(),
    metaDescription: getDefaultMultiLanguageField(),
    ogImage: '',
    keywords: getDefaultMultiLanguageField(),
    robotsDirective: 'index, follow',
    canonicalBase: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    gtmId: '',
    gaMeasurementId: '',
    metaPixelId: '',
    consentVersion: '1.0',
    organization: {
        name: { ar: 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية', en: 'Abdulrahman Al-Shubaishiri Professional Consulting' },
        legalName: { ar: 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية', en: 'Abdulrahman Al-Shubaishiri Professional Consulting' },
        licenseNumber: '522',
        foundingYear: 2015,
        logo: '',
        sameAs: [],
    },
});

export const SeoContentSchema = z.object({
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema.optional(),
    keywords: MultiLanguageFieldSchema.optional(),
    canonicalUrl: urlValidation.optional().or(z.literal('')),
    ogTitle: MultiLanguageFieldSchema.optional(),
    ogDescription: MultiLanguageFieldSchema.optional(),
    ogType: z.string().optional().or(z.literal('')),
    ogImage: z.union([urlValidation, ImageFieldSchema, z.literal('')]).optional().nullable(),
    noindex: z.boolean().default(false).optional(),
});

export const SeoSchema = z.object({
    pageKey: z.string().min(1),
    content: SeoContentSchema,
});

export const getDefaultSeoContent = (): z.infer<typeof SeoContentSchema> => ({
    title: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
    keywords: getDefaultMultiLanguageField(),
    canonicalUrl: '',
    ogTitle: getDefaultMultiLanguageField(),
    ogDescription: getDefaultMultiLanguageField(),
    ogType: 'website',
    ogImage: '',
    noindex: false,
});
