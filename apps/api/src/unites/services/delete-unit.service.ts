import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteUnitService {
    constructor(private prisma: PrismaService) {}

    async execute(unitId: string): Promise<void> {
        const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
        if (!unit || unit.isDeleted) {
            throw new NotFoundException('Unit not found');
        }
        await this.prisma.unit.update({
            where: { id: unitId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
}
