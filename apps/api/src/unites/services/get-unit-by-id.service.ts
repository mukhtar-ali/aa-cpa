import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { unitMapEntityToModel } from '../helpers/unit.mapper';

@Injectable()
export class GetUnitByIdService {
    constructor(private prisma: PrismaService) {}

    async execute(unitId: string): Promise<UnitModel> {
        const unit = await this.prisma.unit.findUnique({
            where: { id: unitId },
            include: { translations: true },
        });
        if (!unit || unit.isDeleted) {
            throw new NotFoundException('Unit not found');
        }
        return unitMapEntityToModel(unit);
    }
}
