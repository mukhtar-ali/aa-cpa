import { Injectable, NotFoundException } from '@nestjs/common';
import { getLangValue, LanguageEnum, ProjectFormModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { projectMapEntityToModel } from '../helpers/project.mapper';

@Injectable()
export class UpdateProjectService {
    constructor(private prisma: PrismaService) {}

    async execute(projectId: string, data: ProjectFormModel) {
        const existing = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!existing || existing.isDeleted) throw new NotFoundException('Project not found');

        const translations = Object.values(LanguageEnum).map((language) => ({
            language: language as any,
            title: getLangValue(data.title, language),
            subtitle: getLangValue(data.subtitle, language),
            location: getLangValue(data.location, language),
            description: getLangValue(data.description, language),
            tags: (data.tags ?? []).map((tag) => getLangValue(tag, language)),
            amenities: (data.amenities ?? []).map((amenity) => ({
                icon: amenity.icon,
                title: getLangValue(amenity.title, language),
                description: getLangValue(amenity.description, language),
            })),
        }));

        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: {
                heroMedia: data.heroMedia as any,
                thumbnail: data.thumbnail,
                isPublished: data.isPublished ?? existing.isPublished,
                isFeatured: data.isFeatured ?? existing.isFeatured,
                translations: {
                    deleteMany: {},
                    create: translations,
                },
            },
            include: { translations: true, units: { include: { translations: true } } },
        });
        return projectMapEntityToModel(project);
    }
}
