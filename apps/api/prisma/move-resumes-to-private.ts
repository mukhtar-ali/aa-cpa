import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ResourceService } from '../src/resource/resource.service';
import { moveResumesToPrivate } from '../src/careers/services/move-resumes-to-private';

/**
 * One-off: moves applicants' résumés uploaded before they became private (MUK-482) from the public
 * nest-next-starter/uploads/ prefix to nest-next-starter/private/ and repoints the database rows.
 *   pnpm --filter @repo/api resumes:make-private            # dry run, lists what would move
 *   pnpm --filter @repo/api resumes:make-private -- --apply # does it
 * Needs the same S3_* variables as the API (s3:GetObject, PutObject and DeleteObject on the bucket).
 */
async function main() {
    const apply = process.argv.includes('--apply');
    const prisma = new PrismaClient();
    try {
        const summary = await moveResumesToPrivate({ prisma, resources: new ResourceService(), apply, log: (m) => console.log(m) });
        console.log(`\n${apply ? 'Done' : 'Dry run (nothing changed; add --apply)'}:`, JSON.stringify({ ...summary, originalsNotDeleted: summary.originalsNotDeleted.length }));
        if (summary.originalsNotDeleted.length > 0) {
            console.log('Originals still public, delete manually:\n  ' + summary.originalsNotDeleted.join('\n  '));
        }
        if (summary.failed > 0 || summary.originalsNotDeleted.length > 0) process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
