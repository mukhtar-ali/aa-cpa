import { describe, it, expect } from 'vitest';
import {
    RequiredTitleSchema,
    SlugSchema,
    SaudiMobileSchema,
    ImageFieldSchema,
    PublicFormGuardSchema,
} from '../src/validations/common.schema';

describe('common.schema', () => {
    describe('RequiredTitleSchema', () => {
        it('accepts title with Arabic provided and English empty or omitted', () => {
            const valid1 = RequiredTitleSchema.parse({ ar: 'عنوان باللغة العربية' });
            expect(valid1.ar).toBe('عنوان باللغة العربية');
            expect(valid1.en).toBe('');

            const valid2 = RequiredTitleSchema.parse({ ar: 'عنوان', en: 'English Title' });
            expect(valid2.ar).toBe('عنوان');
            expect(valid2.en).toBe('English Title');
        });

        it('rejects when Arabic title is empty or missing', () => {
            expect(() => RequiredTitleSchema.parse({ ar: '', en: 'English Title' })).toThrow();
            expect(() => RequiredTitleSchema.parse({ en: 'English Title' })).toThrow();
            expect(() => RequiredTitleSchema.parse({ ar: '   ' })).toThrow();
        });
    });

    describe('SlugSchema', () => {
        it('accepts valid lowercase alphanumeric slugs with hyphens', () => {
            expect(SlugSchema.parse('audit-services')).toBe('audit-services');
            expect(SlugSchema.parse('tax123-service-ksa')).toBe('tax123-service-ksa');
            expect(SlugSchema.parse('company')).toBe('company');
        });

        it('rejects invalid slugs', () => {
            expect(() => SlugSchema.parse('Audit-Service')).toThrow();
            expect(() => SlugSchema.parse('audit--service')).toThrow();
            expect(() => SlugSchema.parse('-audit')).toThrow();
            expect(() => SlugSchema.parse('audit-')).toThrow();
            expect(() => SlugSchema.parse('audit service')).toThrow();
            expect(() => SlugSchema.parse('')).toThrow();
        });
    });

    describe('SaudiMobileSchema', () => {
        it('accepts Saudi 05 numbers and E.164 formats', () => {
            expect(SaudiMobileSchema.parse('0512345678')).toBe('0512345678');
            expect(SaudiMobileSchema.parse('+966512345678')).toBe('+966512345678');
            expect(SaudiMobileSchema.parse('00966512345678')).toBe('00966512345678');
            expect(SaudiMobileSchema.parse('512345678')).toBe('512345678');
            expect(SaudiMobileSchema.parse('+14155552671')).toBe('+14155552671');
        });

        it('rejects invalid mobile numbers', () => {
            expect(() => SaudiMobileSchema.parse('0612345678')).toThrow();
            expect(() => SaudiMobileSchema.parse('051234567')).toThrow(); // too short
            expect(() => SaudiMobileSchema.parse('abc')).toThrow();
            expect(() => SaudiMobileSchema.parse('')).toThrow();
        });
    });

    describe('ImageFieldSchema', () => {
        it('accepts valid ImageField with url, width, height, and bilingual alt', () => {
            const valid = ImageFieldSchema.parse({
                url: 'https://example.com/logo.webp',
                width: 800,
                height: 600,
                alt: { ar: 'صورة الشعار', en: 'Logo image' },
            });
            expect(valid.width).toBe(800);
            expect(valid.height).toBe(600);
            expect(valid.alt.ar).toBe('صورة الشعار');
        });

        it('rejects non-positive dimensions or empty url', () => {
            expect(() =>
                ImageFieldSchema.parse({
                    url: '',
                    width: 800,
                    height: 600,
                    alt: { ar: 'صورة', en: '' },
                })
            ).toThrow();

            expect(() =>
                ImageFieldSchema.parse({
                    url: 'https://example.com/logo.webp',
                    width: 0,
                    height: 600,
                    alt: { ar: 'صورة', en: '' },
                })
            ).toThrow();
        });
    });

    describe('PublicFormGuardSchema', () => {
        it('accepts valid submission with consent=true, empty honeypot, startedAt', () => {
            const valid = PublicFormGuardSchema.parse({
                consent: true,
                website: '',
                startedAt: Date.now() - 5000,
                turnstileToken: 'token-abc',
            });
            expect(valid.consent).toBe(true);
            expect(valid.website).toBe('');
        });

        it('rejects when consent is not true', () => {
            expect(() =>
                PublicFormGuardSchema.parse({
                    consent: false,
                    website: '',
                    startedAt: Date.now(),
                })
            ).toThrow();
        });

        it('rejects when honeypot website is filled', () => {
            expect(() =>
                PublicFormGuardSchema.parse({
                    consent: true,
                    website: 'https://spam-bot.com',
                    startedAt: Date.now(),
                })
            ).toThrow();
        });
    });
});
