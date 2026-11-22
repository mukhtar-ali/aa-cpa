/**
 * Helpers for server-side table facet filters (MUK-470). The facet selections live in the page URL
 * (`?status=published&tag=news`); these turn them into API query parameters.
 */

/** Keeps only the values the API accepts, so a hand-edited URL (`?tag=bogus`) cannot make the list request 400. */
export function validFacet<T extends string>(values: string[] | undefined, allowed: readonly T[]): T[] | undefined {
  const kept = (values ?? []).filter((v): v is T => (allowed as readonly string[]).includes(v))
  return kept.length > 0 ? kept : undefined
}

/**
 * "Published" / "Draft" facet -> the API's isPublished flag. Selecting exactly one narrows the list;
 * none or both means no filter.
 */
export function publishedFromStatus(status: string[] | undefined): boolean | undefined {
  const published = status?.includes('published') ?? false
  const draft = status?.includes('draft') ?? false
  if (published === draft) return undefined
  return published
}

/** Arrays become comma-separated lists (what the API's csvList parameters expect); empty values are dropped. */
export function toQueryParams(query: object): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      if (value.length > 0) params[key] = value.join(',')
    } else {
      params[key] = value as string | number | boolean
    }
  }
  return params
}
