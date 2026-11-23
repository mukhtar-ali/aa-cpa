import { describe, expect, it } from 'vitest';
import { careersHref, toCareersProps, toJobDetailProps } from './careers';

const job = { id: '1', slug: 'auditor', title: 'Auditor', department: 'Audit', city: 'Riyadh', contract: 'Full time', experience: '3y' };

describe('careers mapper', () => {
    it('builds job links from the slug and marks the active department', () => {
        const p = toCareersProps({ hero: { title: 'T' }, perks: { eyebrow: 'e', title: 't', items: [] }, jobsEyebrow: 'j', jobsTitle: 'J', items: [job], departments: [{ id: '1', slug: 'audit', name: 'Audit' }, { id: '2', slug: 'tax', name: 'Tax' }] }, 'en', 'audit');
        expect(p.jobs.items[0].href).toBe('/en/careers/auditor');
        expect(p.departments.map((d) => d.active)).toEqual([true, false]);
        expect(p.departments[1].href).toBe('/en/careers?department=tax');
    });
    it('numbers hiring steps', () => {
        const p = toCareersProps({ hero: { title: 'T' }, perks: { eyebrow: '', title: '', items: [] }, jobsEyebrow: '', jobsTitle: '', hiringSteps: { eyebrow: '', title: '', steps: [{ title: 'a', body: 'b' }, { title: 'c', body: 'd' }] } }, 'ar');
        expect(p.hiring?.steps.map((s) => s.index)).toEqual([1, 2]);
    });
    it('treats a missing isOpen as open and lists the facts that exist', () => {
        const d = toJobDetailProps({ ...job, body: '', responsibilities: [], requirements: [], isOpen: undefined as never }, 'ar');
        expect(d.isOpen).toBe(true);
        expect(d.facts.map(([k]) => k)).toEqual(['department', 'city', 'contract', 'experience']);
        expect(careersHref('ar')).toBe('/ar/careers');
    });
});
