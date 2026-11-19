import { Module } from '@nestjs/common';
import { SectionModule } from '@/section/section.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { NewsController } from './news.controller';
import { CreateNewsService } from './services/create-news.service';
import { UpdateNewsService } from './services/update-news.service';
import { GetAllNewsService } from './services/get-all-news.service';
import { GetNewsByIdService } from './services/get-news-by-id.service';
import { GetNewsBySlugService } from './services/get-news-by-slug.service';
import { DeleteNewsService } from './services/delete-news.service';
import { PublishNewsService } from './services/publish-news.service';
import { ArticleCategoriesController } from './categories/article-categories.controller';
import { ArticleCategoriesService } from './categories/article-categories.service';
import { AuthorsController } from './authors/authors.controller';
import { AuthorsService } from './authors/authors.service';

@Module({
    imports: [SectionModule, PrismaModule],
    controllers: [
        NewsController,
        ArticleCategoriesController,
        AuthorsController,
    ],
    providers: [
        CreateNewsService,
        UpdateNewsService,
        GetAllNewsService,
        GetNewsByIdService,
        GetNewsBySlugService,
        DeleteNewsService,
        PublishNewsService,
        ArticleCategoriesService,
        AuthorsService,
    ],
    exports: [
        GetAllNewsService,
        GetNewsBySlugService,
        ArticleCategoriesService,
        AuthorsService,
    ],
})
export class NewsModule {}
