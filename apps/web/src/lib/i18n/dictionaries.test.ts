import { describe, expect, it } from 'vitest';
import { dirOf, getLabels, isLang } from './dictionaries';

const keys = (value: unknown, prefix = ''): string[] =>
    Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
        typeof v === 'object' && v ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
    );

describe('label dictionaries', () => {
    it('have the same keys in Arabic and English', () => {
        expect(keys(getLabels('ar')).sort()).toEqual(keys(getLabels('en')).sort());
    });

    it('have no empty values', () => {
        for (const lang of ['ar', 'en'] as const) {
            for (const key of keys(getLabels(lang))) {
                const value = key.split('.').reduce<any>((o, k) => o[k], getLabels(lang));
                expect(value, `${lang}:${key}`).toBeTruthy();
            }
        }
    });

    it('knows direction and valid locales', () => {
        expect(dirOf('ar')).toBe('rtl');
        expect(dirOf('en')).toBe('ltr');
        expect(isLang('ar')).toBe(true);
        expect(isLang('fr')).toBe(false);
    });
});
