'use client';

import { EstimatorSection } from '@repo/design-system/sections';
import type { HomeContent } from './content.types';

/**
 * Client wrapper: the estimator needs functions (estimate, quote submit), which cannot be passed from a server component. This mock
 * computes a range from the revenue answer; the real API call arrives in feature 003.
 */
export function ReferenceEstimator({ content, locale }: { content: HomeContent['estimator']; locale: 'ar' | 'en' }) {
    const { quote } = content;
    return (
        <EstimatorSection
            className="lg:min-h-[728px]"
            heading={content.heading}
            intro={content.intro}
            testimonial={content.testimonial}
            ratingLabel={content.ratingLabel}
            estimator={{
                title: content.cardTitle,
                intro: content.cardIntro,
                locale,
                config: {
                    questions: content.questions,
                    labels: content.labels,
                    currency: 'SAR',
                    estimate: async (answers) => {
                        const revenue = Number(answers.revenue ?? 0);
                        const base = Math.max(25000, Math.round((revenue * 0.004) / 5000) * 5000);
                        return { min: base, max: Math.round(base * 1.4) };
                    },
                    quote: {
                        ...quote,
                        onSubmit: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 400));
                        },
                    },
                },
            }}
        />
    );
}
