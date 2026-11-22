import {
    assertSeedPasswordIsNotPlaceholder,
    SEED_PASSWORD_PLACEHOLDER_PATTERN,
} from './seed-password';

describe('seed-password', () => {
    describe('placeholder password rejection matrix', () => {
        it.each([
            ['ChangeMe123!', 'ChangeMe123!'],
            ['changeme', 'changeme'],
            ['CHANGEME_ADMIN_1!', 'CHANGEME_ADMIN_1!'],
            ['change-me-Admin1!', 'change-me-Admin1!'],
            ['change_me_Admin1!', 'change_me_Admin1!'],
            ['change me Admin1!', 'change me Admin1!'],
            ['Placeholder123!', 'Placeholder123!'],
            ['my-placeholder-pass-9!', 'my-placeholder-pass-9!'],
            ['ExamplePass123!', 'ExamplePass123!'],
            ['admin@example.com-Pass1!', 'admin@example.com-Pass1!'],
            ['ReplaceMe123!', 'ReplaceMe123!'],
            ['replace-me-Strong1!', 'replace-me-Strong1!'],
            ['replace_me_Strong1!', 'replace_me_Strong1!'],
            ['replace me Strong1!', 'replace me Strong1!'],
        ])('rejects placeholder password %s', (_label, candidate) => {
            expect(SEED_PASSWORD_PLACEHOLDER_PATTERN.test(candidate)).toBe(true);
            expect(() => assertSeedPasswordIsNotPlaceholder(candidate)).toThrow(Error);
        });
    });

    describe('good password acceptance matrix', () => {
        it.each([
            ['Str0ng!AdminPass#2026', 'Str0ng!AdminPass#2026'],
            ['k9$Lp2#vQ8@mZ4!rT6', 'k9$Lp2#vQ8@mZ4!rT6'],
            ['Sup3r$ecureP@ssw0rd!', 'Sup3r$ecureP@ssw0rd!'],
            [' Correct-Horse-Battery-99! ', ' Correct-Horse-Battery-99! '],
            ['V7&xQ2!mN9#pL4$wR8', 'V7&xQ2!mN9#pL4$wR8'],
        ])('accepts non-placeholder password %s', (_label, candidate) => {
            expect(SEED_PASSWORD_PLACEHOLDER_PATTERN.test(candidate)).toBe(false);
            expect(() => assertSeedPasswordIsNotPlaceholder(candidate)).not.toThrow();
        });
    });

    describe('error message redaction', () => {
        it.each([
            'ChangeMe-SuperSecret-778899!',
            'placeholder-leaked-credential-42!',
            'example-sensitive-value-99!',
            'replace_me_do_not_log_this!',
        ])('never includes the rejected password (%s) in the thrown Error message', (candidate) => {
            expect(() => assertSeedPasswordIsNotPlaceholder(candidate)).toThrow(Error);
            try {
                assertSeedPasswordIsNotPlaceholder(candidate);
            } catch (err) {
                const message = (err as Error).message;
                expect(message).toContain('SUPER_ADMIN_PASSWORD');
                expect(message).not.toContain(candidate);
            }
        });
    });
});
