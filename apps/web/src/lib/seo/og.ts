export const apiUrl = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL || process.env.BASE_URL;
    if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
        return raw.replace(/\/+$/, '');
    }
    return 'http://localhost:3001';
};

export interface BuildOgImageUrlInput {
    type?: string;
    key?: string;
    lang: string;
}

/**
 * Builds the dynamic OG image URL served by the API.
 * Format: `${API}/api/og?type=&key=&lang=`
 */
export function buildOgImageUrl({ type = 'page', key = 'home', lang }: BuildOgImageUrlInput): string {
    const api = apiUrl();
    const params = new URLSearchParams({
        type,
        key,
        lang,
    });
    return `${api}/api/og?${params.toString()}`;
}
