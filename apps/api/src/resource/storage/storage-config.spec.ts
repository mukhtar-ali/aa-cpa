import { resolveStorageDriverName, storageEnvProblems } from './storage-config';

describe('resolveStorageDriverName', () => {
    it('uses the local disk when no S3 bucket is configured (zero-config)', () => {
        expect(resolveStorageDriverName({})).toBe('local');
        expect(resolveStorageDriverName({ S3_BUCKET_NAME: '   ' })).toBe('local');
    });

    it('uses S3 when a bucket is configured', () => {
        expect(resolveStorageDriverName({ S3_BUCKET_NAME: 'my-bucket' })).toBe('s3');
    });

    it('an explicit STORAGE_DRIVER wins over auto-detection, case-insensitively', () => {
        expect(resolveStorageDriverName({ STORAGE_DRIVER: 'local', S3_BUCKET_NAME: 'my-bucket' })).toBe('local');
        expect(resolveStorageDriverName({ STORAGE_DRIVER: ' S3 ' })).toBe('s3');
    });

    it('throws on an unknown driver instead of silently picking one', () => {
        expect(() => resolveStorageDriverName({ STORAGE_DRIVER: 'ftp' })).toThrow('STORAGE_DRIVER');
    });
});

describe('storageEnvProblems', () => {
    it('is empty for S3 and for local with a valid API_PUBLIC_URL', () => {
        expect(storageEnvProblems({ S3_BUCKET_NAME: 'b' })).toEqual([]);
        expect(storageEnvProblems({ API_PUBLIC_URL: 'https://api.example.com' })).toEqual([]);
    });

    it('flags local storage without a usable API_PUBLIC_URL', () => {
        expect(storageEnvProblems({})[0]).toContain('API_PUBLIC_URL is required');
        expect(storageEnvProblems({ API_PUBLIC_URL: 'javascript:alert(1)' })[0]).toContain('http(s)');
    });
});
