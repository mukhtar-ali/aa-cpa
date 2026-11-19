import { localize } from './localize';

describe('localize', () => {
    it('picks the language for plain multi-language fields', () => {
        expect(localize({ title: { en: 'Hi', ar: 'مرحبا' }, n: 3 }, 'ar')).toEqual({ title: 'مرحبا', n: 3 });
        expect(localize({ title: { en: 'Hi', ar: 'مرحبا' } }, 'en')).toEqual({ title: 'Hi' });
    });

    it('falls back to Arabic when English is empty or whitespace', () => {
        expect(localize({ title: { en: '', ar: 'مرحبا' } }, 'en')).toEqual({ title: 'مرحبا' });
        expect(localize({ title: { en: '   ', ar: 'مرحبا' } }, 'en')).toEqual({ title: 'مرحبا' });
        expect(localize({ title: { ar: 'مرحبا' } }, 'en')).toEqual({ title: 'مرحبا' });
    });

    it('localizes arrays of multi-language values (features, tags) to strings with Arabic fallback', () => {
        const unit = { overViewFeatures: [{ en: 'Balcony', ar: 'شرفة' }, { en: '', ar: 'موقف' }] };
        expect(localize(unit, 'en')).toEqual({ overViewFeatures: ['Balcony', 'موقف'] });
        expect(localize(unit, 'ar')).toEqual({ overViewFeatures: ['شرفة', 'موقف'] });
    });

    it('localizes inside nested objects, arrays of objects and top-level paginated items', () => {
        const page = {
            items: [{ title: { en: 'A', ar: 'ا' }, tags: [{ en: 't', ar: 'ت' }], amenities: [{ name: { en: '', ar: 'مسبح' } }] }],
            total: 1,
        };
        expect(localize(page, 'ar')).toEqual({ items: [{ title: 'ا', tags: ['ت'], amenities: [{ name: 'مسبح' }] }], total: 1 });
        expect(localize(page, 'en')).toEqual({ items: [{ title: 'A', tags: ['t'], amenities: [{ name: 'مسبح' }] }], total: 1 });
        expect(localize([{ en: 'x', ar: 'y' }], 'ar')).toEqual(['y']);
    });

    it('leaves strings, numbers, null and empty arrays alone', () => {
        expect(localize({ a: 'x', b: 1, c: null, d: [] }, 'en')).toEqual({ a: 'x', b: 1, c: null, d: [] });
    });
});
