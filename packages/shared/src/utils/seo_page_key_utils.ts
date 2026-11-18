import { SeoDynamicPage, SeoPage } from '../enums';

export const buildSeoPageKey = (
    page: SeoPage | SeoDynamicPage,
    identifier?: string,
): string => {
    const slug = identifier?.trim();
    return slug ? `${page}:${slug}` : page;
};
