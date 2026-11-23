import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { endpoint } from '@repo/shared';
import { Container, Section } from '@repo/design-system/layout';
import { Heading, Text } from '@repo/design-system/primitives';
import { LegalDocument } from '@repo/design-system/sections';
import { getPage, tryGetPage } from '@/src/lib/api/pages';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';
import { buildMetadata } from '@/src/lib/seo/page-metadata';
import { isLegalKey, toLegalProps, type LegalPageApi } from '@/src/mappers/legal';
import { toPageSeo } from '@/src/mappers/seo';

type Props = { params: Promise<{ lang: string; legal: string }> };

// Rendered on first request and then cached by tag (no generateStaticParams): CI builds the web app without an API, and a build-time
// prerender would fail there. Any key other than the known ones is a 404 below.

const path = (key: string) => `/api/pages/legal/${key}`;

// Rendered per request: CI builds the web app without an API, so a build-time prerender would fail. The API calls themselves are
// cached and revalidated by tag (`apiGet`), so this does not hit the API on every visit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, legal } = await params;
    if (!isLang(lang) || !isLegalKey(legal)) return {};
    const page = await tryGetPage<LegalPageApi>(path(legal), `legal:${legal}`, lang);
    return buildMetadata({ lang, path: `/${legal}`, seo: toPageSeo(page?.seo), fallbackTitle: page?.hero.title ?? legal });
}

/** Privacy (525:3854), Terms (525:4136) and Accessibility share the legal layout; the content comes from the CMS. */
export default async function LegalPage({ params }: Props) {
    const { lang, legal } = await params;
    if (!isLang(lang) || !isLegalKey(legal)) notFound();
    const labels = getLabels(lang);
    const l = toLegalProps(await getPage<LegalPageApi>(path(legal), `legal:${legal}`, lang), lang);
    const p = labels.pages;

    return (
        <>
            <Section tone="hero">
                <Container className="flex flex-col gap-4 pt-24">
                    <Heading level={1} tone="inverse">{l.title}</Heading>
                    {l.subtitle && <Text tone="inverse">{l.subtitle}</Text>}
                </Container>
            </Section>
            <Section tone="ice">
                <Container>
                    <LegalDocument
                        document={l.document}
                        locale={lang}
                        labels={{ tocTitle: p.tocTitle, tocLabel: p.tocLabel, updated: p.updated, summary: p.summary, helpTitle: l.questionCard?.title ?? p.helpTitle, helpBody: l.questionCard?.body ?? p.helpBody, download: p.download }}
                    />
                </Container>
            </Section>
        </>
    );
}
