import { Injectable } from '@nestjs/common';
import {
    createUniqueSlug, getLangValue,
    LanguageEnum, ProjectFormModel,
} from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { projectMapEntityToModel } from '../helpers/project.mapper';

@Injectable()
export class CreateProjectService {
    constructor(private prisma: PrismaService) {}

    async execute(data: ProjectFormModel) {
        const projectCount = await this.prisma.project.count({ where: { isDeleted: false } });
        const englishTitle = getLangValue(data.title, LanguageEnum.En);
        const slug = await this.generateUniqueSlug(data.slug || englishTitle);

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

        const project = await this.prisma.project.create({
            data: {
                slug,
                heroMedia: data.heroMedia as any,
                thumbnail: data.thumbnail,
                isPublished: data.isPublished ?? false,
                isFeatured: data.isFeatured ?? false,
                rank: projectCount + 1,
                translations: { create: translations },
            },
            include: { translations: true, units: { include: { translations: true } } },
        });
        return projectMapEntityToModel(project);
    }

    private async generateUniqueSlug(text: string): Promise<string> {
        let slug = createUniqueSlug(text);
        let exists = await this.prisma.project.findUnique({ where: { slug } });
        let counter = 1;
        while (exists) { slug += `_${counter++}`; exists = await this.prisma.project.findUnique({ where: { slug } }); }
        return slug;
    }
}
