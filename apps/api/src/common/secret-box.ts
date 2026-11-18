import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

/**
 * Authenticated encryption (AES-256-GCM) for secrets stored in the database, e.g. the SMTP
 * password kept in the `email-settings` section JSON.
 *
 * - The key is derived with HKDF-SHA256 from a root secret (the API's JWT_SECRET) and a
 *   `purpose` string, so each kind of stored secret gets its own key and no new environment
 *   variable is needed. Rotating the root secret makes existing ciphertexts undecryptable;
 *   callers must handle that (the admin re-enters the secret).
 * - `purpose` is also bound as GCM additional authenticated data, so a ciphertext copied into a
 *   different field fails to decrypt.
 * - Stored format: `enc:v1:<iv>.<tag>.<ciphertext>` (base64url). Anything without the
 *   `enc:v1:` prefix is treated as legacy plaintext by `decryptSecret`.
 */
/** Key-derivation / AAD purpose for the SMTP password stored in the `email-settings` section. */
export const SMTP_PASS_PURPOSE = 'email-settings.smtpPass';

const PREFIX = 'enc:v1:';
const IV_BYTES = 12;

export function isEncryptedSecret(value: string): boolean {
    return value.startsWith(PREFIX);
}

function deriveKey(rootSecret: string, purpose: string): Buffer {
    if (!rootSecret) {
        throw new Error('A non-empty root secret (JWT_SECRET) is required to encrypt or decrypt stored secrets.');
    }
    return Buffer.from(hkdfSync('sha256', rootSecret, Buffer.alloc(0), `secret-box:${purpose}`, 32));
}

/** Encrypts a non-empty plaintext. An empty string is returned unchanged (nothing to protect). */
export function encryptSecret(plaintext: string, rootSecret: string, purpose: string): string {
    if (plaintext === '') return '';
    const key = deriveKey(rootSecret, purpose);
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from(purpose));
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${PREFIX}${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

/**
 * Decrypts a value produced by `encryptSecret`. Values without the `enc:v1:` prefix are
 * returned as-is (legacy plaintext written before encryption existed). Throws if the value is
 * malformed, tampered with, bound to another purpose, or encrypted under a different root secret.
 */
export function decryptSecret(value: string, rootSecret: string, purpose: string): string {
    if (value === '') return '';
    if (!isEncryptedSecret(value)) return value;

    const [ivPart, tagPart, dataPart, ...rest] = value.slice(PREFIX.length).split('.');
    if (!ivPart || !tagPart || dataPart === undefined || rest.length > 0) {
        throw new Error('Malformed encrypted secret.');
    }
    const key = deriveKey(rootSecret, purpose);
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivPart, 'base64url'));
    decipher.setAAD(Buffer.from(purpose));
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(dataPart, 'base64url')), decipher.final()]).toString('utf8');
}
