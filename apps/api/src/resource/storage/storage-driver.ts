import type { S3AclSetting } from '../s3-acl';

export type StorageDriverName = 'local' | 's3';

export interface PutOptions {
    contentType: string;
    /** Files that must never be publicly readable (applicants' résumés). */
    isPrivate: boolean;
    /** S3 only: overrides the S3_OBJECT_ACL default for this one upload. Ignored by the local driver. */
    acl?: S3AclSetting;
}

/**
 * Where uploaded files live. ResourceService owns everything that is the same for every backend (image compression,
 * the key layout, file-name sanitising); a driver only knows how to write, read back and address an object by key.
 */
export interface StorageDriver {
    readonly name: StorageDriverName;
    /** Writes the object. Throws if the backend is not configured or the write fails. */
    put(key: string, body: Buffer, options: PutOptions): Promise<void>;
    /** The URL stored in the database for a key. Pure: it never touches the backend, so it can be built before the write. */
    urlForKey(key: string): string;
    /** The key behind a URL this driver produced, or undefined for anything else (including keys outside our prefixes). */
    keyFromStoredUrl(url: string): string | undefined;
    /** Copies an object to another key (the copy is private) and confirms the copy exists. */
    copy(fromKey: string, toKey: string): Promise<void>;
    delete(key: string): Promise<void>;
    /** A short-lived link for reading an object this driver stored. URLs that are not ours are returned unchanged. */
    signedReadUrl(url: string, expiresInSeconds: number): Promise<string>;
}
