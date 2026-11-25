import type { Lang } from '@/src/lib/i18n/dictionaries';

export interface FaqItemInput {
    question: string;
    answer: string;
}

export interface FaqJsonLdInput {
    lang: Lang;
    items?: FaqItemInput[] | null;
}

/**
 * Builds a schema.org FAQPage for service or contact FAQs.
 */
export function buildFaqJsonLd({ lang, items }: FaqJsonLdInput) {
    if (!items || items.length === 0) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };
}
