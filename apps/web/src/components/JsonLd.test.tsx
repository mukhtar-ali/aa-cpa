import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { JsonLd } from './JsonLd';

describe('JsonLd', () => {
    it('renders script tag with application/ld+json and escapes < as \\u003c', () => {
        const data = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            text: '<script>alert("hack")</script>',
        };
        const html = renderToString(<JsonLd data={data} />);
        expect(html).toContain('type="application/ld+json"');
        expect(html).toContain('\\u003cscript>alert(\\"hack\\")\\u003c/script>');
        expect(html).not.toContain('<script>alert');
    });

    it('returns empty string if data is null or undefined', () => {
        expect(renderToString(<JsonLd data={null} />)).toBe('');
        expect(renderToString(<JsonLd data={undefined} />)).toBe('');
    });
});
