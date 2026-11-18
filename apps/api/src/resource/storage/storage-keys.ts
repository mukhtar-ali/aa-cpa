/**
 * Public media (images, videos, PDFs) lives under UPLOAD_KEY_PREFIX; operators commonly expose exactly that prefix
 * through the bucket policy / CDN (S3) or the /uploads route (local disk). Files that must stay private (applicants'
 * résumés) go under PRIVATE_KEY_PREFIX so such a policy never covers them. Only keys under one of these two
 * prefixes are ever signed or read back.
 */
export const UPLOAD_KEY_PREFIX = 'nest-next-starter/uploads/';
export const PRIVATE_KEY_PREFIX = 'nest-next-starter/private/';

/** True for a key this service could have written: one of the two prefixes, and no `..` segment. */
export function isOurKey(key: string): boolean {
    const ours = key.startsWith(UPLOAD_KEY_PREFIX) || key.startsWith(PRIVATE_KEY_PREFIX);
    return ours && !key.split('/').includes('..');
}
