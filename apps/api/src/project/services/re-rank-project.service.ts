import { Injectable } from '@nestjs/common';
import { RankModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ReRankProjectService {
    constructor(private prisma: PrismaService) {}

    async execute(movedItems: RankModel[]) {
        await this.prisma.$transaction(
            movedItems.map((item) =>
                this.prisma.project.update({ where: { id: item.id }, data: { rank: item.rank } }),
            ),
        );
    }
}
