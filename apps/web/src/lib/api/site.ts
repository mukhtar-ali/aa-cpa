import { endpoint, SiteChromeWebSchema, type SiteChromeWeb } from '@repo/shared';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { apiGet } from './client';
import { tags } from './endpoints';

/** Header, footer and contact channels. `null` when the API is unreachable so the page can still render without chrome. */
export async function getChrome(lang: Lang): Promise<SiteChromeWeb | null> {
    try {
        return await apiGet<SiteChromeWeb>(endpoint.site.chrome, { lang, tags: [tags.chrome], schema: SiteChromeWebSchema as never });
    } catch (error) {
        // CI builds the web app without an API, so this must not throw at build time. Revisit when pages go static (US1): a
        // build without the API would otherwise bake chrome-less pages until the next revalidation.
        console.error('[chrome] could not load site chrome', error);
        return null;
    }
}
