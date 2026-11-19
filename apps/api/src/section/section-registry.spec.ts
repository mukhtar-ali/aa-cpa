import { describe, expect, it } from '@jest/globals';
import {
    getSectionSchema,
    hasSectionSchema,
    validateSectionData,
} from './section-registry';

describe('section-registry', () => {
    const registeredTypes = [
        'site-chrome',
        'page-home',
        'page-about',
        'page-services',
        'service-shared',
        'page-sectors',
        'page-articles',
        'page-careers',
        'page-contact',
        'legal-privacy',
        'legal-terms',
        'legal-accessibility',
        'estimator-config',
        'notification-settings',
        'spam-settings',
    ];

    it.each(registeredTypes)('has schema registered for %s', (type) => {
        expect(hasSectionSchema(type)).toBe(true);
        expect(getSectionSchema(type)).toBeDefined();
    });

    it('returns false for unknown section type', () => {
        expect(hasSectionSchema('non-existent-type')).toBe(false);
        expect(getSectionSchema('non-existent-type')).toBeUndefined();
    });

    it('validates spam-settings successfully with valid payload', () => {
        const validSpam = {
            turnstileEnabled: true,
            turnstileSiteKey: '0x4AAAAAA',
            minFillSeconds: 5,
        };
        const result = validateSectionData('spam-settings', validSpam);
        expect(result.turnstileEnabled).toBe(true);
        expect(result.minFillSeconds).toBe(5);
    });

    it('rejects spam-settings when invalid type provided', () => {
        const invalidSpam = {
            turnstileEnabled: 'not-a-boolean',
            minFillSeconds: -1,
        };
        expect(() => validateSectionData('spam-settings', invalidSpam)).toThrow();
    });

    it('validates notification-settings with valid email inboxes', () => {
        const validNotification = {
            defaultInbox: 'leads@example.com',
            serviceRecipients: { audit: ['audit@example.com'] },
            careersInbox: 'hr@example.com',
            retentionMonths: 12,
        };
        const result = validateSectionData('notification-settings', validNotification);
        expect(result.defaultInbox).toBe('leads@example.com');
    });

    it('rejects notification-settings when email is invalid', () => {
        const invalidNotification = {
            defaultInbox: 'not-an-email',
            serviceRecipients: {},
            careersInbox: 'hr@example.com',
            retentionMonths: 12,
        };
        expect(() => validateSectionData('notification-settings', invalidNotification)).toThrow();
    });

    it('rejects legal-privacy if version or title is missing', () => {
        const invalidLegal = {
            version: '',
            updatedAt: '2026-01-01',
        };
        expect(() => validateSectionData('legal-privacy', invalidLegal)).toThrow();
    });

    it('throws when validating an unknown section type', () => {
        expect(() => validateSectionData('unknown-section', {})).toThrow(
            "No schema registered for section type 'unknown-section'",
        );
    });
});
