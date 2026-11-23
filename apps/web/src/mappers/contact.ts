import type { ContactChannel, FaqItem, ImageRef, Office } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toPageHero, type HeroApi } from './hero';
import { toImageRef, type ImageLike } from './image';

export interface ContactPageApi {
    hero: HeroApi;
    intro: { eyebrow: string; title: string; body: string };
    form: { title: string; subtitle: string; successTitle: string; successBody: string };
    offices: { eyebrow: string; title: string; mapImage?: ImageLike; items?: { city: string; address: string; mapHref?: string; coordinates?: { x: number; y: number }; isHeadquarters?: boolean }[] } | unknown[];
    faq?: { eyebrow: string; title: string; items?: FaqItem[] };
    serviceOptions?: { id: string; slug: string; title: string }[];
    seo?: unknown;
}

/** Contact page content parts (channels, offices map, FAQ). The form itself is wired in US2 (T031). */
export function toContactProps(api: ContactPageApi, lang: Lang, mapLabel: string, channels: ContactChannel[]) {
    const officesBlock = Array.isArray(api.offices) ? { eyebrow: '', title: '', items: api.offices as NonNullable<Extract<ContactPageApi['offices'], { items?: unknown }>['items']> } : api.offices;
    const offices: Office[] = (officesBlock.items ?? []).map((o) => ({ city: o.city, address: o.address, mapHref: o.mapHref, mapLabel: o.mapHref ? mapLabel : undefined, coordinates: o.coordinates, isHeadquarters: o.isHeadquarters }));
    const mapImage: ImageRef | undefined = 'mapImage' in officesBlock ? toImageRef(officesBlock.mapImage, { decorative: true }) : undefined;
    return {
        hero: toPageHero(api.hero, lang),
        intro: api.intro,
        channels,
        form: api.form,
        serviceOptions: api.serviceOptions ?? [],
        offices: { eyebrow: officesBlock.eyebrow, title: officesBlock.title, items: offices, mapImage },
        faq: api.faq && { eyebrow: api.faq.eyebrow, title: api.faq.title, items: (api.faq.items ?? []).map(({ id, question, answer }) => ({ id, question, answer })) },
    };
}
