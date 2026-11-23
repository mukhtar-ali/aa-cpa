import type { LogoItem, Office, ImageRef, ActionRef } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toActionRef } from './actions';
import { toPageHero, type HeroApi } from './hero';
import { localizeHref } from './href';
import { toImageRef, type ImageLike } from './image';

type Act = Parameters<typeof toActionRef>[0];

/** `/api/pages/about` (shape: `AboutPageWebSchema` plus `clients`, `offices`, `credentials`). */
export interface AboutApi {
    hero: HeroApi;
    statement: string;
    licenceBody: string;
    action?: Act;
    signatoryBlock?: { eyebrow: string; title: string; accent?: string; paragraphs: string[]; action?: Act; image?: ImageLike; caption?: string };
    commitments: { title: string; subtitle?: string; items: { title: string; body: string }[] };
    officesTitle?: string;
    partnerQuote?: { title: string; body: string; action?: Act; image?: ImageLike };
    clients?: { name: string; image?: ImageLike; href?: string; row?: number }[];
    offices?: { city: string; address: string; mapHref?: string; image?: ImageLike; isHeadquarters?: boolean; coordinates?: { x: number; y: number } }[];
}

/** Two marquee rows from the flat client list: the CMS `row` wins, otherwise alternate. */
export function clientRows(clients: NonNullable<AboutApi['clients']>): LogoItem[][] {
    const rows: LogoItem[][] = [[], []];
    clients.forEach((c, i) => {
        const row = c.row === 2 ? 1 : c.row === 1 ? 0 : i % 2;
        rows[row].push({ name: c.name, image: toImageRef(c.image), ...(c.href ? { href: c.href } : {}) });
    });
    return rows.filter((r) => r.length > 0);
}

export function toAboutProps(api: AboutApi, lang: Lang, mapLabel: string) {
    const offices: Office[] = (api.offices ?? []).map((o) => ({
        city: o.city,
        address: o.address,
        mapHref: o.mapHref,
        mapLabel: o.mapHref ? mapLabel : undefined,
        image: toImageRef(o.image, { decorative: true }),
        isHeadquarters: o.isHeadquarters,
        coordinates: o.coordinates,
    }));
    const sig = api.signatoryBlock;
    return {
        hero: toPageHero(api.hero, lang),
        intro: { statement: api.statement, body: api.licenceBody, action: api.action ? toActionRef(api.action, lang) : undefined },
        marqueeRows: clientRows(api.clients ?? []),
        signatory: sig && { ...sig, action: sig.action ? toActionRef(sig.action, lang) : undefined, image: toImageRef(sig.image, { decorative: !sig.caption }) as ImageRef | undefined },
        commitments: api.commitments,
        offices: { title: api.officesTitle, items: offices },
        quote: api.partnerQuote && { title: api.partnerQuote.title, body: api.partnerQuote.body, action: api.partnerQuote.action ? toActionRef(api.partnerQuote.action, lang) as ActionRef : undefined, image: toImageRef(api.partnerQuote.image) },
        localize: (href: string) => localizeHref(lang, href),
    };
}
export type AboutProps = ReturnType<typeof toAboutProps>;
