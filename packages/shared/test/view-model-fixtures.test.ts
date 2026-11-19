import { describe, it, expect } from 'vitest';
import homeFixture from './fixtures/home.ar.json';
import servicesFixture from './fixtures/services.ar.json';
import sectorsFixture from './fixtures/sectors.ar.json';
import articlesFixture from './fixtures/articles.ar.json';
import careersFixture from './fixtures/careers.ar.json';
import contactFixture from './fixtures/contact.ar.json';

import {
    HomePageWebSchema,
    ServicesPageWebSchema,
    SectorsPageWebSchema,
    ArticlesPageWebSchema,
    CareersPageWebSchema,
    ContactPageWebSchema,
} from '../src/validations/pages.schema';

describe('view-model-fixtures.test (T013)', () => {
    it('parses home.ar.json with HomePageWebSchema', () => {
        const result = HomePageWebSchema.safeParse(homeFixture);
        if (!result.success) console.error('HOME ERROR:', JSON.stringify(result.error.issues, null, 2));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.hero.title).toBe(homeFixture.hero.title);
            expect(result.data.reasons.pillars).toHaveLength(3);
        }
    });

    it('parses services.ar.json with ServicesPageWebSchema', () => {
        const result = ServicesPageWebSchema.safeParse(servicesFixture);
        if (!result.success) console.error('SERVICES ERROR:', JSON.stringify(result.error.issues, null, 2));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.hero.title).toBe(servicesFixture.hero.title);
        }
    });

    it('parses sectors.ar.json with SectorsPageWebSchema', () => {
        const result = SectorsPageWebSchema.safeParse(sectorsFixture);
        if (!result.success) console.error('SECTORS ERROR:', JSON.stringify(result.error.issues, null, 2));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.hero.title).toBe(sectorsFixture.hero.title);
        }
    });

    it('parses articles.ar.json with ArticlesPageWebSchema', () => {
        const result = ArticlesPageWebSchema.safeParse(articlesFixture);
        if (!result.success) console.error('ARTICLES ERROR:', JSON.stringify(result.error.issues, null, 2));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.hero.title).toBe(articlesFixture.hero.title);
        }
    });

    it('parses careers.ar.json with CareersPageWebSchema', () => {
        const result = CareersPageWebSchema.safeParse(careersFixture);
        if (!result.success) console.error('CAREERS ERROR:', JSON.stringify(result.error.issues, null, 2));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.hero.title).toBe(careersFixture.hero.title);
            expect(result.data.perks.items).toHaveLength(4);
        }
    });

    it('parses contact.ar.json with ContactPageWebSchema', () => {
        const result = ContactPageWebSchema.safeParse(contactFixture);
        if (!result.success) console.error('CONTACT ERROR:', JSON.stringify(result.error.issues, null, 2));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.hero.title).toBe(contactFixture.hero.title);
        }
    });
});
