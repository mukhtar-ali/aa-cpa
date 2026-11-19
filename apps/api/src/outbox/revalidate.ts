import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { customEnv } from '@/config/custom-env';

export type RevalidateEntityKind =
    | 'service'
    | 'sector'
    | 'article'
    | 'job'
    | 'reference'
    | 'section';

export function tagsForEntity(kind: RevalidateEntityKind, slugOrKey?: string): string[] {
    const tags = new Set<string>();
    switch (kind) {
        case 'service':
            tags.add('services');
            if (slugOrKey) tags.add(`service:${slugOrKey}`);
            tags.add('page:home');
            tags.add('page:services');
            tags.add('site:chrome');
            break;
        case 'sector':
            tags.add('sectors');
            if (slugOrKey) tags.add(`sector:${slugOrKey}`);
            tags.add('page:sectors');
            break;
        case 'article':
            tags.add('articles');
            if (slugOrKey) tags.add(`article:${slugOrKey}`);
            tags.add('page:home');
            tags.add('page:articles');
            tags.add('page:sectors');
            break;
        case 'job':
            tags.add('jobs');
            if (slugOrKey) tags.add(`job:${slugOrKey}`);
            tags.add('page:careers');
            break;
        case 'reference':
            tags.add('reference');
            if (slugOrKey) tags.add(`reference:${slugOrKey}`);
            tags.add('page:home');
            tags.add('page:about');
            tags.add('page:services');
            tags.add('page:sectors');
            tags.add('page:contact');
            tags.add('site:chrome');
            break;
        case 'section':
            tags.add('sections');
            if (slugOrKey) {
                tags.add(`section:${slugOrKey}`);
                if (slugOrKey.startsWith('page-')) {
                    tags.add(`page:${slugOrKey.replace(/^page-/, '')}`);
                }
                if (slugOrKey.startsWith('legal-')) {
                    tags.add(`page:${slugOrKey}`);
                }
                if (slugOrKey === 'site-chrome') {
                    tags.add('site:chrome');
                }
            }
            break;
    }
    return Array.from(tags);
}

export async function enqueueRevalidate(txOrPrisma: any, tags: string[]): Promise<any> {
    const uniqueTags = Array.from(new Set((tags || []).filter(Boolean)));
    if (uniqueTags.length === 0) return null;
    if (!txOrPrisma?.emailOutbox?.create) return null;

    return txOrPrisma.emailOutbox.create({
        data: {
            kind: 'revalidate',
            template: null,
            to: null,
            language: 'ar',
            payload: { tags: uniqueTags },
            status: 'pending',
            attempts: 0,
            nextAttemptAt: new Date(),
        },
    });
}

@Injectable()
export class RevalidateService {
    private readonly logger = new Logger(RevalidateService.name);

    constructor(private readonly prisma: PrismaService) {}

    buildTags(kind: RevalidateEntityKind, slugOrKey?: string): string[] {
        return tagsForEntity(kind, slugOrKey);
    }

    async enqueue(tags: string[], tx?: any): Promise<any> {
        return enqueueRevalidate(tx || this.prisma, tags);
    }

    async enqueueForEntity(kind: RevalidateEntityKind, slugOrKey?: string, tx?: any): Promise<any> {
        const tags = tagsForEntity(kind, slugOrKey);
        return enqueueRevalidate(tx || this.prisma, tags);
    }

    async sendRevalidatePayload(
        payload: { tags?: string[] },
        options?: { url?: string; secret?: string; fetchFn?: typeof fetch },
    ): Promise<void> {
        const url = options?.url ?? process.env.WEB_REVALIDATE_URL ?? customEnv.WEB_REVALIDATE_URL;
        const secret =
            options?.secret ?? process.env.WEB_REVALIDATE_SECRET ?? customEnv.WEB_REVALIDATE_SECRET;
        const fetchImpl = options?.fetchFn ?? global.fetch;

        if (!url) {
            this.logger.debug('WEB_REVALIDATE_URL is not configured; skipping HTTP revalidate call');
            return;
        }

        const tags = Array.isArray(payload?.tags) ? payload.tags : [];
        const res = await fetchImpl(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-revalidate-secret': secret || '',
                Authorization: secret ? `Bearer ${secret}` : '',
            },
            body: JSON.stringify({ tags, secret }),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Revalidate webhook failed (${res.status}): ${text}`);
        }
    }
}
