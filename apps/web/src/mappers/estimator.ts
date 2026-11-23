import type { EstimatorLabels, EstimatorQuestion, Testimonial } from '@repo/design-system/types';
import { toImageRef, type ImageLike } from './image';

/** `estimator` block of a page payload (`getPublicEstimator`); `null` when the estimator is not approved. */
export interface EstimatorApi {
    currency: string;
    disclaimer: string;
    questions: { id: string; title: string; subtitle?: string; type: string; options?: { id: string; label: string; value: string | number }[] }[];
    labels?: Partial<EstimatorLabels> & Record<string, string>;
}

export interface TestimonialApi {
    quote: string;
    rating?: number;
    name: string;
    role: string;
    company?: string;
    avatar?: ImageLike;
}

/** API question types → the design-system kinds. Unknown types are treated as a number input. */
const KIND: Record<string, EstimatorQuestion['kind']> = { select: 'choice', choice: 'choice', radio: 'choice', number: 'number', currency: 'currency' };

export function toEstimatorQuestions(api: EstimatorApi): EstimatorQuestion[] {
    return api.questions.map((q) => {
        const kind = KIND[q.type] ?? 'number';
        return {
            id: q.id,
            prompt: q.title,
            ...(q.subtitle ? { hint: q.subtitle } : {}),
            kind,
            ...(kind === 'choice' ? { options: (q.options ?? []).map((o) => ({ value: String(o.value), label: o.label })) } : { min: 0 }),
        };
    });
}

export function toEstimatorLabels(api: EstimatorApi, fallback: EstimatorLabels): EstimatorLabels {
    const l = api.labels ?? {};
    const pick = (key: keyof EstimatorLabels) => (typeof l[key] === 'string' && l[key] ? (l[key] as string) : fallback[key]);
    return { progress: pick('progress'), next: pick('next'), back: pick('back'), start: pick('start'), result: pick('result'), disclaimer: api.disclaimer || fallback.disclaimer, restart: pick('restart'), invalid: pick('invalid'), error: pick('error') };
}

export function toTestimonial(t: TestimonialApi | null | undefined): Testimonial | undefined {
    if (!t) return undefined;
    const rating = [1, 2, 3, 4, 5].includes(Number(t.rating)) ? (Number(t.rating) as Testimonial['rating']) : undefined;
    return { quote: t.quote, rating, name: t.name, role: t.role, company: t.company, avatar: toImageRef(t.avatar, { decorative: true }) };
}

/** Coarse band of the lower bound, for analytics (never the exact estimate): `<25k`, `25k-50k`, `50k-100k`, `100k+`. */
export function rangeBand(min: number): string {
    if (min < 25_000) return '<25k';
    if (min < 50_000) return '25k-50k';
    if (min < 100_000) return '50k-100k';
    return '100k+';
}

/** Every page payload that shows the estimator section carries these two (null when not approved / none published). */
export interface WithEstimator {
    estimator?: EstimatorApi | null;
    testimonial?: TestimonialApi | null;
}
