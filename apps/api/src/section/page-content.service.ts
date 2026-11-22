import { Injectable } from '@nestjs/common';
import { SeoService } from '@/seo/seo.service';
import { SectionService } from './section.service';

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

/** Pieces shared by every "one call per page" endpoint: the page's SEO and its CMS sections. */
@Injectable()
export class PageContentService {
    constructor(
        private readonly seoService: SeoService,
        private readonly sectionService: SectionService,
    ) {}

    /** The page's own SEO content, or null when none was saved (the web app then uses the site defaults). */
    async getSeo(pageKey: string): Promise<unknown | null> {
        const record = await this.seoService.getByPageKey(pageKey).catch(() => null);
        return record?.content ?? null;
    }

    /** A CMS section, or the fallback when it was never saved (a fresh install has none). */
    async getSection<T = unknown>(type: string, fallback: T | null = null): Promise<unknown> {
        return this.sectionService.getSection(type).catch(() => fallback);
    }

    /** Public list endpoints are paged by the caller; keep the size sane so one request cannot dump the table. */
    clampPageSize(requested: number | undefined): number {
        if (!requested || requested < 1) return DEFAULT_PAGE_SIZE;
        return Math.min(Math.floor(requested), MAX_PAGE_SIZE);
    }
}
