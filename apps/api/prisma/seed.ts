import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_PERMISSIONS, passwordValidation } from '@repo/shared';
import { assertSeedPasswordIsNotPlaceholder } from '../src/config/seed-password';

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'super_admin';
const SUPER_ADMIN_FULL_NAME = process.env.SUPER_ADMIN_FULL_NAME || 'Super Admin';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

async function main() {
    console.log('Seeding database...');

    // Super admin
    const existingAdmin = await prisma.user.findUnique({
        where: { email: SUPER_ADMIN_EMAIL },
    });

    if (!existingAdmin) {
        if (!SUPER_ADMIN_PASSWORD) {
            throw new Error(
                'SUPER_ADMIN_PASSWORD is not set. Add it to apps/api/.env before seeding ' +
                    '(see .env.example) — no default credential is baked into the seed script.',
            );
        }
        assertSeedPasswordIsNotPlaceholder(SUPER_ADMIN_PASSWORD);
        const passwordCheck = passwordValidation.safeParse(SUPER_ADMIN_PASSWORD);
        if (!passwordCheck.success) {
            throw new Error(`SUPER_ADMIN_PASSWORD is too weak: ${passwordCheck.error.issues[0].message}`);
        }

        await prisma.user.create({
            data: {
                fullName: SUPER_ADMIN_FULL_NAME,
                email: SUPER_ADMIN_EMAIL,
                username: SUPER_ADMIN_USERNAME,
                password: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10),
                isActive: true,
                permissions: ALL_PERMISSIONS,
            },
        });
        console.log(`Created super admin: ${SUPER_ADMIN_EMAIL}`);
    } else {
        // The super admin conceptually always has every permission — top the stored set up
        // to the current ALL_PERMISSIONS on every seed run rather than only at creation time,
        // so newly added permissions (this project has added several across this session)
        // don't silently leave the seeded super admin locked out of new admin sections.
        const existingPermissions = new Set(
            Array.isArray(existingAdmin.permissions) ? (existingAdmin.permissions as string[]) : [],
        );
        const missingPermissions = ALL_PERMISSIONS.filter((p) => !existingPermissions.has(p));
        if (missingPermissions.length > 0) {
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: { permissions: ALL_PERMISSIONS },
            });
            console.log(`Super admin already exists — topped up ${missingPermissions.length} missing permission(s).`);
        } else {
            console.log('Super admin already exists, permissions already up to date.');
        }
    }

    // Default sections
    const defaultSections = [
        {
            type: 'website-info',
            data: {
                facebookUrl: '', instagramUrl: '', linkedinUrl: '', youtubeUrl: '',
                email: '', phone: '', whatsapp: '', location: '',
                address: { en: '', ar: '' }, footerDescription: { en: '', ar: '' },
            },
        },
        {
            type: 'home-hero',
            data: { title: { en: '', ar: '' }, subtitle: { en: '', ar: '' }, backgroundImage: { desktop: '', tablet: '', mobile: '' } },
        },
        {
            type: 'home-about',
            data: { title: { en: '', ar: '' }, title2: { en: '', ar: '' }, subtitle: { en: '', ar: '' }, description: { en: '', ar: '' }, image: { desktop: '', tablet: '', mobile: '' } },
        },
        {
            type: 'fonts',
            data: { fonts: [] },
        },
        {
            type: 'home-why',
            data: { title: { en: '', ar: '' }, subtitle: { en: '', ar: '' }, items: [] },
        },
    ];

    for (const section of defaultSections) {
        await prisma.section.upsert({
            where: { type: section.type },
            update: {},
            create: { type: section.type, data: section.data },
        });
    }

    console.log('Default sections seeded.');
    console.log('Done!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
