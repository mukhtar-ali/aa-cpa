export type TransitionLinkDecision = 'ignore' | 'prevent' | 'transition';

export function getTransitionLinkDecision(a: HTMLAnchorElement): TransitionLinkDecision {
    const rawHref = (a.getAttribute('href') || '').trim();
    const currentUrl = window.location;
    const absoluteHref = a.href;

    if (!rawHref && !absoluteHref) return 'ignore';

    if (a.target === '_blank') return 'ignore';
    if (a.hasAttribute('download')) return 'ignore';
    if (a.dataset.noTransition !== undefined) return 'ignore';

    if (rawHref.startsWith('mailto:')) return 'ignore';
    if (rawHref.startsWith('tel:')) return 'ignore';
    if (rawHref.startsWith('javascript:')) return 'prevent';

    // noop hashes -> prevent native jump
    if (
        rawHref === '#' ||
        rawHref === '/#' ||
        absoluteHref === `${currentUrl.origin}${currentUrl.pathname}#` ||
        absoluteHref === `${currentUrl.href}#`
    ) {
        return 'prevent';
    }

    const url = new URL(absoluteHref, window.location.href);

    if (url.origin !== currentUrl.origin) return 'ignore';

    // same-page hash navigation -> allow native scroll, no transition
    if (
        url.pathname === currentUrl.pathname &&
        url.search === currentUrl.search &&
        rawHref.includes('#') &&
        rawHref !== '#' &&
        rawHref !== '/#'
    ) {
        return 'ignore';
    }

    // same exact page without meaningful nav
    if (url.pathname === currentUrl.pathname && url.search === currentUrl.search && !rawHref.includes('#')) {
        return 'ignore';
    }

    return 'transition';
}
