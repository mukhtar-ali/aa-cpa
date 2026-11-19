import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ReorderSectorsService {
    constructor(private readonly prisma: PrismaService) {}

    async reorder(items: { id: string; order: number }[]) {
        return this.prisma.$transaction(
            items.map((item) =>
                this.prisma.sector.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
    }
}
