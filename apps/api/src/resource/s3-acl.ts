import { ObjectCannedACL } from '@aws-sdk/client-s3';

export const S3_ACL_SETTINGS = ['public-read', 'private', 'none'] as const;
export type S3AclSetting = (typeof S3_ACL_SETTINGS)[number];

export function isS3AclSetting(value: string): value is S3AclSetting {
    return (S3_ACL_SETTINGS as readonly string[]).includes(value);
}

/**
 * Maps the S3_OBJECT_ACL setting to the ACL sent with each upload.
 *  - unset / "public-read" (default, the historical behaviour): objects are publicly readable.
 *  - "private": objects are private. The URL returned by uploadFile is then NOT directly readable (403); use
 *    ResourceService.signedReadUrl for a short-lived link (applicants' résumés work this way).
 *  - "none": send NO ACL. Required for buckets with "Bucket owner enforced" object ownership (the
 *    default for new AWS buckets) and for S3-compatible stores such as Cloudflare R2 or MinIO, which
 *    reject any ACL with AccessControlListNotSupported. Public access then comes from the bucket policy;
 *    for R2/MinIO also set S3_ENDPOINT (and S3_FORCE_PATH_STYLE / S3_PUBLIC_BASE_URL as needed).
 * Anything else is a configuration error and throws instead of silently falling back.
 */
export function resolveS3Acl(setting: string | undefined): ObjectCannedACL | undefined {
    const value = (setting ?? '').trim().toLowerCase();
    if (value === '' || value === 'public-read') return ObjectCannedACL.public_read;
    if (value === 'private') return ObjectCannedACL.private;
    if (value === 'none') return undefined;
    throw new Error(`S3_OBJECT_ACL must be one of: ${S3_ACL_SETTINGS.join(', ')}.`);
}
