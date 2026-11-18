import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// One-off data fix for the en/gr -> en/ar rename: apps/api's `language_gr_to_ar` migration
// only converted the `Language` enum column on project_translations/unit_translations — it
// never touched `sections.data`, which is free-form JSON. Any section seeded before that rename
// still has multi-language fields shaped `{ en: "...", gr: "..." }`. This walks every section's
// JSON and renames `gr` -> `ar` wherever it appears alongside an `en` sibling key, recursively.
function renameGrToAr(value: unknown): { value: unknown; changed: boolean } {
    if (Array.isArray(value)) {
        let changed = false;
        const next = value.map((item) => {
            const result = renameGrToAr(item);
            if (result.changed) changed = true;
            return result.value;
        });
        return { value: next, changed };
    }

    if (value && typeof value === 'object') {
        let changed = false;
        const entries = Object.entries(value as Record<string, unknown>);
        const next: Record<string, unknown> = {};

        for (const [key, val] of entries) {
            const nested = renameGrToAr(val);
            if (nested.changed) changed = true;

            if (key === 'gr') {
                next.ar = nested.value;
                changed = true;
            } else {
                next[key] = nested.value;
            }
        }

        return { value: next, changed };
    }

    return { value, changed: false };
}

async function main() {
    const sections = await prisma.section.findMany();
    let updatedCount = 0;

    for (const section of sections) {
        const { value, changed } = renameGrToAr(section.data);
        if (!changed) continue;

        await prisma.section.update({
            where: { id: section.id },
            data: { data: value as any },
        });
        updatedCount++;
        console.log(`Fixed section "${section.type}"`);
    }

    console.log(
        updatedCount > 0
            ? `Done — fixed ${updatedCount} of ${sections.length} section(s).`
            : `Done — no sections needed fixing (${sections.length} checked).`,
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
