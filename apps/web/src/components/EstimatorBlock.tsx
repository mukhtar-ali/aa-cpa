import { Container } from '@repo/design-system/layout';
import { Button } from '@repo/design-system/primitives';
import { getLabels, type Lang } from '@/src/lib/i18n/dictionaries';
import { localizeHref } from '@/src/mappers/href';
import { toEstimatorLabels, toEstimatorQuestions, toTestimonial, type EstimatorApi, type TestimonialApi } from '@/src/mappers/estimator';
import { EstimatorClient } from './EstimatorClient';

interface Props {
    lang: Lang;
    /** From the page payload. Service pages have none today (their payload carries no estimator or testimonial), so they get the call to action. */
    estimator?: EstimatorApi | null;
    testimonial?: TestimonialApi | null;
    serviceId?: string;
}

/** Estimator section (FR-006). When the estimator is not approved (or the API has none) it shows a contact call to action instead. */
export async function EstimatorBlock({ lang, estimator, testimonial, serviceId }: Props) {
    const labels = getLabels(lang).estimator;
    const config = estimator ?? null;
    const t = toTestimonial(testimonial);

    if (!config || config.questions.length === 0 || !t) {
        return (
            <section className="bg-bg-hero py-section-lg text-text-inverse">
                <Container className="flex flex-col items-start gap-4">
                    <h2 className="text-h2 font-bold">{labels.fallbackTitle}</h2>
                    <p className="text-body-lg">{labels.fallbackBody}</p>
                    <Button href={localizeHref(lang, '/contact')}>{labels.fallbackCta}</Button>
                </Container>
            </section>
        );
    }
    const fallback = { progress: labels.progress, next: labels.next, back: labels.back, start: labels.start, result: labels.result, disclaimer: labels.disclaimer, restart: labels.restart, invalid: labels.invalid, error: labels.error };
    return <EstimatorClient lang={lang} labels={labels} questions={toEstimatorQuestions(config)} estimatorLabels={toEstimatorLabels(config, fallback)} testimonial={t} serviceId={serviceId} />;
}
