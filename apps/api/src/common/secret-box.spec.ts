import { decryptSecret, encryptSecret, isEncryptedSecret } from './secret-box';

const ROOT = '9f8e7d6c5b4a39281726354453627180a1b2c3d4';
const PURPOSE = 'email-settings.smtpPass';

describe('secret-box', () => {
    it('round-trips a secret', () => {
        const token = encryptSecret('s3cr3t-Passw0rd!', ROOT, PURPOSE);
        expect(isEncryptedSecret(token)).toBe(true);
        expect(decryptSecret(token, ROOT, PURPOSE)).toBe('s3cr3t-Passw0rd!');
    });

    it('round-trips unicode and long values', () => {
        const value = 'كلمة-سر-🔐-' + 'x'.repeat(500);
        expect(decryptSecret(encryptSecret(value, ROOT, PURPOSE), ROOT, PURPOSE)).toBe(value);
    });

    it('never contains the plaintext and uses a fresh IV each time', () => {
        const a = encryptSecret('hunter2-hunter2', ROOT, PURPOSE);
        const b = encryptSecret('hunter2-hunter2', ROOT, PURPOSE);
        expect(a).not.toContain('hunter2');
        expect(a).not.toEqual(b);
    });

    it('treats an empty string as nothing to protect', () => {
        expect(encryptSecret('', ROOT, PURPOSE)).toBe('');
        expect(decryptSecret('', ROOT, PURPOSE)).toBe('');
    });

    it('returns legacy plaintext (no enc:v1: prefix) unchanged', () => {
        expect(isEncryptedSecret('plain-old-password')).toBe(false);
        expect(decryptSecret('plain-old-password', ROOT, PURPOSE)).toBe('plain-old-password');
    });

    it('fails with a different root secret (e.g. JWT_SECRET was rotated)', () => {
        const token = encryptSecret('value-to-protect', ROOT, PURPOSE);
        expect(() => decryptSecret(token, ROOT + 'x', PURPOSE)).toThrow();
    });

    it('fails when the ciphertext is moved to a different purpose (bound as AAD)', () => {
        const token = encryptSecret('value-to-protect', ROOT, PURPOSE);
        expect(() => decryptSecret(token, ROOT, 'some.other.field')).toThrow();
    });

    it('detects tampering with the ciphertext or the auth tag', () => {
        const token = encryptSecret('value-to-protect', ROOT, PURPOSE);
        const [iv, tag, data] = token.slice('enc:v1:'.length).split('.');
        const flip = (b64: string) => {
            const buf = Buffer.from(b64, 'base64url');
            buf[0] ^= 0xff;
            return buf.toString('base64url');
        };
        expect(() => decryptSecret(`enc:v1:${iv}.${tag}.${flip(data)}`, ROOT, PURPOSE)).toThrow();
        expect(() => decryptSecret(`enc:v1:${iv}.${flip(tag)}.${data}`, ROOT, PURPOSE)).toThrow();
    });

    it.each(['enc:v1:', 'enc:v1:onlyone', 'enc:v1:a.b', 'enc:v1:a.b.c.d'])('rejects malformed token %s', (value) => {
        expect(() => decryptSecret(value, ROOT, PURPOSE)).toThrow();
    });

    it('requires a non-empty root secret', () => {
        expect(() => encryptSecret('x', '', PURPOSE)).toThrow(/root secret/);
        const token = encryptSecret('x', ROOT, PURPOSE);
        expect(() => decryptSecret(token, '', PURPOSE)).toThrow(/root secret/);
    });
});
