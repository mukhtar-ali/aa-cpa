'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { EstimatorSection } from '@repo/design-system/sections';
import type { EstimatorLabels, EstimatorQuestion, Testimonial } from '@repo/design-system/types';
import { estimate, requestQuote } from '@/src/actions/estimator';
import { track } from '@/src/lib/analytics';
import type { Labels, Lang } from '@/src/lib/i18n/dictionaries';
import { rangeBand } from '@/src/mappers/estimator';

interface Props {
    lang: Lang;
    labels: Labels['estimator'];
    questions: EstimatorQuestion[];
    estimatorLabels: EstimatorLabels;
    testimonial: Testimonial;
    /** Service the page is about, passed along with the quote request for the lead. */
    serviceId?: string;
}

/** Binds the design-system estimator to the `estimate` and `requestQuote` Server Actions and fires the analytics events. */
export function EstimatorClient({ lang, labels, questions, estimatorLabels, testimonial, serviceId }: Props) {
    const pathname = usePathname();
    const startedAt = useRef(Date.now());
    return (
        <EstimatorSection
            heading={labels.heading}
            intro={labels.intro}
            testimonial={testimonial}
            ratingLabel={labels.rating}
            estimator={{
                title: labels.cardTitle,
                intro: labels.cardIntro,
                locale: lang,
                config: {
                    questions,
                    labels: estimatorLabels,
                    currency: 'SAR',
                    estimate: async (answers) => {
                        const result = await estimate(lang, answers);
                        if (!result.ok || !result.range) throw new Error(result.error ?? 'generic');
                        track('estimate_completed', { ...(serviceId ? { service_id: serviceId } : {}), lang });
                        return { min: result.range.min, max: result.range.max };
                    },
                    quote: {
                        label: labels.quote,
                        fields: { name: labels.name, mobile: labels.mobile, email: labels.email, consent: labels.consent },
                        submitLabel: labels.submit,
                        successMessage: labels.success,
                        onSubmit: async (data, answers, range) => {
                            const result = await requestQuote(lang, { ...data, answers, range, startedAt: startedAt.current, landingPath: pathname });
                            if (!result.ok) throw new Error(result.error ?? 'generic');
                            track('quote_requested', { ...(serviceId ? { service_id: serviceId } : {}), range_band: rangeBand(range.min), lang });
                        },
                    },
                },
            }}
        />
    );
}
