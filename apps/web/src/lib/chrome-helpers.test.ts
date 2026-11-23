import { describe, expect, it } from 'vitest';
import { channelOf } from './contact-channel';
import { switchedPath } from './i18n/switch-path';

describe('switchedPath', () => {
    it('keeps the path and swaps the language', () => {
        expect(switchedPath('/ar/services/audit', 'en')).toBe('/en/services/audit');
        expect(switchedPath('/en', 'ar')).toBe('/ar');
        expect(switchedPath('/en/articles', 'ar')).toBe('/ar/articles');
    });
});

describe('channelOf', () => {
    it('classifies contact links', () => {
        expect(channelOf('tel:+966500000000')).toBe('phone');
        expect(channelOf('mailto:a@b.com')).toBe('email');
        expect(channelOf('https://wa.me/966500000000')).toBe('whatsapp');
        expect(channelOf('/ar/contact')).toBeNull();
        expect(channelOf('https://example.com')).toBeNull();
    });
});
