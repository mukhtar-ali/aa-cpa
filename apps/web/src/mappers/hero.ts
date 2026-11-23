import type { ActionRef, ImageRef, LinkRef } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toActionRef } from './actions';
import { localizeHref } from './href';
import { toImageRef, type ImageLike } from './image';

export interface HeroApi {
    title: string;
    subtitle?: string;
    image?: ImageLike;
    breadcrumbs?: { label: string; href: string; external?: boolean }[];
    action?: Parameters<typeof toActionRef>[0];
}

export interface PageHeroModel {
    title: string;
    subtitle?: string;
    image?: ImageRef;
    breadcrumbs?: LinkRef[];
    action?: ActionRef;
}

/** Inner-page hero from any `*PageWeb.hero`. `image` can be missing when the CMS has none; the page then skips the photo hero. */
export function toPageHero(hero: HeroApi, lang: Lang): PageHeroModel {
    return {
        title: hero.title,
        subtitle: hero.subtitle,
        image: toImageRef(hero.image, { decorative: true }),
        breadcrumbs: hero.breadcrumbs?.map((b) => ({ label: b.label, href: b.external ? b.href : localizeHref(lang, b.href) })),
        action: hero.action ? toActionRef(hero.action, lang) : undefined,
    };
}
