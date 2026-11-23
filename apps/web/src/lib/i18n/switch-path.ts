import type { Lang } from './dictionaries';

/** The current path in the other language, keeping the rest of the path (FR-002). */
export function switchedPath(pathname: string, target: Lang): string {
    const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, '');
    return `/${target}${rest}`;
}
