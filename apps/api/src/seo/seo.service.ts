import { Injectable } from '@nestjs/common';
import { SeoModel } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SeoService {
    constructor(private prisma: PrismaService) {}

    async getByPageKey(pageKey: string) {
        return this.prisma.seo.findUnique({ where: { pageKey } });
    }

    async update(data: SeoModel) {
        return this.prisma.seo.upsert({
            where: { pageKey: data.pageKey },
            update: { content: data.content as any },
            create: { pageKey: data.pageKey, content: data.content as any },
        });
    }
}
