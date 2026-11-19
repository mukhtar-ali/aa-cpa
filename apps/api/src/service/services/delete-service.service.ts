import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteServiceService {
    constructor(private readonly prisma: PrismaService) {}

    async delete(id: string) {
        const service = await this.prisma.service.findUnique({
            where: { id },
        });
        if (!service || service.isDeleted) {
            throw new NotFoundException(`Service not found: ${id}`);
        }

        // Edge case check (T048a): Check if referenced by leads/contacts or articles
        const [contactCount, articleCount] = await Promise.all([
            this.prisma.contact.count({
                where: { serviceId: id, isDeleted: false },
            }),
            this.prisma.articleService.count({
                where: { serviceId: id },
            }),
        ]);

        const references: string[] = [];
        if (contactCount > 0) references.push(`${contactCount} contact lead(s)`);
        if (articleCount > 0) references.push(`${articleCount} article(s)`);

        if (references.length > 0) {
            throw new ConflictException({
                message: `Cannot delete service because it is referenced by: ${references.join(', ')}`,
                references,
            });
        }

        return this.prisma.service.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
}
