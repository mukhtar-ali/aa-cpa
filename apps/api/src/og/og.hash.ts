import { createHash } from 'node:crypto';

export interface OgHashPayload {
    type: string;
    key: string;
    lang: string;
    title: string;
    eyebrow?: string;
}

/**
 * Computes a deterministic SHA-256 content hash for an OG render payload.
 * Hash stability ensures identical content produces identical ETag and cache key.
 */
export function computeOgContentHash(payload: OgHashPayload): string {
    const canonical = [
        payload.type.trim(),
        payload.key.trim(),
        payload.lang.trim().toLowerCase(),
        payload.title.trim(),
        (payload.eyebrow ?? '').trim(),
    ].join('::');
    return createHash('sha256').update(canonical, 'utf8').digest('hex');
}
