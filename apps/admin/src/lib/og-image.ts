/** The Open Graph image of a page or entity is a plain URL or an image object (`{ url, alt, ... }`) depending on where it was saved. */
export function ogImageUrl(value: unknown): string {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'url' in value && typeof (value as { url: unknown }).url === 'string') {
        return (value as { url: string }).url
    }
    return ''
}
