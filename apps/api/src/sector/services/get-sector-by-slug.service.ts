import { Injectable, NotFoundException } from '@nestjs/common';
import { publishedNow } from '@/common/visibility';
import { PrismaService } from '@/prisma/prisma.service';
import { SectorMapper } from '../sector.mapper';

@Injectable()
export class GetSectorBySlugService {
    constructor(private readonly prisma: PrismaService) {}

    async getBySlugWeb(slug: string, lang: string, previewToken?: string) {
        const sector = await this.prisma.sector.findFirst({
            where: {
                slug,
                ...publishedNow(),
            },
            include: {
                translations: true,
                services: {
                    include: {
                        service: {
                            include: { translations: true },
                        },
                    },
                },
            },
        });

        if (!sector) {
            // Check slug redirects
            const redirect = await this.prisma.redirect.findFirst({
                where: {
                    fromPath: `/sectors/${slug}`,
                },
            });

            if (redirect) {
                const targetSlug = redirect.toPath.replace(/^\/sectors\//, '');
                return { redirectTo: targetSlug };
            }

            throw new NotFoundException(`Sector not found with slug: ${slug}`);
        }

        return SectorMapper.toDetailWeb(sector, lang);
    }

    async getByIdAdmin(id: string) {
        const sector = await this.prisma.sector.findUnique({
            where: { id },
            include: {
                translations: true,
                services: true,
            },
        });

        if (!sector || sector.isDeleted) {
            throw new NotFoundException(`Sector not found: ${id}`);
        }

        return SectorMapper.toAdmin(sector);
    }
}
