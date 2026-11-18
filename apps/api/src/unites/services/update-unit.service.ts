import { Injectable, NotFoundException } from '@nestjs/common';
import { getLangValue, getUnitTranslatableKeys, LanguageEnum, MultiLanguageFieldModel, UnitFormModel, UnitModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { unitMapEntityToModel } from '../helpers/unit.mapper';

@Injectable()
export class UpdateUnitService {
    constructor(private prisma: PrismaService) {}

    async execute(unitId: string, data: UnitFormModel): Promise<UnitModel> {
        const existing = await this.prisma.unit.findUnique({ where: { id: unitId } });
        if (!existing || existing.isDeleted) {
            throw new NotFoundException('Unit not found');
        }

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

        const unit = await this.prisma.unit.update({
            where: { id: unitId },
            data: {
                thumbnail: data.thumbnail ?? existing.thumbnail,
                overViewImage: data.overViewImage ?? existing.overViewImage,
                price: data.price ?? existing.price,
                pricePerMeter: data.pricePerMeter ?? existing.pricePerMeter,
                gallery: (data.gallery as any) ?? existing.gallery,
                isPublished: data.isPublished ?? existing.isPublished,
                slug: data.slug || existing.slug,
                bedrooms: data.bedrooms ?? existing.bedrooms,
                bathrooms: data.bathrooms ?? existing.bathrooms,
                translations: {
                    deleteMany: {},
                    create: translations as any,
                },
            },
            include: { translations: true },
        });

        return unitMapEntityToModel(unit);
    }
}
