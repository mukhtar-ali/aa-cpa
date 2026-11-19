import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NewsMapper } from '../helpers/news.mapper';

@Injectable()
export class GetNewsByIdService {
    constructor(private prisma: PrismaService) {}

    async execute(newsId: string) {
        const news = await this.prisma.news.findUnique({
            where: { id: newsId },
            include: {
                translations: true,
                category: true,
                author: true,
                sectors: true,
                services: true,
            },
        });
        if (!news || news.isDeleted) throw new NotFoundException('News article not found');
        return NewsMapper.toAdmin(news);
    }
}
