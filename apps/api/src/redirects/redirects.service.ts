import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { enqueueRevalidate, tagsForEntity } from '@/outbox/revalidate';
import {
    RedirectForm,
    RedirectFormSchema,
    RedirectFilter,
    RedirectAdmin,
    RedirectListAdmin,
    RedirectMapWeb,
    RedirectImportRowSchema,
    normalizeFromPath,
    normalizeToPath,
} from '@repo/shared';

export type RedirectEntityType = 'service' | 'sector' | 'article' | 'job';

export interface RedirectResolution {
    redirectTo: string;
    statusCode: 308;
}

const ENTITY_PATH_PREFIX: Record<RedirectEntityType, string> = {
    service: '/services',
    sector: '/sectors',
    article: '/articles',
    job: '/careers',
};

@Injectable()
export class RedirectsService {
    /** Hits seen since the last flush, by normalised from-path. Written in batches so a busy redirect never costs a write per request. */
    private pendingHits = new Map<string, number>();
    private static readonly MAX_PENDING_PATHS = 10_000;

    constructor(private readonly prisma: PrismaService) {}

    /** Asks the web app to drop its cached redirect map (tag `redirects`) through the outbox, like every other content change. */
    private async revalidateMap(): Promise<void> {
        await enqueueRevalidate(this.prisma as any, tagsForEntity('redirects'));
    }

    /**
     * Counts a visit to a redirect. Called by the web proxy for every redirect it serves; unknown paths are ignored at flush time,
     * so a visitor cannot create rows or inflate anything but existing redirects.
     */
    recordHit(rawPath: string): void {
        const path = normalizeFromPath(String(rawPath ?? '').slice(0, 500));
        if (!path) return;
        if (!this.pendingHits.has(path) && this.pendingHits.size >= RedirectsService.MAX_PENDING_PATHS) return;
        this.pendingHits.set(path, (this.pendingHits.get(path) ?? 0) + 1);
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async flushHits(): Promise<number> {
        if (this.pendingHits.size === 0) return 0;
        const batch = this.pendingHits;
        this.pendingHits = new Map();
        const now = new Date();
        let written = 0;
        for (const [fromPath, count] of batch) {
            try {
                const res = await this.prisma.redirect.updateMany({
                    where: { fromPath },
                    data: { hits: { increment: count }, lastHitAt: now },
                });
                written += res.count;
            } catch {
                // Counting is best effort: put the hits back so the next flush retries instead of losing them.
                this.pendingHits.set(fromPath, (this.pendingHits.get(fromPath) ?? 0) + count);
            }
        }
        return written;
    }

    /**
     * Records a slug change for an entity (service, sector, article, job).
     * Writes to the unified Redirect table with source = 'slug_change' and type = 'permanent'.
     * Resolves chains and prevents loops.
     */
    async recordSlugChange(
        entityType: RedirectEntityType,
        fromSlug?: string | null,
        toSlug?: string | null,
        createdById?: string | null,
    ): Promise<void> {
        if (!fromSlug || !toSlug || fromSlug === toSlug) {
            return;
        }

        const prefix = ENTITY_PATH_PREFIX[entityType];
        const fromPath = `${prefix}/${fromSlug}`;
        const toPath = `${prefix}/${toSlug}`;

        // Prevent loop if toPath was previously redirecting to fromPath
        await this.prisma.redirect.deleteMany({
            where: {
                fromPath: toPath,
            },
        });

        // Resolve chains: any redirect pointing to fromPath now points to toPath
        await this.prisma.redirect.updateMany({
            where: {
                toPath: fromPath,
            },
            data: {
                toPath,
            },
        });

        // Resolve forward chain if toPath is already redirected
        const terminalDestination = await this.resolveTerminalDestination(toPath);

        await this.prisma.redirect.upsert({
            where: {
                fromPath,
            },
            update: {
                toPath: terminalDestination,
                type: 'permanent',
                source: 'slug_change',
            },
            create: {
                fromPath,
                toPath: terminalDestination,
                type: 'permanent',
                source: 'slug_change',
                createdById: createdById ?? null,
            },
        });
        await this.revalidateMap();
    }

    /**
     * Resolves redirect for an entity by slug (legacy compatibility).
     */
    async resolveRedirect(
        entityType: RedirectEntityType,
        slug: string,
    ): Promise<RedirectResolution | null> {
        const prefix = ENTITY_PATH_PREFIX[entityType];
        const fromPath = `${prefix}/${slug}`;

        const redirect = await this.prisma.redirect.findUnique({
            where: {
                fromPath,
            },
        });

        if (!redirect) {
            return null;
        }

        const targetSlug = redirect.toPath.replace(new RegExp(`^${prefix}/`), '');
        return {
            redirectTo: targetSlug,
            statusCode: 308,
        };
    }

    /**
     * Checks for loops: ensures following redirects from toPath never loops back to fromPath.
     */
    async checkLoop(fromPath: string, toPath: string, excludeId?: string): Promise<void> {
        if (fromPath === toPath) {
            throw new BadRequestException('Redirect loop detected: fromPath equals toPath.');
        }

        let current = toPath;
        const visited = new Set<string>([fromPath]);
        let hops = 0;

        while (current && hops < 50) {
            if (visited.has(current)) {
                throw new BadRequestException(`Redirect loop detected: redirect chain loops back to "${current}".`);
            }
            visited.add(current);
            hops++;

            const next = await this.prisma.redirect.findFirst({
                where: {
                    fromPath: current,
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
            });

            if (!next) break;
            current = next.toPath;
        }

        if (hops >= 50) {
            throw new BadRequestException('Redirect chain exceeds maximum supported depth (50 hops).');
        }
    }

    /**
     * Resolves the terminal destination by following any existing redirect rules from toPath.
     */
    async resolveTerminalDestination(toPath: string, excludeId?: string): Promise<string> {
        let current = toPath;
        let hops = 0;

        while (current && hops < 50) {
            hops++;
            const next = await this.prisma.redirect.findFirst({
                where: {
                    fromPath: current,
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
            });

            if (!next) break;
            current = next.toPath;
        }

        return current;
    }

    /**
     * Admin list redirects with pagination and filtering.
     */
    async listAdmin(query: RedirectFilter): Promise<RedirectListAdmin> {
        const page = Number(query.pageNumber) || 1;
        const pageSize = Number(query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (query.source) {
            where.source = query.source;
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.search) {
            const search = query.search.trim().toLowerCase();
            where.OR = [
                { fromPath: { contains: search } },
                { toPath: { contains: search } },
            ];
        }

        const [total, items] = await Promise.all([
            this.prisma.redirect.count({ where }),
            this.prisma.redirect.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            }),
        ]);

        return {
            items: items as any,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize) || 1,
        };
    }

    /**
     * Admin get redirect by ID.
     */
    async getByIdAdmin(id: string): Promise<RedirectAdmin> {
        const redirect = await this.prisma.redirect.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        if (!redirect) {
            throw new NotFoundException(`Redirect with ID "${id}" not found.`);
        }

        return redirect as any;
    }

    /**
     * Admin create redirect.
     */
    async createAdmin(body: unknown, userId?: string): Promise<RedirectAdmin> {
        const parsed = RedirectFormSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parsed.error.issues,
            });
        }

        const { fromPath, toPath, type, source } = parsed.data;

        // Check 5,000 max rows limit
        const totalCount = await this.prisma.redirect.count();
        if (totalCount >= 5000) {
            throw new BadRequestException('Maximum limit of 5,000 redirects reached.');
        }

        // Check if fromPath already exists
        const existing = await this.prisma.redirect.findUnique({
            where: { fromPath },
        });
        if (existing) {
            throw new ConflictException(`Redirect for path "${fromPath}" already exists.`);
        }

        // Loop detection
        await this.checkLoop(fromPath, toPath);

        // Chain resolution: find terminal target
        const terminalToPath = await this.resolveTerminalDestination(toPath);

        // Collapse existing backward chains pointing to fromPath
        await this.prisma.redirect.updateMany({
            where: { toPath: fromPath },
            data: { toPath: terminalToPath },
        });

        const redirect = await this.prisma.redirect.create({
            data: {
                fromPath,
                toPath: terminalToPath,
                type,
                source: source || 'manual',
                createdById: userId ?? null,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        await this.revalidateMap();
        return redirect as any;
    }

    /**
     * Admin update redirect.
     */
    async updateAdmin(id: string, body: unknown, userId?: string): Promise<RedirectAdmin> {
        const existing = await this.prisma.redirect.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Redirect with ID "${id}" not found.`);
        }

        const parsed = RedirectFormSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parsed.error.issues,
            });
        }

        const { fromPath, toPath, type, source } = parsed.data;

        // Check uniqueness if fromPath changed
        if (fromPath !== existing.fromPath) {
            const duplicate = await this.prisma.redirect.findUnique({ where: { fromPath } });
            if (duplicate && duplicate.id !== id) {
                throw new ConflictException(`Redirect for path "${fromPath}" already exists.`);
            }
        }

        // Loop check excluding this redirect ID
        await this.checkLoop(fromPath, toPath, id);

        // Chain resolution: find terminal destination
        const terminalToPath = await this.resolveTerminalDestination(toPath, id);

        // Collapse existing backward chains
        await this.prisma.redirect.updateMany({
            where: { toPath: fromPath, id: { not: id } },
            data: { toPath: terminalToPath },
        });

        const updated = await this.prisma.redirect.update({
            where: { id },
            data: {
                fromPath,
                toPath: terminalToPath,
                type,
                source: source || existing.source,
                ...(userId ? { createdById: userId } : {}),
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        await this.revalidateMap();
        return updated as any;
    }

    /**
     * Admin delete redirect.
     */
    async deleteAdmin(id: string): Promise<void> {
        const existing = await this.prisma.redirect.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Redirect with ID "${id}" not found.`);
        }

        await this.prisma.redirect.delete({ where: { id } });
        await this.revalidateMap();
    }

    /**
     * Public redirect map for Next.js web proxy.
     */
    async getPublicMap(): Promise<RedirectMapWeb> {
        const redirects = await this.prisma.redirect.findMany({
            select: {
                fromPath: true,
                toPath: true,
                type: true,
            },
        });

        const map: RedirectMapWeb = {};
        for (const r of redirects) {
            map[r.fromPath] = {
                to: r.toPath,
                type: r.type as 'permanent' | 'temporary',
            };
        }

        return map;
    }

    /**
     * Admin export CSV.
     */
    async exportCsvAdmin(): Promise<string> {
        const redirects = await this.prisma.redirect.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                fromPath: true,
                toPath: true,
                type: true,
                source: true,
                hits: true,
            },
        });

        // Escape CSV injection characters: =, +, -, @, tab, CR
        const escapeCell = (val: any): string => {
            if (val === null || val === undefined) return '';
            let str = String(val);
            if (/^[=+\-@\t\r]/.test(str)) {
                str = "'" + str;
            }
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                str = `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const header = 'from,to,type,source,hits';
        const rows = redirects.map((r) =>
            [
                escapeCell(r.fromPath),
                escapeCell(r.toPath),
                escapeCell(r.type),
                escapeCell(r.source),
                escapeCell(r.hits),
            ].join(','),
        );

        return [header, ...rows].join('\n');
    }

    /**
     * Admin import CSV. All-or-nothing with row-level error reporting.
     * Maximum 5,000 total rows. Resolves chains and rejects loops.
     */
    async importCsvAdmin(
        csvContent: string,
        userId?: string,
    ): Promise<{ imported: number; total: number }> {
        const lines = csvContent
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            throw new BadRequestException('CSV content is empty.');
        }

        // Determine header line
        const firstLine = lines[0].toLowerCase();
        let startIndex = 0;
        let fromCol = 0;
        let toCol = 1;
        let typeCol = 2;

        if (firstLine.includes('from') && firstLine.includes('to')) {
            startIndex = 1;
            const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
            fromCol = headers.findIndex((h) => h === 'from' || h === 'frompath');
            toCol = headers.findIndex((h) => h === 'to' || h === 'topath');
            typeCol = headers.findIndex((h) => h === 'type');
            if (fromCol === -1 || toCol === -1) {
                throw new BadRequestException('CSV header must contain "from" and "to" columns.');
            }
        }

        const dataLines = lines.slice(startIndex);
        if (dataLines.length === 0) {
            throw new BadRequestException('CSV contains no data rows.');
        }

        if (dataLines.length > 5000) {
            throw new BadRequestException('CSV exceeds maximum batch limit of 5,000 rows.');
        }

        const currentCount = await this.prisma.redirect.count();
        if (currentCount + dataLines.length > 5000) {
            throw new BadRequestException(
                `Importing ${dataLines.length} rows would exceed the maximum limit of 5,000 redirects (current count: ${currentCount}).`,
            );
        }

        const rowErrors: { row: number; message: string }[] = [];
        const parsedRows: { from: string; to: string; type: 'permanent' | 'temporary'; row: number }[] = [];
        const seenFrom = new Map<string, number>();

        for (let i = 0; i < dataLines.length; i++) {
            const rowNumber = startIndex + i + 1; // 1-indexed row number in the file
            const line = dataLines[i];
            const cols = this.parseCsvLine(line);

            const rawFrom = cols[fromCol] ?? '';
            const rawTo = cols[toCol] ?? '';
            const rawType = typeCol !== -1 ? cols[typeCol] ?? 'permanent' : 'permanent';

            const parsed = RedirectImportRowSchema.safeParse({
                from: rawFrom,
                to: rawTo,
                type: rawType,
            });

            if (!parsed.success) {
                const msgs = parsed.error.issues.map((iss) => `${iss.path.join('.') || 'row'}: ${iss.message}`).join(', ');
                rowErrors.push({ row: rowNumber, message: msgs });
                continue;
            }

            const { from, to, type } = parsed.data;

            if (seenFrom.has(from)) {
                rowErrors.push({
                    row: rowNumber,
                    message: `Duplicate fromPath "${from}" in CSV (first seen at row ${seenFrom.get(from)}).`,
                });
                continue;
            }
            seenFrom.set(from, rowNumber);

            parsedRows.push({ from, to, type, row: rowNumber });
        }

        // Intra-batch cycle check
        const batchMap = new Map<string, string>();
        for (const r of parsedRows) {
            batchMap.set(r.from, r.to);
        }

        for (const r of parsedRows) {
            let curr = r.to;
            const visited = new Set<string>([r.from]);
            let hops = 0;
            while (curr && hops < 50) {
                if (visited.has(curr)) {
                    rowErrors.push({
                        row: r.row,
                        message: `Redirect loop detected in CSV batch: chain loops back to "${curr}".`,
                    });
                    break;
                }
                visited.add(curr);
                hops++;
                if (!batchMap.has(curr)) break;
                curr = batchMap.get(curr)!;
            }
        }

        if (rowErrors.length > 0) {
            throw new BadRequestException({
                message: 'Validation failed on CSV import',
                errors: rowErrors,
            });
        }

        // All rows are valid. Execute all-or-nothing in transaction.
        await this.prisma.$transaction(async (tx) => {
            for (const r of parsedRows) {
                // Resolve chain against DB and batch
                let terminalTarget = r.to;
                let hops = 0;
                while (terminalTarget && hops < 50) {
                    hops++;
                    if (batchMap.has(terminalTarget)) {
                        terminalTarget = batchMap.get(terminalTarget)!;
                    } else {
                        const existingTarget = await tx.redirect.findUnique({
                            where: { fromPath: terminalTarget },
                        });
                        if (!existingTarget) break;
                        terminalTarget = existingTarget.toPath;
                    }
                }

                // Update any existing redirects pointing to r.from
                await tx.redirect.updateMany({
                    where: { toPath: r.from },
                    data: { toPath: terminalTarget },
                });

                await tx.redirect.upsert({
                    where: { fromPath: r.from },
                    update: {
                        toPath: terminalTarget,
                        type: r.type,
                        source: 'legacy_import',
                        ...(userId ? { createdById: userId } : {}),
                    },
                    create: {
                        fromPath: r.from,
                        toPath: terminalTarget,
                        type: r.type,
                        source: 'legacy_import',
                        createdById: userId ?? null,
                    },
                });
            }
        });

        await this.revalidateMap();
        const total = await this.prisma.redirect.count();
        return { imported: parsedRows.length, total };
    }

    private parseCsvLine(line: string): string[] {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(cur.trim());
                cur = '';
            } else {
                cur += char;
            }
        }
        result.push(cur.trim());
        return result;
    }
}
