import { Module } from '@nestjs/common';
import { SectionModule } from '@/section/section.module';
import { NewsController } from './news.controller';
import { CreateNewsService } from './services/create-news.service';
import { UpdateNewsService } from './services/update-news.service';
import { GetAllNewsService } from './services/get-all-news.service';
import { GetNewsByIdService } from './services/get-news-by-id.service';
import { GetNewsBySlugService } from './services/get-news-by-slug.service';
import { DeleteNewsService } from './services/delete-news.service';

@Module({
    imports: [SectionModule],
    controllers: [NewsController],
    providers: [
        CreateNewsService, UpdateNewsService, GetAllNewsService,
        GetNewsByIdService, GetNewsBySlugService, DeleteNewsService,
    ],
})
export class NewsModule {}
