import { Injectable, NotFoundException } from '@nestjs/common';
import { publishedNow } from '@/common/visibility';
import { PrismaService } from '@/prisma/prisma.service';
import { ServiceMapper } from '../service.mapper';

@Injectable()
export class GetServiceBySlugService {
    constructor(private readonly prisma: PrismaService) {}

    async getBySlugWeb(slug: string, lang: string, previewToken?: string) {
        let service = await this.prisma.service.findFirst({
            where: {
                slug,
                ...(previewToken ? { isDeleted: false } : publishedNow()),
            },
            include: {
                translations: true,
                sectors: {
                    include: {
                        sector: {
                            include: { translations: true },
                        },
                    },
                },
                faqs: {
                    where: { isPublished: true, isDeleted: false },
                },
            },
        });

        if (!service) {
            // Check slug redirects
            const redirect = await this.prisma.redirect.findFirst({
                where: {
                    fromPath: `/services/${slug}`,
                },
            });

            if (redirect) {
                const targetSlug = redirect.toPath.replace(/^\/services\//, '');
                return { redirectTo: targetSlug };
            }

            throw new NotFoundException(`Service not found with slug: ${slug}`);
        }

        return ServiceMapper.toDetailWeb(service, lang);
    }

    async getByIdAdmin(id: string) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                translations: true,
                sectors: true,
                faqs: true,
            },
        });

        if (!service || service.isDeleted) {
            throw new NotFoundException(`Service not found with id: ${id}`);
        }

        return ServiceMapper.toAdmin(service);
    }
}
