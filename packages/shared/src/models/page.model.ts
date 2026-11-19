import { PageSeoContentWeb } from '../utils/seo';
import { PaginatorModel } from './pagination.model';

/** `GET …/page/web`: everything a listing page renders, in one response. `seo` is null when the page has none (use site defaults). */
export interface ListingPageWeb<THero, TItem> {
    seo: PageSeoContentWeb | null;
    hero: THero | null;
    items: PaginatorModel<TItem>;
}

/** A page aggregate that also carries the page's own SEO (home, about, ...). */
export type WithPageSeo<T> = T & { seo: PageSeoContentWeb | null };
