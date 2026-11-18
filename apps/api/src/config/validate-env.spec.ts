import {
    assertProductionEnv,
    MIN_SECRET_LENGTH,
    SECRET_PLACEHOLDER_PATTERN,
    validateProductionEnv,
} from './validate-env';

const VALID_JWT_SECRET = '9f8e7d6c5b4a39281726354453627180a1b2c3d4';
const VALID_CSRF_SECRET = '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d';

const VALID_PROD_ENV: Record<string, string | undefined> = {
    NODE_ENV: 'production',
    JWT_SECRET: VALID_JWT_SECRET,
    DATABASE_URL: 'mysql://prod_user:prod_pass@db.internal:3306/app_prod',
    ADMIN_PORTAL_URL: 'https://admin.example.com',
    FRONTEND_URL: 'https://www.example.com',
    API_PUBLIC_URL: 'https://api.example.com',
};

describe('validate-env', () => {
    describe('non-production environments', () => {
        it.each([
            ['development', 'development'],
            ['test', 'test'],
            ['staging', 'staging'],
            ['empty string', ''],
            ['undefined', undefined],
            ['case-mismatch "Production"', 'Production'],
        ])('returns [] immediately when NODE_ENV is %s even if all vars are missing or invalid', (_label, nodeEnv) => {
            expect(
                validateProductionEnv({
                    NODE_ENV: nodeEnv,
                    JWT_SECRET: '',
                    CSRF_SECRET: 'changeme',
                    DATABASE_URL: '',
                    ADMIN_PORTAL_URL: 'not-a-url',
                    FRONTEND_URL: '',
                }),
            ).toEqual([]);
        });
    });

    describe('valid production environment', () => {
        it('returns [] when all required production variables are valid and CSRF_SECRET is omitted', () => {
            expect(validateProductionEnv(VALID_PROD_ENV)).toEqual([]);
        });

        it('returns [] when JWT_SECRET is exactly 32 random characters', () => {
            const secret32 = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
            expect(secret32).toHaveLength(MIN_SECRET_LENGTH);
            expect(
                validateProductionEnv({
                    ...VALID_PROD_ENV,
                    JWT_SECRET: secret32,
                }),
            ).toEqual([]);
        });

        it('returns [] when CSRF_SECRET is empty string (falls back to JWT_SECRET)', () => {
            expect(
                validateProductionEnv({
                    ...VALID_PROD_ENV,
                    CSRF_SECRET: '',
                }),
            ).toEqual([]);
        });

        it('returns [] when CSRF_SECRET is explicitly set to a valid 32+ char secret', () => {
            expect(
                validateProductionEnv({
                    ...VALID_PROD_ENV,
                    CSRF_SECRET: VALID_CSRF_SECRET,
                }),
            ).toEqual([]);
        });
    });

    describe('JWT_SECRET validation in production', () => {
        it.each([
            ['missing (undefined)', undefined, /JWT_SECRET/],
            ['empty string', '', /JWT_SECRET/],
            ['whitespace only', '    ', /JWT_SECRET/],
            ['shorter than 32 chars (31 chars)', 'a1b2c3d4e5f60718293a4b5c6d7e8f9', /JWT_SECRET.*32/],
            ['short secret (10 chars)', '0123456789', /JWT_SECRET.*32/],
        ])('reports problem when JWT_SECRET is %s', (_label, secret, expectedPattern) => {
            const problems = validateProductionEnv({
                ...VALID_PROD_ENV,
                JWT_SECRET: secret,
            });
            expect(problems.length).toBeGreaterThan(0);
            expect(problems.some((p) => expectedPattern.test(p))).toBe(true);
        });

        it.each([
            ['CHANGE_ME_JWT', 'CHANGE_ME_JWT'],
            ['change-me-to-a-long-random-string', 'change-me-to-a-long-random-string'],
            ['changeme', 'changeme'],
            ['changeme-with-32-chars-padding-12345', 'changeme-with-32-chars-padding-12345'],
            ['change_me_in_production_0123456789ab', 'change_me_in_production_0123456789ab'],
            ['change me in production 0123456789ab', 'change me in production 0123456789ab'],
            ['example-production-token-0123456789ab', 'example-production-token-0123456789ab'],
            ['placeholder-token-value-0123456789ab', 'placeholder-token-value-0123456789ab'],
            ['your-secret-key-goes-right-here-1234', 'your-secret-key-goes-right-here-1234'],
            ['my-super-long-production-jwt-secret', 'my-super-long-production-jwt-secret'],
        ])('rejects placeholder JWT_SECRET %s', (_label, placeholder) => {
            expect(SECRET_PLACEHOLDER_PATTERN.test(placeholder)).toBe(true);
            const problems = validateProductionEnv({
                ...VALID_PROD_ENV,
                JWT_SECRET: placeholder,
            });
            expect(problems.some((p) => /JWT_SECRET.*placeholder/i.test(p))).toBe(true);
        });
    });

    describe('CSRF_SECRET validation in production', () => {
        it.each([
            ['whitespace only', '     ', /CSRF_SECRET/],
            ['shorter than 32 chars', 'short-csrf-key-12345', /CSRF_SECRET.*32/],
            ['32+ char placeholder (change-me)', 'change-me-to-a-long-random-string', /CSRF_SECRET.*placeholder/i],
            ['short placeholder (CHANGE_ME_JWT)', 'CHANGE_ME_JWT', /CSRF_SECRET.*placeholder/i],
            ['changeme', 'changeme', /CSRF_SECRET.*placeholder/i],
        ])('reports problem when explicit CSRF_SECRET is %s', (_label, csrfSecret, expectedPattern) => {
            const problems = validateProductionEnv({
                ...VALID_PROD_ENV,
                CSRF_SECRET: csrfSecret,
            });
            expect(problems.some((p) => expectedPattern.test(p))).toBe(true);
        });
    });

    describe('DATABASE_URL validation in production', () => {
        it.each([
            ['undefined', undefined],
            ['empty string', ''],
            ['whitespace only', '   '],
        ])('reports problem when DATABASE_URL is %s', (_label, databaseUrl) => {
            const problems = validateProductionEnv({
                ...VALID_PROD_ENV,
                DATABASE_URL: databaseUrl,
            });
            expect(problems).toEqual([
                expect.stringMatching(/DATABASE_URL/),
            ]);
        });
    });

    describe('ADMIN_PORTAL_URL and FRONTEND_URL validation in production', () => {
        it.each([
            ['ADMIN_PORTAL_URL', 'undefined', undefined],
            ['ADMIN_PORTAL_URL', 'empty string', ''],
            ['ADMIN_PORTAL_URL', 'whitespace', '   '],
            ['ADMIN_PORTAL_URL', 'not a URL', 'not-a-valid-url'],
            ['ADMIN_PORTAL_URL', 'relative path', '/admin'],
            ['ADMIN_PORTAL_URL', 'ftp protocol', 'ftp://admin.example.com'],
            ['ADMIN_PORTAL_URL', 'javascript protocol', 'javascript:alert(1)'],
            ['FRONTEND_URL', 'undefined', undefined],
            ['FRONTEND_URL', 'empty string', ''],
            ['FRONTEND_URL', 'whitespace', '   '],
            ['FRONTEND_URL', 'not a URL', 'example.com'],
            ['FRONTEND_URL', 'ws protocol', 'ws://www.example.com'],
        ])('reports problem when %s is %s', (field, _label, value) => {
            const problems = validateProductionEnv({
                ...VALID_PROD_ENV,
                [field]: value,
            });
            expect(problems).toEqual([
                expect.stringMatching(new RegExp(field)),
            ]);
        });
    });

    describe('secret redaction and assertProductionEnv', () => {
        it('never includes secret or URL values in returned problem messages or thrown Error', () => {
            const badJwt = 'leaked-jwt-value-short';
            const badCsrf = 'leaked-csrf-change-me-to-a-long-random-string';
            const badAdminUrl = 'ftp://leaked-internal-admin-host.local';
            const badFrontendUrl = 'not-a-url-leaked-frontend';

            const env: Record<string, string | undefined> = {
                NODE_ENV: 'production',
                JWT_SECRET: badJwt,
                CSRF_SECRET: badCsrf,
                DATABASE_URL: '',
                ADMIN_PORTAL_URL: badAdminUrl,
                FRONTEND_URL: badFrontendUrl,
            };

            const problems = validateProductionEnv(env);
            expect(problems.length).toBeGreaterThanOrEqual(5);

            const combined = problems.join('\n');
            expect(combined).not.toContain(badJwt);
            expect(combined).not.toContain(badCsrf);
            expect(combined).not.toContain(badAdminUrl);
            expect(combined).not.toContain(badFrontendUrl);

            expect(() => assertProductionEnv(env)).toThrow(Error);
            try {
                assertProductionEnv(env);
            } catch (err) {
                const message = (err as Error).message;
                expect(message).toContain('JWT_SECRET');
                expect(message).toContain('CSRF_SECRET');
                expect(message).toContain('DATABASE_URL');
                expect(message).toContain('ADMIN_PORTAL_URL');
                expect(message).toContain('FRONTEND_URL');
                expect(message).not.toContain(badJwt);
                expect(message).not.toContain(badCsrf);
                expect(message).not.toContain(badAdminUrl);
                expect(message).not.toContain(badFrontendUrl);
            }
        });

        it.each(['1', '2', undefined, ''])('accepts TRUST_PROXY=%s in production', (value) => {
            expect(validateProductionEnv({ ...VALID_PROD_ENV, TRUST_PROXY: value })).toEqual([]);
        });

        it.each(['true', '*', '0', '11', '1.5', 'loopback'])(
            'reports an invalid TRUST_PROXY (%s) in production without echoing it',
            (value) => {
                const problems = validateProductionEnv({ ...VALID_PROD_ENV, TRUST_PROXY: value });
                expect(problems).toHaveLength(1);
                expect(problems[0]).toContain('TRUST_PROXY');
                expect(problems[0]).not.toContain(`'${value}' is`);
            },
        );

        it.each(['public-read', 'private', 'none', 'PRIVATE', undefined, ''])('accepts S3_OBJECT_ACL=%s in production', (value) => {
            expect(validateProductionEnv({ ...VALID_PROD_ENV, S3_OBJECT_ACL: value })).toEqual([]);
        });

        it.each(['public', 'authenticated-read', 'true', 'public_read'])('reports an invalid S3_OBJECT_ACL (%s) in production', (value) => {
            const problems = validateProductionEnv({ ...VALID_PROD_ENV, S3_OBJECT_ACL: value });
            expect(problems).toHaveLength(1);
            expect(problems[0]).toContain('S3_OBJECT_ACL');
        });

        it.each(['S3_ENDPOINT', 'S3_PUBLIC_BASE_URL'])('accepts an http(s) %s and reports a bad one in production', (name) => {
            expect(validateProductionEnv({ ...VALID_PROD_ENV, [name]: 'https://cdn.example.com' })).toEqual([]);
            expect(validateProductionEnv({ ...VALID_PROD_ENV, [name]: 'http://minio:9000' })).toEqual([]);
            expect(validateProductionEnv({ ...VALID_PROD_ENV, [name]: '' })).toEqual([]);
            for (const bad of ['javascript:alert(1)', 'not a url', 'ftp://x.example']) {
                const problems = validateProductionEnv({ ...VALID_PROD_ENV, [name]: bad });
                expect(problems).toHaveLength(1);
                expect(problems[0]).toContain(name);
            }
        });

        it('does not throw from assertProductionEnv when environment is valid or non-production', () => {
            expect(() => assertProductionEnv(VALID_PROD_ENV)).not.toThrow();
            expect(() => assertProductionEnv({ NODE_ENV: 'development' })).not.toThrow();
        });
    });

    describe('file storage (local disk or S3)', () => {
        it('requires API_PUBLIC_URL when files fall back to local disk (no S3 bucket, no STORAGE_DRIVER)', () => {
            const problems = validateProductionEnv({ ...VALID_PROD_ENV, API_PUBLIC_URL: undefined });
            expect(problems).toHaveLength(1);
            expect(problems[0]).toContain('API_PUBLIC_URL');
        });

        it('requires API_PUBLIC_URL for an explicit STORAGE_DRIVER=local too, and rejects a non-http(s) value', () => {
            expect(validateProductionEnv({ ...VALID_PROD_ENV, STORAGE_DRIVER: 'local', API_PUBLIC_URL: '' })[0]).toContain('API_PUBLIC_URL');
            expect(validateProductionEnv({ ...VALID_PROD_ENV, API_PUBLIC_URL: 'ftp://files.example.com' })[0]).toContain('API_PUBLIC_URL');
        });

        it('does not need API_PUBLIC_URL when S3 is used', () => {
            expect(validateProductionEnv({ ...VALID_PROD_ENV, API_PUBLIC_URL: undefined, S3_BUCKET_NAME: 'my-bucket' })).toEqual([]);
            expect(validateProductionEnv({ ...VALID_PROD_ENV, API_PUBLIC_URL: undefined, STORAGE_DRIVER: 's3' })).toEqual([]);
        });

        it('reports an unknown STORAGE_DRIVER', () => {
            const problems = validateProductionEnv({ ...VALID_PROD_ENV, STORAGE_DRIVER: 'ftp' });
            expect(problems[0]).toContain('STORAGE_DRIVER');
        });
    });
});
