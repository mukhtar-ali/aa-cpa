import { markSanitizedHtml } from '@repo/design-system/lib';
import type { LegalDocument } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toActionRef } from './actions';

export const LEGAL_KEYS = ['privacy', 'terms', 'accessibility'] as const;
export type LegalKey = (typeof LEGAL_KEYS)[number];
export const isLegalKey = (value: string): value is LegalKey => (LEGAL_KEYS as readonly string[]).includes(value);

export interface LegalPageApi {
    version: string;
    updatedAt: string;
    hero: { title: string; subtitle?: string };
    summary: string[];
    sections: { id: string; title: string; body: string }[];
    pdfUrl?: string;
    questionCard?: { title: string; body: string; action: Parameters<typeof toActionRef>[0] };
    seo?: unknown;
}

/**
 * The API stores legal bodies as sanitised HTML (002 contract); the brand cast is the one place that says so, so a body from
 * anywhere else cannot reach `dangerouslySetInnerHTML` by accident.
 */
export function toLegalProps(api: LegalPageApi, lang: Lang) {
    const document: LegalDocument = {
        updatedAt: api.updatedAt,
        summary: api.summary,
        sections: api.sections.map((s) => ({ id: s.id, title: s.title, html: markSanitizedHtml(s.body) })),
        downloadHref: api.pdfUrl,
    };
    return { title: api.hero.title, subtitle: api.hero.subtitle, document, questionCard: api.questionCard && { ...api.questionCard, action: toActionRef(api.questionCard.action, lang) } };
}
