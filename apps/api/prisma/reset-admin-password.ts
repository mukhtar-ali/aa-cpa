import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_PERMISSIONS, passwordValidation } from '@repo/shared';
import { assertSeedPasswordIsNotPlaceholder } from '../src/config/seed-password';

// Recovery tool: sets a new password for the super admin (SUPER_ADMIN_EMAIL), clears a login lockout, re-activates
// the account, restores every permission and signs out all devices. Creates nothing — use `pnpm seed` for that.
//
//   NEW_ADMIN_PASSWORD='...' pnpm --filter @repo/api admin:reset-password
//
// The new password comes from NEW_ADMIN_PASSWORD (falling back to SUPER_ADMIN_PASSWORD) and must satisfy the same
// strength rules as the seed.
const prisma = new PrismaClient();

async function main() {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.NEW_ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD;
    if (!password) throw new Error('Set NEW_ADMIN_PASSWORD (or SUPER_ADMIN_PASSWORD) to the new password.');
    assertSeedPasswordIsNotPlaceholder(password);
    const check = passwordValidation.safeParse(password);
    if (!check.success) throw new Error(`Password is too weak: ${check.error.issues[0].message}`);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(`No user with email ${email}. Run "pnpm seed" to create the super admin instead.`);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: {
                password: await bcrypt.hash(password, 10),
                isActive: true,
                isDeleted: false,
                deletedAt: null,
                failedLoginAttempts: 0,
                lockedUntil: null,
                permissions: ALL_PERMISSIONS,
            },
        }),
        prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    console.log(`Password reset for ${email}. Lockout cleared, all sessions signed out.`);
}

main()
    .catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
