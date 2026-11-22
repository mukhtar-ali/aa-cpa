import {
    GlobalSeoSettingsSchema,
    resolvePageSeo,
    safeHttpUrl,
    WebsiteInfoSectionSchema,
} from '@repo/shared';

describe('safeHttpUrl (MUK-472)', () => {
    it.each([
        ['https://example.com', 'https://example.com/'],
        ['http://example.com/a?b=1#c', 'http://example.com/a?b=1#c'],
        ['  https://example.com/x  ', 'https://example.com/x'],
        ['HTTPS://EXAMPLE.COM', 'https://example.com/'],
    ])('accepts %j', (input, expected) => {
        expect(safeHttpUrl(input)).toBe(expected);
    });

    it.each([
        'javascript:alert(1)',
        '  JaVaScRiPt:alert(1)',
        'java\tscript:alert(1)',
        'vbscript:msgbox(1)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'file:///etc/passwd',
        'ftp://example.com/x',
        'mailto:a@b.co',
        'tel:+123',
        '//evil.example/x',
        '/relative/path',
        'example.com',
        '',
        '   ',
        'https://',
        `https://example.com/${'a'.repeat(2100)}`,
    ])('rejects %j', (input) => {
        expect(safeHttpUrl(input)).toBeUndefined();
    });

    it.each([undefined, null, 5, {}, [], ['https://example.com']])('rejects the non-string %j', (input) => {
        expect(safeHttpUrl(input)).toBeUndefined();
    });
});

describe('CMS URL fields only accept http(s) (MUK-472)', () => {
    const parse = (patch: Record<string, unknown>) => WebsiteInfoSectionSchema.safeParse(patch);

    it.each(['facebookUrl', 'instagramUrl', 'linkedinUrl', 'youtubeUrl', 'location', 'logoUrl', 'faviconUrl'])(
        '%s accepts https and empty but rejects javascript:, data: and vbscript:',
        (field) => {
            expect(parse({ [field]: 'https://example.com/p' }).success).toBe(true);
            expect(parse({ [field]: '' }).success).toBe(true);
            for (const bad of ['javascript:alert(1)', 'data:text/html;base64,AAAA', 'vbscript:x', 'ftp://example.com']) {
                expect(parse({ [field]: bad }).success).toBe(false);
            }
        },
    );

    it('also protects the global SEO URLs', () => {
        expect(GlobalSeoSettingsSchema.safeParse({ ogImage: 'https://cdn.example.com/og.png' }).success).toBe(true);
        expect(GlobalSeoSettingsSchema.safeParse({ ogImage: 'javascript:alert(1)' }).success).toBe(false);
        expect(GlobalSeoSettingsSchema.safeParse({ canonicalBase: 'javascript:alert(1)' }).success).toBe(false);
    });
});

describe('resolvePageSeo (MUK-472)', () => {
    it('returns nothing for missing content (the site-wide defaults then apply)', () => {
        expect(resolvePageSeo(null)).toEqual({});
        expect(resolvePageSeo(undefined)).toEqual({});
        expect(resolvePageSeo({})).toEqual({});
    });

    it('maps title, description, keywords and canonical', () => {
        expect(
            resolvePageSeo({ title: ' About us ', description: 'Who we are', keywords: 'a, b', canonicalUrl: 'https://example.com/about' }),
        ).toEqual({
            title: 'About us',
            description: 'Who we are',
            keywords: 'a, b',
            canonical: 'https://example.com/about',
        });
    });

    it('never lets an empty CMS field blank out a default', () => {
        expect(resolvePageSeo({ title: '', description: '   ', keywords: '', canonicalUrl: '', ogImage: '' })).toEqual({});
    });

    it('drops unsafe canonical and og image URLs', () => {
        const out = resolvePageSeo({ title: 'T', canonicalUrl: 'javascript:alert(1)', ogImage: 'data:image/png;base64,AAAA', ogTitle: 'OG' });
        expect(out.canonical).toBeUndefined();
        expect(out.og).toEqual({ title: 'OG' });
    });

    it('builds the Open Graph block, falling back to the page title and description', () => {
        expect(
            resolvePageSeo({ title: 'T', description: 'D', ogImage: 'https://cdn.example.com/x.png', ogType: 'website' }),
        ).toMatchObject({ og: { title: 'T', description: 'D', image: 'https://cdn.example.com/x.png', type: 'website' } });
    });

    it('only returns an Open Graph block when the page defines something for it', () => {
        expect(resolvePageSeo({ title: 'T', description: 'D' }).og).toBeUndefined();
    });

    it('ignores an unknown Open Graph type', () => {
        expect(resolvePageSeo({ ogTitle: 'x', ogType: 'weird' }).og).toEqual({ title: 'x' });
    });
});
