import { endpoint, SiteChromeWebSchema, type SiteChromeWeb } from '@repo/shared';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { apiGet } from './client';
import { tags } from './endpoints';

/** Header, footer and contact channels. `null` when the API is unreachable so the page can still render without chrome. */
export async function getChrome(lang: Lang): Promise<SiteChromeWeb | null> {
    try {
        return await apiGet<SiteChromeWeb>(endpoint.site.chrome, { lang, tags: [tags.chrome], schema: SiteChromeWebSchema as never });
    } catch (error) {
        // Never bake a chrome-less page into the static build: fail the build when the API is unreachable.
        if (process.env.NEXT_PHASE === 'phase-production-build') throw error;
        console.error('[chrome] could not load site chrome', error);
        return null;
    }
}
