export const SEED_PASSWORD_PLACEHOLDER_PATTERN =
    /change[-_ ]?me|changeme|placeholder|example|replace[-_ ]?me/i;

export function assertSeedPasswordIsNotPlaceholder(password: string): void {
    if (SEED_PASSWORD_PLACEHOLDER_PATTERN.test(password)) {
        throw new Error(
            'SUPER_ADMIN_PASSWORD appears to be a placeholder value. Set a real, unique password before seeding.',
        );
    }
}
