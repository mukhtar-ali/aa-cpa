import { notFound } from 'next/navigation';
import { EmptyState } from '@repo/design-system/sections';
import { getLabels, isLang } from '@/src/lib/i18n/dictionaries';

/** Placeholder until the CMS-driven home page (T017) lands; keeps the locale root from 404ing meanwhile. */
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    const { states } = getLabels(lang);
    return <EmptyState title={states.emptyTitle} body={states.emptyBody} />;
}
