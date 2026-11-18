import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { unitMapEntityToModel } from '../helpers/unit.mapper';

@Injectable()
export class GetUnitBySlugService {
    constructor(private prisma: PrismaService) {}

    async execute(slug: string, webOnly: boolean): Promise<UnitModel> {
        const where: any = { slug, isDeleted: false };
        if (webOnly) where.isPublished = true;

        const unit = await this.prisma.unit.findFirst({
            where,
            include: { translations: true },
        });
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }
        return unitMapEntityToModel(unit);
    }
}
