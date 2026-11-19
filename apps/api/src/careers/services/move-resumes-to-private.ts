import { PRIVATE_KEY_PREFIX, UPLOAD_KEY_PREFIX } from '@/resource/resource.service';

/** The parts of ResourceService and PrismaClient the migration needs (so it can be tested with plain fakes). */
export interface ResumeMigrationDeps {
    prisma: {
        jobApplication: {
            findMany(args: {
                where: { resumeUrl: { not: null } };
                select: { id: true; resumeUrl: true };
                orderBy: { createdAt: 'asc' };
            }): Promise<{ id: string; resumeUrl: string | null }[]>;
            update(args: { where: { id: string }; data: { resumeUrl: string } }): Promise<unknown>;
        };
    };
    resources: {
        keyFromStoredUrl(url: string): string | undefined;
        urlForKey(key: string): string;
        copyObject(fromKey: string, toKey: string): Promise<void>;
        deleteObject(key: string): Promise<void>;
    };
    apply: boolean;
    log?: (message: string) => void;
}

export interface ResumeMigrationSummary {
    total: number;
    alreadyPrivate: number;
    foreign: number;
    moved: number;
    failed: number;
    /** Rows repointed to the private copy whose original public object could not be deleted: delete these by hand. */
    originalsNotDeleted: string[];
}

/**
 * Moves résumés uploaded before MUK-482 (public objects under nest-next-starter/uploads/) to the private prefix.
 * Per row: copy and verify the new object, repoint the database row, then delete the original. A crash at any step
 * leaves either the old link or the new one working, never neither. Safe to re-run: rows already under the private
 * prefix and URLs that are not ours (other host or bucket) are left alone, and one failing row never stops the rest.
 * Without `apply` nothing is changed (dry run).
 */
export async function moveResumesToPrivate({ prisma, resources, apply, log = () => undefined }: ResumeMigrationDeps): Promise<ResumeMigrationSummary> {
    const rows = await prisma.jobApplication.findMany({
        where: { resumeUrl: { not: null } },
        select: { id: true, resumeUrl: true },
        orderBy: { createdAt: 'asc' },
    });
    const summary: ResumeMigrationSummary = { total: rows.length, alreadyPrivate: 0, foreign: 0, moved: 0, failed: 0, originalsNotDeleted: [] };

    for (const row of rows) {
        const key = row.resumeUrl ? resources.keyFromStoredUrl(row.resumeUrl) : undefined;
        if (!key || !(key.startsWith(UPLOAD_KEY_PREFIX) || key.startsWith(PRIVATE_KEY_PREFIX))) {
            summary.foreign++;
            log(`skip   ${row.id}: not an object this bucket's uploads wrote`);
            continue;
        }
        if (key.startsWith(PRIVATE_KEY_PREFIX)) {
            summary.alreadyPrivate++;
            continue;
        }

        const newKey = `${PRIVATE_KEY_PREFIX}${key.slice(UPLOAD_KEY_PREFIX.length)}`;
        if (!apply) {
            summary.moved++;
            log(`would  ${row.id}: ${key} -> ${newKey}`);
            continue;
        }

        try {
            await resources.copyObject(key, newKey);
            await prisma.jobApplication.update({ where: { id: row.id }, data: { resumeUrl: resources.urlForKey(newKey) } });
        } catch (error) {
            summary.failed++;
            log(`FAILED ${row.id}: ${(error as Error).message}`);
            continue;
        }
        summary.moved++;
        try {
            await resources.deleteObject(key);
            log(`moved  ${row.id}: ${key} -> ${newKey}`);
        } catch (error) {
            // The row already points at the private copy; the public original is still there and must be removed.
            summary.originalsNotDeleted.push(key);
            log(`MOVED BUT ORIGINAL STILL PUBLIC ${row.id}: ${key} (${(error as Error).message}) - delete it manually`);
        }
    }
    return summary;
}
