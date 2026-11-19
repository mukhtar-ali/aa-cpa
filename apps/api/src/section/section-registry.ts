import { BadRequestException } from '@nestjs/common';
import {
    AboutPageSectionSchema,
    ArticlesPageSectionSchema,
    CareersPageSectionSchema,
    ContactPageSectionSchema,
    EstimatorConfigSchema,
    HomePageSectionSchema,
    LegalPageSectionSchema,
    NotificationSettingsSchema,
    SectorsPageSectionSchema,
    ServicesPageSectionSchema,
    ServiceSharedSectionSchema,
    SiteChromeSectionSchema,
    SpamSettingsSchema,
} from '@repo/shared';
import type { ZodTypeAny } from 'zod';

export const SECTION_REGISTRY: Record<string, ZodTypeAny> = {
    'site-chrome': SiteChromeSectionSchema,
    'page-home': HomePageSectionSchema,
    'page-about': AboutPageSectionSchema,
    'page-services': ServicesPageSectionSchema,
    'service-shared': ServiceSharedSectionSchema,
    'page-sectors': SectorsPageSectionSchema,
    'page-articles': ArticlesPageSectionSchema,
    'page-careers': CareersPageSectionSchema,
    'page-contact': ContactPageSectionSchema,
    'legal-privacy': LegalPageSectionSchema,
    'legal-terms': LegalPageSectionSchema,
    'legal-accessibility': LegalPageSectionSchema,
    'estimator-config': EstimatorConfigSchema,
    'notification-settings': NotificationSettingsSchema,
    'spam-settings': SpamSettingsSchema,
};

export function getSectionSchema(type: string): ZodTypeAny | undefined {
    return SECTION_REGISTRY[type];
}

export function hasSectionSchema(type: string): boolean {
    return Boolean(SECTION_REGISTRY[type]);
}

/**
 * Validates a payload against the registered schema for `type`.
 * Throws a `BadRequestException` if validation fails or if no schema is registered.
 */
export function validateSectionData<T = any>(type: string, data: unknown): T {
    const schema = getSectionSchema(type);
    if (!schema) {
        throw new BadRequestException(`No schema registered for section type '${type}'`);
    }

    const result = schema.safeParse(data);
    if (!result.success) {
        const issues = result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
        throw new BadRequestException({
            message: `Validation failed for section '${type}'`,
            errors: issues,
        });
    }

    return result.data as T;
}
