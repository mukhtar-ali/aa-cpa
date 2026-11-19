import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ReorderServicesService {
    constructor(private readonly prisma: PrismaService) {}

    async reorder(items: { id: string; order: number }[]) {
        return this.prisma.$transaction(
            items.map((item) =>
                this.prisma.service.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
    }
}
