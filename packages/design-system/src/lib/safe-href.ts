/**
 * Links come from CMS or API data. A `javascript:` or `data:` value in a link would run script when clicked, so every `href` that is not a
 * literal in code goes through here. Allowed: relative paths, `#fragment`, `?query`, and the schemes http, https, mailto and tel.
 * Anything else returns `undefined` (the caller then renders no link).
 */
const ALLOWED_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function safeHref(href: string | undefined | null): string | undefined {
  if (!href) return undefined;
  // Browsers ignore tabs, newlines and leading control characters inside a scheme ("java\tscript:").
  // eslint-disable-next-line no-control-regex
  const value = href.replace(/[\u0000-\u001F\u007F\s]+/g, '');
  if (value === '') return undefined;
  // Protocol-relative ("//host/path") would leave the site with whatever scheme the page uses.
  if (value.startsWith('//')) return undefined;
  if (/^[/#?]/.test(value)) return href.trim();
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (!scheme) return href.trim(); // relative path such as "about" or "../news"
  return ALLOWED_SCHEMES.has(`${scheme[1]!.toLowerCase()}:`) ? href.trim() : undefined;
}
