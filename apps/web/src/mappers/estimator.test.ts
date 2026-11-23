import { describe, expect, it } from 'vitest';
import { rangeBand, toEstimatorLabels, toEstimatorQuestions, toTestimonial } from './estimator';

const fallback = { progress: 'p', next: 'n', back: 'b', start: 's', result: 'r', disclaimer: 'd', restart: 'x', invalid: 'i', error: 'e' };

describe('estimator mapper', () => {
    it('maps question types and options', () => {
        const q = toEstimatorQuestions({ currency: 'SAR', disclaimer: 'd', questions: [{ id: 'a', title: 'A', type: 'select', options: [{ id: '1', label: 'One', value: 'one' }] }, { id: 'b', title: 'B', type: 'weird' }] });
        expect(q[0]).toMatchObject({ kind: 'choice', options: [{ value: 'one', label: 'One' }] });
        expect(q[1].kind).toBe('number');
    });
    it('prefers API labels and the API disclaimer, else the fallback', () => {
        const l = toEstimatorLabels({ currency: 'SAR', disclaimer: 'API disclaimer', questions: [], labels: { next: 'Weiter' } }, fallback);
        expect(l).toMatchObject({ next: 'Weiter', back: 'b', disclaimer: 'API disclaimer' });
    });
    it('drops an out-of-range rating and handles no testimonial', () => {
        expect(toTestimonial(null)).toBeUndefined();
        expect(toTestimonial({ quote: 'q', rating: 9, name: 'n', role: 'r' })?.rating).toBeUndefined();
    });
    it('bands the range without exposing it', () => {
        expect([rangeBand(1000), rangeBand(30000), rangeBand(60000), rangeBand(500000)]).toEqual(['<25k', '25k-50k', '50k-100k', '100k+']);
    });
});
