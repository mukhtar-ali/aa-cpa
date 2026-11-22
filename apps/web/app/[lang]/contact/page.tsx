import type { Metadata, ResolvingMetadata } from 'next';
import { buildPageMetadata, fetchPage } from '@/src/lib/server-data';
import { endpoint, type ContactFormSectionModelWeb, type ContactHeroSectionModelWeb, type WithPageSeo } from '@repo/shared';
import { getT } from '@/dictionaries/server';
import { ContactForm } from '@/src/components/contact/ContactForm';

type ContactPageWeb = WithPageSeo<{ hero: ContactHeroSectionModelWeb | null; form: ContactFormSectionModelWeb | null }>;

/** One API call: the Contact page's SEO, hero and form section. */
const loadContact = (lang: string) => fetchPage<ContactPageWeb>(endpoint.contact.pageWeb, lang);

export async function generateMetadata(
    { params }: { params: Promise<{ lang: string }> },
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const { lang } = await params;
    return buildPageMetadata((await loadContact(lang))?.seo, parent);
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const t = await getT();

    const page = await loadContact(lang);
    const hero = page?.hero;
    const formSection = page?.form;

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h1 className="page-title">{hero?.title || t.header.menu.contactUs}</h1>
            {hero?.subtitle && <p className="lead">{hero.subtitle}</p>}

            <section className="mt-10">
                {(formSection?.title || formSection?.description) && (
                    <div className="mb-6">
                        {formSection?.title && <h2 className="text-xl font-semibold">{formSection.title}</h2>}
                        {formSection?.description && (
                            <p className="mt-1 text-muted">{formSection.description}</p>
                        )}
                    </div>
                )}
                <ContactForm />
            </section>
        </div>
    );
}
