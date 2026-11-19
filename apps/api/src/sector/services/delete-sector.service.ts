import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteSectorService {
    constructor(private readonly prisma: PrismaService) {}

    async delete(id: string) {
        const sector = await this.prisma.sector.findUnique({
            where: { id },
        });
        if (!sector || sector.isDeleted) {
            throw new NotFoundException(`Sector not found: ${id}`);
        }

        // Edge case check (T048a): Check if referenced by articles
        const articleCount = await this.prisma.articleSector.count({
            where: { sectorId: id },
        });

        if (articleCount > 0) {
            throw new ConflictException({
                message: `Cannot delete sector because it is referenced by: ${articleCount} article(s)`,
                references: [`${articleCount} article(s)`],
            });
        }

        return this.prisma.sector.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
}
