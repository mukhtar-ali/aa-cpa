import type { NextFunction, Request, Response } from 'express';
import { langStorage } from './i18n.helper';
import { LangMiddleware, resolveLang } from './lang.middleware';

describe('resolveLang (MUK-467)', () => {
    it.each([
        // [?lang=, Accept-Language, expected]
        [undefined, undefined, 'en'],
        [undefined, 'en-US,en;q=0.9', 'en'],
        [undefined, 'ar', 'ar'],
        [undefined, 'ar-EG,ar;q=0.9,en;q=0.8', 'ar'],
        [undefined, 'AR', 'ar'],
        [undefined, '*', 'en'],
        ['ar', undefined, 'ar'], // the bug: the query alone used to be ignored
        ['ar', 'en', 'ar'], // an explicit query wins over the header
        ['en', 'ar', 'en'],
        ['AR', undefined, 'ar'],
        [' ar ', undefined, 'ar'],
    ])('?lang=%j + Accept-Language %j -> %s', (query, header, expected) => {
        expect(resolveLang(query, header)).toBe(expected);
    });

    it.each([
        ['an unknown language', 'fr'],
        ['an empty value', ''],
        ['a repeated parameter (array)', ['ar', 'en']],
        ['an object', { $ne: 'x' }],
        ['a number', 5],
        ['an injection attempt', 'ar; drop table'],
    ])('ignores %s and falls back to the header', (_label, query) => {
        expect(resolveLang(query, 'ar')).toBe('ar');
        expect(resolveLang(query, 'en')).toBe('en');
        expect(resolveLang(query, undefined)).toBe('en');
    });
});

describe('LangMiddleware', () => {
    function run(query: unknown, acceptLanguage?: string) {
        let seen: string | undefined;
        const next: NextFunction = () => {
            seen = langStorage.getStore();
        };
        new LangMiddleware().use(
            { query: { lang: query }, headers: { 'accept-language': acceptLanguage } } as unknown as Request,
            {} as Response,
            next,
        );
        return seen;
    }

    it('makes the resolved language available to the rest of the request via langStorage', () => {
        expect(run('ar')).toBe('ar');
        expect(run(undefined, 'ar')).toBe('ar');
        expect(run(undefined, 'en')).toBe('en');
        expect(run('en', 'ar')).toBe('en');
    });

    it('defaults to English when the request has neither', () => {
        expect(run(undefined)).toBe('en');
    });

    it('does not throw when the query object is missing', () => {
        let seen: string | undefined;
        new LangMiddleware().use(
            { headers: { 'accept-language': 'ar' } } as unknown as Request,
            {} as Response,
            () => {
                seen = langStorage.getStore();
            },
        );
        expect(seen).toBe('ar');
    });
});
