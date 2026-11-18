import type { Metadata, ResolvingMetadata } from 'next';
import { buildPageMetadata, fetchPage } from '@/src/lib/server-data';
import Image from 'next/image';
import { endpoint, type AboutModelWeb, type WithPageSeo } from '@repo/shared';
import { getT } from '@/dictionaries/server';

/** One API call: the About page's SEO and all of its sections. */
const loadAbout = (lang: string) => fetchPage<WithPageSeo<AboutModelWeb>>(endpoint.about.web, lang);

export async function generateMetadata(
    { params }: { params: Promise<{ lang: string }> },
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const { lang } = await params;
    return buildPageMetadata((await loadAbout(lang))?.seo, parent);
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const t = await getT();
    const about = await loadAbout(lang);

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <h1 className="page-title">{about?.hero?.title || t.header.menu.about}</h1>
            {about?.hero?.subtitle && <p className="lead">{about.hero.subtitle}</p>}

            {about?.content && (about.content.description || about.content.bigImage?.desktop) && (
                <section className="mt-16 grid gap-8 sm:grid-cols-2">
                    <div className="relative">
                        {about.content.bigImage?.desktop && (
                            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                                <Image src={about.content.bigImage.desktop} alt={about.content.bigImageTitle || ''} fill className="object-cover" />
                            </div>
                        )}
                        {about.content.smallImage?.desktop && (
                            <div className="relative mt-4 aspect-[4/3] w-2/3 overflow-hidden rounded-lg border-4 border-bg sm:absolute sm:-bottom-8 sm:-end-8 sm:mt-0">
                                <Image src={about.content.smallImage.desktop} alt={about.content.smallImageTitle || ''} fill className="object-cover" />
                            </div>
                        )}
                    </div>
                    <div>
                        {about.content.bigImageTitle && <h2 className="section-title">{about.content.bigImageTitle}</h2>}
                        {about.content.smallImageTitle && <p className="mt-1 text-muted">{about.content.smallImageTitle}</p>}
                        {about.content.description && (
                            <p className="mt-4 leading-relaxed text-muted">{about.content.description}</p>
                        )}
                    </div>
                </section>
            )}

            {about?.missionVision && (about.missionVision.mission?.title || about.missionVision.vision?.title) && (
                <section className="mt-16 grid gap-6 sm:grid-cols-2">
                    {([about.missionVision.mission, about.missionVision.vision] as const).map(
                        (card, i) =>
                            card &&
                            (card.title || card.description) && (
                                <div key={i} className="card p-6">
                                    {card.image?.desktop && (
                                        <Image src={card.image.desktop} alt={card.title || ''} width={48} height={48} className="mb-3" />
                                    )}
                                    {card.title && <h3 className="text-xl font-semibold">{card.title}</h3>}
                                    {card.description && <p className="mt-2 text-muted">{card.description}</p>}
                                </div>
                            )
                    )}
                </section>
            )}

            {about?.coreValues?.items && about.coreValues.items.length > 0 && (
                <section className="mt-16">
                    {about.coreValues.title && <h2 className="section-title">{about.coreValues.title}</h2>}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {about.coreValues.items.map((item) => (
                            <div key={item.id} className="card p-5">
                                {item.icon && <Image src={item.icon} alt={item.title || ''} width={40} height={40} className="mb-3" />}
                                {item.title && <h3 className="font-semibold">{item.title}</h3>}
                                {item.description && <p className="mt-2 text-sm text-muted">{item.description}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {about?.leadership?.items && about.leadership.items.length > 0 && (
                <section className="mt-16">
                    <h2 className="section-title">Leadership</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {about.leadership.items.map((member) => (
                            <div key={member.id}>
                                {member.image?.desktop && (
                                    <Image
                                        src={member.image.desktop}
                                        alt={member.name || ''}
                                        width={200}
                                        height={200}
                                        className="aspect-square w-full rounded-lg object-cover"
                                    />
                                )}
                                <h3 className="mt-3 font-semibold">{member.name}</h3>
                                {member.jobTitle && <p className="text-sm text-muted">{member.jobTitle}</p>}
                                {member.linkedinUrl && (
                                    <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm underline text-muted">
                                        {t.linkedin}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {about?.partners?.items && about.partners.items.length > 0 && (
                <section className="mt-16 mb-4">
                    <div className="flex flex-wrap items-center gap-8">
                        {about.partners.items.map((partner) =>
                            partner.image ? (
                                partner.websiteUrl ? (
                                    <a key={partner.id} href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                                        <Image src={partner.image} alt={partner.title || ''} width={120} height={60} className="object-contain" />
                                    </a>
                                ) : (
                                    <Image key={partner.id} src={partner.image} alt={partner.title || ''} width={120} height={60} className="object-contain" />
                                )
                            ) : null
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
