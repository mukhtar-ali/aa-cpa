import { localize } from './localize';

describe('localize', () => {
    it('picks the language for plain multi-language fields', () => {
        expect(localize({ title: { en: 'Hi', ar: 'مرحبا' }, n: 3 }, 'ar')).toEqual({ title: 'مرحبا', n: 3 });
        expect(localize({ title: { en: 'Hi', ar: '' } }, 'ar')).toEqual({ title: '' });
    });

    it('localizes arrays of multi-language values (unit features, project tags) to strings', () => {
        const unit = { overViewFeatures: [{ en: 'Balcony', ar: 'شرفة' }, { en: 'Parking', ar: 'موقف' }] };
        expect(localize(unit, 'en')).toEqual({ overViewFeatures: ['Balcony', 'Parking'] });
        expect(localize(unit, 'ar')).toEqual({ overViewFeatures: ['شرفة', 'موقف'] });
    });

    it('localizes inside nested objects, arrays of objects and top-level paginated items', () => {
        const page = {
            items: [{ title: { en: 'A', ar: 'ا' }, tags: [{ en: 't', ar: 'ت' }], amenities: [{ name: { en: 'Pool', ar: 'مسبح' } }] }],
            total: 1,
        };
        expect(localize(page, 'ar')).toEqual({ items: [{ title: 'ا', tags: ['ت'], amenities: [{ name: 'مسبح' }] }], total: 1 });
        expect(localize([{ en: 'x', ar: 'y' }], 'ar')).toEqual(['y']);
    });

    it('leaves strings, numbers, null and empty arrays alone', () => {
        expect(localize({ a: 'x', b: 1, c: null, d: [] }, 'en')).toEqual({ a: 'x', b: 1, c: null, d: [] });
    });
});
