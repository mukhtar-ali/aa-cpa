import { sanitizeRichText } from './sanitize-html.util';

describe('sanitizeRichText', () => {
    describe('inline images inside paragraphs (MUK-469)', () => {
        it('keeps a paragraph that only contains an image', () => {
            const out = sanitizeRichText('<p><img src="https://cdn.example.com/a.png" alt="Pic"></p>');
            expect(out).toContain('<p>');
            expect(out).toContain('src="https://cdn.example.com/a.png"');
            expect(out).toContain('alt="Pic"');
        });

        it('keeps an image that sits between text', () => {
            const out = sanitizeRichText('<p>Before <img src="/uploads/b.jpg" alt=""> after</p>');
            expect(out).toContain('Before');
            expect(out).toContain('after');
            expect(out).toContain('src="/uploads/b.jpg"');
        });

        it('keeps image attributes that are allowed (alt, title, width, height)', () => {
            const out = sanitizeRichText('<p><img src="/a.png" alt="x" title="t" width="10" height="20"></p>');
            expect(out).toContain('alt="x"');
            expect(out).toContain('title="t"');
            expect(out).toContain('width="10"');
            expect(out).toContain('height="20"');
        });

        it('keeps several images in one paragraph', () => {
            const out = sanitizeRichText('<p><img src="/1.png"><img src="/2.png"></p>');
            expect(out).toContain('/1.png');
            expect(out).toContain('/2.png');
        });
    });

    describe('empty paragraphs are still cleaned up', () => {
        it.each([
            ['empty', '<p></p>'],
            ['whitespace', '<p>   </p>'],
            ['newline', '<p>\n</p>'],
            ['non-breaking space', '<p>&nbsp;</p>'],
        ])('removes a %s paragraph', (_label, html) => {
            expect(sanitizeRichText(`${html}<p>kept</p>`)).toBe('<p>kept</p>');
        });

        it('removes a paragraph whose only child is a disallowed tag', () => {
            expect(sanitizeRichText('<p><script>alert(1)</script></p><p>kept</p>')).toBe('<p>kept</p>');
        });
    });

    describe('XSS stays blocked', () => {
        const dangerous = [
            '<script>alert(1)</script>',
            '<img src="x" onerror="alert(1)">',
            '<img src="javascript:alert(1)">',
            '<a href="javascript:alert(1)">click</a>',
            '<a href="  JaVaScRiPt:alert(1)">click</a>',
            '<a href="java\tscript:alert(1)">click</a>',
            '<a href="&#106;avascript:alert(1)">click</a>',
            '<a href="vbscript:msgbox(1)">click</a>',
            '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">click</a>',
            '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">',
            '<iframe src="https://evil.example"></iframe>',
            '<svg onload="alert(1)"></svg>',
            '<p style="background:url(javascript:alert(1))">x</p>',
            '<object data="x"></object>',
            '<form action="https://evil.example"><input name="p"></form>',
            '<style>body{display:none}</style>',
            '<p onclick="alert(1)">x</p>',
            '<meta http-equiv="refresh" content="0;url=https://evil.example">',
        ];

        it.each(dangerous)('neutralises %s', (html) => {
            const out = sanitizeRichText(`<p>safe</p>${html}`);
            expect(out).toContain('safe');
            expect(out).not.toMatch(/<script|<iframe|<svg|<style|<object|<form|<meta|<input/i);
            expect(out).not.toMatch(/\son\w+\s*=/i);
            expect(out).not.toMatch(/javascript:|vbscript:|data:/i);
            expect(out).not.toMatch(/style\s*=/i);
        });

        it('does not let an image with a script URL survive as an attack vector inside a kept paragraph', () => {
            const out = sanitizeRichText('<p><img src="javascript:alert(1)" onerror="alert(1)"></p>');
            expect(out).not.toMatch(/javascript:|onerror/i);
        });
    });

    describe('links', () => {
        it('opens external links safely', () => {
            const out = sanitizeRichText('<p><a href="https://example.com">x</a></p>');
            expect(out).toContain('target="_blank"');
            expect(out).toContain('rel="noopener noreferrer"');
        });

        it('leaves in-page and site-relative links alone', () => {
            const out = sanitizeRichText('<p><a href="#top">a</a><a href="/about">b</a></p>');
            expect(out).toContain('href="#top"');
            expect(out).toContain('href="/about"');
            expect(out).not.toContain('target=');
        });
    });

    describe('edge cases', () => {
        it.each([[undefined], [null], ['']])('returns an empty string for %j', (value) => {
            expect(sanitizeRichText(value as never)).toBe('');
        });

        it('keeps ordinary formatting', () => {
            const html = '<h2>Title</h2><p><strong>bold</strong> and <em>italic</em></p><ul><li>one</li></ul>';
            expect(sanitizeRichText(html)).toBe(html);
        });
    });
});
