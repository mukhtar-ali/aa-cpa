import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export type RedirectEntityType = 'service' | 'sector' | 'article' | 'job';

export interface RedirectResolution {
    redirectTo: string;
    statusCode: 308;
}

@Injectable()
export class RedirectsService {
    constructor(private readonly prisma: PrismaService) {}

    async recordSlugChange(
        entityType: RedirectEntityType,
        fromSlug?: string | null,
        toSlug?: string | null,
    ): Promise<void> {
        if (!fromSlug || !toSlug || fromSlug === toSlug) {
            return;
        }

        // Prevent loops if an entity is renamed back to a previously used slug
        await this.prisma.slugRedirect.deleteMany({
            where: {
                entityType,
                fromSlug: toSlug,
            },
        });

        // Collapse redirect chains: any redirect pointing to fromSlug now points directly to toSlug
        await this.prisma.slugRedirect.updateMany({
            where: {
                entityType,
                toSlug: fromSlug,
            },
            data: {
                toSlug,
            },
        });

        await this.prisma.slugRedirect.upsert({
            where: {
                entityType_fromSlug: {
                    entityType,
                    fromSlug,
                },
            },
            update: {
                toSlug,
            },
            create: {
                entityType,
                fromSlug,
                toSlug,
            },
        });
    }

    async resolveRedirect(
        entityType: RedirectEntityType,
        slug: string,
    ): Promise<RedirectResolution | null> {
        const redirect = await this.prisma.slugRedirect.findUnique({
            where: {
                entityType_fromSlug: {
                    entityType,
                    fromSlug: slug,
                },
            },
        });

        if (!redirect) {
            return null;
        }

        return {
            redirectTo: redirect.toSlug,
            statusCode: 308,
        };
    }
}
