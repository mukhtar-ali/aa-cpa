import Link from 'next/link';
import { notFound } from 'next/navigation';
import { endpoint, type PaginatorModel, type ProjectModelWeb, type UnitModelWeb } from '@repo/shared';
import { getDictionary, hasLocale } from '@/dictionaries/server';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

/** "1 Bedroom" / "2 Bedrooms" and Arabic's one/two/few/many forms, chosen by the locale's plural rule. */
function bedroomsLabel(forms: Record<string, string>, lang: string, count: number): string {
    const template = forms[new Intl.PluralRules(lang).select(count)] ?? forms.other;
    return template.replace('{n}', String(count));
}

export default async function ProjectPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
    const { lang, slug } = await params;
    if (!hasLocale(lang)) notFound();
    const t = (await getDictionary(lang)).units;

    const res = await fetch(`${BASE_URL}${endpoint.project.getBySlug}/${encodeURIComponent(slug)}`, {
        headers: { 'Accept-Language': lang },
        next: { revalidate: 60 },
    });

    if (!res.ok) notFound();
    const project = (await res.json()) as ProjectModelWeb;

    let units: UnitModelWeb[] = [];
    try {
        const unitsRes = await fetch(`${BASE_URL}${endpoint.units.listWeb}?projectId=${project.id}&pageSize=50`, {
            headers: { 'Accept-Language': lang },
            next: { revalidate: 60 },
        });
        if (unitsRes.ok) units = ((await unitsRes.json()) as PaginatorModel<UnitModelWeb>).items ?? [];
    } catch {
        // A units failure must not take the project page down.
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h1 className="page-title">{project.title || project.slug}</h1>
            {project.subtitle && <p className="lead">{project.subtitle}</p>}
            {project.description && <p className="mt-6 leading-relaxed text-muted">{project.description}</p>}

            {units.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-xl font-semibold">{t.title}</h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {units.map((u) => (
                            <li key={u.id}>
                                <Link
                                    href={`/${lang}/${slug}/units/${u.slug}`}
                                    className="card card-link p-4"
                                >
                                    <span className="font-medium">{u.title || u.slug}</span>
                                    {(u.bedrooms > 0 || u.price) && (
                                        <span className="mt-1 block text-sm text-muted">
                                            {u.bedrooms > 0 && bedroomsLabel(t.bedroomsPlural, lang, u.bedrooms)}
                                            {u.bedrooms > 0 && u.price && ' · '}
                                            {u.price}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
