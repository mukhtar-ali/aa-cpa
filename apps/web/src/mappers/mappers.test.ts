import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SiteChromeWeb } from '@repo/shared';
import { toChromeProps } from './chrome';
import { localizeHref } from './href';
import { toImageRef } from './image';

afterEach(() => vi.restoreAllMocks());

describe('localizeHref', () => {
    it('prefixes internal paths only', () => {
        expect(localizeHref('ar', '/services')).toBe('/ar/services');
        expect(localizeHref('en', '/')).toBe('/en');
        expect(localizeHref('en', '/en/about')).toBe('/en/about');
        expect(localizeHref('en', '/services?x=1')).toBe('/en/services?x=1');
        for (const external of ['https://x.com', 'mailto:a@b.c', 'tel:+966', '#top', '//cdn.x/y']) {
            expect(localizeHref('ar', external)).toBe(external);
        }
    });
});

describe('toImageRef', () => {
    it('maps an API image and defaults the size', () => {
        expect(toImageRef({ url: 'https://x/a.jpg', alt: ' Team ', width: 10, height: 20 })).toEqual({ src: 'https://x/a.jpg', alt: 'Team', width: 10, height: 20 });
        expect(toImageRef({ src: '/b.jpg', alt: 'B' })).toMatchObject({ width: 1200, height: 800 });
        expect(toImageRef(undefined)).toBeUndefined();
    });

    it('warns in development about missing alt text, but not for decorative images', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        toImageRef({ url: '/a.jpg' });
        expect(warn).toHaveBeenCalledTimes(1);
        const decorative = toImageRef({ url: '/a.jpg' }, { decorative: true });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(decorative).toMatchObject({ alt: '', decorative: true });
    });

    it('stays quiet in production', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.stubEnv('NODE_ENV', 'production');
        toImageRef({ url: '/a.jpg' });
        vi.unstubAllEnvs();
        expect(warn).not.toHaveBeenCalled();
    });
});

const chrome: SiteChromeWeb = {
    logo: { href: '/', label: 'AA' },
    utility: { license: 'L', network: 'N', city: 'C', phone: { type: 'phone', label: 'Call', value: '+966', href: 'tel:+966' } },
    nav: [{ label: 'Services', href: '/services', children: [{ label: 'Audit', href: '/services/audit' }] }],
    cta: { label: 'Contact', href: '/contact' },
    localeSwitch: { current: 'ar', label: 'EN', href: '/en' },
    footer: {
        description: 'd',
        socials: [],
        columns: [{ title: 'Links', links: [{ label: 'About', href: '/about' }] }],
        contacts: [{ type: 'whatsapp', label: 'WhatsApp', value: '+966', href: 'https://wa.me/966' }],
        legal: { copyright: 'c', registry: ['CR'], links: [{ label: 'Privacy', href: '/privacy' }] },
    },
} as SiteChromeWeb;

describe('toChromeProps', () => {
    it('localises hrefs, keeps external ones, and finds the WhatsApp channel', () => {
        const props = toChromeProps(chrome, 'en', '/en/services');
        expect(props.logo.href).toBe('/en');
        expect(props.nav[0].href).toBe('/en/services');
        expect(props.nav[0].children?.[0].href).toBe('/en/services/audit');
        expect(props.cta.href).toBe('/en/contact');
        expect(props.footer.columns[0].links[0].href).toBe('/en/about');
        expect(props.footer.legal.links[0].href).toBe('/en/privacy');
        expect(props.utility.phone.href).toBe('tel:+966');
        expect(props.whatsapp).toEqual({ href: 'https://wa.me/966', label: 'WhatsApp' });
        expect(props.localeSwitch?.href).toBe('/en/services');
    });
});
