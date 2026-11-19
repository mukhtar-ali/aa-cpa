import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { endpoint, safeHttpUrl, type PaginatorModel, type ProjectModelWeb, type UnitModelWeb } from '@repo/shared';
import { getDictionary, hasLocale } from '@/dictionaries/server';
import { UnitInquiryForm } from '@/src/components/units/UnitInquiryForm';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

async function getJson<T>(path: string, lang: string): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${path}`, { headers: { 'Accept-Language': lang }, next: { revalidate: 60 } });
        return res.ok ? ((await res.json()) as T) : null;
    } catch {
        return null;
    }
}

export default async function UnitPage({ params }: { params: Promise<{ lang: string; slug: string; unitSlug: string }> }) {
    const { lang, slug, unitSlug } = await params;
    if (!hasLocale(lang)) notFound();
    const t = (await getDictionary(lang)).units;

    const [unit, project] = await Promise.all([
        getJson<UnitModelWeb>(`${endpoint.units.getBySlugWeb}/${encodeURIComponent(unitSlug)}`, lang),
        getJson<ProjectModelWeb>(`${endpoint.project.getBySlug}/${encodeURIComponent(slug)}`, lang),
    ]);
    if (!unit || !project) notFound();

    const related = await getJson<PaginatorModel<UnitModelWeb>>(
        `${endpoint.units.listWeb}?projectId=${project.id}&pageSize=4`,
        lang,
    );
    const relatedUnits = (related?.items ?? []).filter((u) => u.slug !== unit.slug).slice(0, 3);

    const hero = safeHttpUrl(unit.thumbnail);
    const gallery = (unit.gallery ?? [])
        .filter((g) => g.mediaType === 'image')
        .map((g) => safeHttpUrl(g.image?.desktop))
        .filter((u): u is string => Boolean(u));

    const facts: [string, string | number | undefined][] = [
        [t.type, unit.type],
        [t.area, unit.area],
        [t.bedrooms, unit.bedrooms || undefined],
        [t.bathrooms, unit.bathrooms || undefined],
        [t.floor, unit.floor],
        [t.building, unit.building],
        [t.view, unit.view],
        [t.delivery, unit.delivery],
        [t.status, unit.status],
        [t.price, unit.price],
        [t.pricePerMeter, unit.pricePerMeter],
    ];

    return (
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <Link href={`/${lang}/${slug}`} className="text-sm text-muted hover:text-fg">
                ← {t.backToProject}
            </Link>
            <h1 className="mt-3 page-title">{unit.title || unit.slug}</h1>

            {hero && (
                // unoptimized: CMS image hosts are configurable, so they are not limited to next.config remotePatterns.
                <Image
                    src={hero}
                    alt={unit.title || ''}
                    width={1200}
                    height={675}
                    unoptimized
                    priority
                    className="mt-6 aspect-video w-full rounded-lg object-cover"
                />
            )}

            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {facts
                    .filter(([, v]) => v !== undefined && v !== '')
                    .map(([label, value]) => (
                        <div key={label}>
                            <dt className="text-xs text-muted">{label}</dt>
                            <dd className="mt-0.5 font-medium">{value}</dd>
                        </div>
                    ))}
            </dl>

            {(unit.overViewTitle || unit.overViewDescription) && (
                <section className="mt-10">
                    {unit.overViewTitle && <h2 className="text-xl font-semibold">{unit.overViewTitle}</h2>}
                    {unit.overViewDescription && (
                        <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{unit.overViewDescription}</p>
                    )}
                </section>
            )}

            {unit.overViewFeatures?.some(Boolean) && (
                <section className="mt-8">
                    <h2 className="text-xl font-semibold">{t.features}</h2>
                    <ul className="mt-2 list-disc space-y-1 ps-5 text-muted">
                        {unit.overViewFeatures.filter(Boolean).map((f, i) => (
                            <li key={`${i}-${f}`}>{f}</li>
                        ))}
                    </ul>
                </section>
            )}

            {gallery.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-xl font-semibold">{t.gallery}</h2>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {gallery.map((src, i) => (
                            <Image
                                key={`${i}-${src}`}
                                src={src}
                                alt={`${unit.title || ''} ${i + 1}`}
                                width={600}
                                height={400}
                                unoptimized
                                className="aspect-[3/2] w-full rounded-md object-cover"
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-12">
                <h2 className="mb-4 text-xl font-semibold">{t.inquireTitle}</h2>
                <UnitInquiryForm unitId={unit.id} projectId={project.id} />
            </section>

            {relatedUnits.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-xl font-semibold">{t.related}</h2>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                        {relatedUnits.map((u) => (
                            <li key={u.id}>
                                <Link
                                    href={`/${lang}/${slug}/units/${u.slug}`}
                                    className="card card-link p-3"
                                >
                                    {u.title || u.slug}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    );
}
