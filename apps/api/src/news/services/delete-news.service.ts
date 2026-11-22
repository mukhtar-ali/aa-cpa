import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteNewsService {
    constructor(private prisma: PrismaService) {}

    async execute(newsId: string) {
        const news = await this.prisma.news.findUnique({ where: { id: newsId } });
        if (!news || news.isDeleted) throw new NotFoundException('News article not found');
        await this.prisma.news.update({ where: { id: newsId }, data: { isDeleted: true, deletedAt: new Date() } });
    }
}
