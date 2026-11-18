import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { newsMapEntityToModel } from '../helpers/news.mapper';

@Injectable()
export class GetNewsBySlugService {
    constructor(private prisma: PrismaService) {}

    async execute(slug: string, webOnly: boolean) {
        const where: any = { slug, isDeleted: false };
        if (webOnly) where.isPublished = true;
        const news = await this.prisma.news.findFirst({ where, include: { translations: true } });
        if (!news) throw new NotFoundException('News article not found');
        return newsMapEntityToModel(news);
    }
}
