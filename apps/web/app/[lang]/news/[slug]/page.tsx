import Image from 'next/image';
import { notFound } from 'next/navigation';
import { endpoint, type NewsModelWeb } from '@repo/shared';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

export default async function NewsArticlePage({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}) {
    const { lang, slug } = await params;

    const res = await fetch(`${BASE_URL}${endpoint.news.getBySlugWeb}/${encodeURIComponent(slug)}`, {
        headers: { 'Accept-Language': lang },
        next: { revalidate: 60 },
    });

    if (!res.ok) notFound();
    const article = (await res.json()) as NewsModelWeb;

    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <span className="text-xs font-semibold text-brand">{article.tag}</span>
            <h1 className="mt-1 page-title">{article.title || article.slug}</h1>
            {article.thumbnail && (
                <Image
                    src={article.thumbnail}
                    alt={article.title || article.slug || ''}
                    width={800}
                    height={450}
                    className="mt-6 aspect-video w-full rounded-lg object-cover"
                />
            )}
            {/* article.body is sanitized server-side (sanitize-html) on every create/update
                before it's persisted — see apps/api/src/common/sanitize-html.util.ts. */}
            {article.body && (
                <div
                    className="rich-text mt-8"
                    dangerouslySetInnerHTML={{ __html: article.body }}
                />
            )}
        </article>
    );
}
