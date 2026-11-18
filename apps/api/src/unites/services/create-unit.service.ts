import { Injectable, NotFoundException } from '@nestjs/common';
import {
    createUniqueSlug,
    getLangValue,
    getUnitTranslatableKeys,
    LanguageEnum,
    MultiLanguageFieldModel,
    UnitFormModel,
    UnitModel,
} from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { unitMapEntityToModel } from '../helpers/unit.mapper';

@Injectable()
export class CreateUnitService {
    constructor(private prisma: PrismaService) {}

    async execute(projectId: string, data: UnitFormModel): Promise<UnitModel> {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project || project.isDeleted) {
            throw new NotFoundException('Project not found');
        }

        const englishTitle = getLangValue(data.title, LanguageEnum.En);
        const slug = await this.generateUniqueSlug(data.slug || englishTitle);

        const translations = Object.values(LanguageEnum).map((language) => {
            const translation: Record<string, unknown> = { language };
            for (const field of getUnitTranslatableKeys()) {
                translation[field] = getLangValue(data[field] as MultiLanguageFieldModel, language);
            }
            translation.overViewFeatures = (data.overViewFeatures ?? []).map((feature) =>
                getLangValue(feature, language),
            );
            return translation as { language: LanguageEnum; [key: string]: unknown };
        });

        const unit = await this.prisma.unit.create({
            data: {
                projectId: project.id,
                thumbnail: data.thumbnail,
                overViewImage: data.overViewImage,
                price: data.price,
                pricePerMeter: data.pricePerMeter,
                gallery: data.gallery as any,
                isPublished: data.isPublished ?? false,
                bedrooms: data.bedrooms ?? 0,
                bathrooms: data.bathrooms ?? 0,
                slug,
                translations: { create: translations as any },
            },
            include: { translations: true },
        });

        return unitMapEntityToModel(unit);
    }

    private async generateUniqueSlug(text: string): Promise<string> {
        const baseSlug = createUniqueSlug(text) || 'unit';
        let slug = baseSlug;
        let exists = await this.prisma.unit.findUnique({ where: { slug } });
        let counter = 1;
        while (exists) {
            slug = `${baseSlug}_${counter++}`;
            exists = await this.prisma.unit.findUnique({ where: { slug } });
        }
        return slug;
    }
}
