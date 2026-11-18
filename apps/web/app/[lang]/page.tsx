import type { Metadata, ResolvingMetadata } from 'next';
import { buildPageMetadata, fetchPage } from '@/src/lib/server-data';
import Image from 'next/image';
import Link from 'next/link';
import { endpoint, HomeModelWeb, PaginatorModel, ProjectModelWeb, type WithPageSeo } from '@repo/shared';
import { getT } from '@/dictionaries/server';
import { Animations } from '@/src/animations/Animations';
import { AnimationType } from '@/src/animations/animation';
import { HeroSlider } from './_components/hero-slider';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

// The API localizes by Accept-Language (and ?lang=). Without the header every /ar request got the
// English content (MUK-467), so it is sent on every call from here.
async function fetchJson<T>(url: string, lang: string): Promise<T | null> {
    try {
        const res = await fetch(BASE_URL + url, {
            headers: { 'Accept-Language': lang },
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return res.json() as Promise<T>;
    } catch {
        return null;
    }
}

/** One API call: the home page's SEO, hero slider, showcase and about teaser. */
const loadHome = (lang: string) => fetchPage<WithPageSeo<HomeModelWeb>>(endpoint.home.web, lang);

export async function generateMetadata(
    { params }: { params: Promise<{ lang: string }> },
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const { lang } = await params;
    return buildPageMetadata((await loadHome(lang))?.seo, parent);
}

export default async function HomePage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { lang } = await params;
    const { q } = await searchParams;
    const t = await getT();

    // `lang` is also in the URL so the cached response for /en and /ar can never be shared.
    const projectsUrl = q
        ? `${endpoint.project.listWeb}?search=${encodeURIComponent(q)}&lang=${lang}`
        : `${endpoint.project.listWeb}?lang=${lang}`;

    const [home, projects] = await Promise.all([
        loadHome(lang),
        fetchJson<PaginatorModel<ProjectModelWeb>>(projectsUrl, lang),
    ]);

    return (
        <Animations
            animations={[
                AnimationType.SmoothScroll,
                AnimationType.Header,
                AnimationType.Footer,
                AnimationType.FadeUp,
                AnimationType.Line,
                AnimationType.HomePage,
            ]}
        >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                {home?.hero?.slides && home.hero.slides.length > 0 ? (
                    <HeroSlider slides={home.hero.slides} lang={lang} />
                ) : (
                    <h1 className="animate-line page-title sm:text-5xl">
                        {t.home.exploreProjects}
                    </h1>
                )}

                {home?.showcase && (home.showcase.description || home.showcase.leftImage?.desktop) && (
                    <section className="mt-16">
                        {home.showcase.description && (
                            <p className="animate-fade-up max-w-2xl text-muted">{home.showcase.description}</p>
                        )}
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            {[home.showcase.leftImage, home.showcase.middleImage, home.showcase.rightImage].map(
                                (img, i) =>
                                    img?.desktop && (
                                        <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                                            <Image src={img.desktop} alt="" fill className="object-cover" />
                                        </div>
                                    )
                            )}
                        </div>
                    </section>
                )}

                {home?.aboutTeaser && (home.aboutTeaser.text || home.aboutTeaser.image?.desktop) && (
                    <section className="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                        {home.aboutTeaser.image?.desktop && (
                            <div className="relative aspect-video w-full flex-1 overflow-hidden rounded-lg sm:aspect-square sm:max-w-sm">
                                <Image src={home.aboutTeaser.image.desktop} alt="" fill className="object-cover" />
                            </div>
                        )}
                        <div className="flex-1">
                            {home.aboutTeaser.text && (
                                <p className="max-w-xl text-muted">{home.aboutTeaser.text}</p>
                            )}
                            {home.aboutTeaser.anchorLabel && home.aboutTeaser.anchorUrl && (
                                <Link
                                    href={home.aboutTeaser.anchorUrl}
                                    className="btn btn-outline mt-4"
                                >
                                    {home.aboutTeaser.anchorLabel}
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                <section id="projects" className="mt-16">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="animate-fade-up section-title">{t.header.menu.projects}</h2>
                        <form className="flex items-center gap-2" action={`/${lang}`}>
                            <input
                                type="search"
                                name="q"
                                defaultValue={q ?? ''}
                                placeholder={t.search.placeholder}
                                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                className="field w-56"
                            />
                            <button
                                type="submit"
                                className="btn btn-outline"
                            >
                                {t.fields.submit}
                            </button>
                            {q && (
                                <Link href={`/${lang}#projects`} className="text-sm underline text-muted">
                                    {t.search.clear}
                                </Link>
                            )}
                        </form>
                    </div>

                    {projects?.items.length === 0 && (
                        <p className="empty">
                            {q ? `${t.search.noResults} "${q}"` : 'No projects published yet.'}
                        </p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects?.items.map((p) => (
                            <Link
                                key={p.slug}
                                href={`/${lang}/${p.slug}`}
                                className="animate-fade-up card card-link p-5"
                            >
                                <h3 className="font-semibold">{p.title || p.slug}</h3>
                                {p.location && <p className="mt-1 text-sm text-muted">{p.location}</p>}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </Animations>
    );
}
