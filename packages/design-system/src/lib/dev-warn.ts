const warned = new Set<string>();

/**
 * Breadcrumbs without an accessible name are not rendered (a navigation landmark needs a name). Say so in development instead of
 * dropping them silently. Returns null so it can sit inside JSX.
 */
export function warnMissingBreadcrumbLabel(items: unknown[] | undefined, label: string | undefined, component: string): null {
  if (process.env.NODE_ENV !== 'production' && items && items.length > 0 && !label && !warned.has(component)) {
    warned.add(component);
    console.warn(`${component}: \`breadcrumbs\` are not rendered without \`breadcrumbsLabel\` (the accessible name of the navigation landmark).`);
  }
  return null;
}
