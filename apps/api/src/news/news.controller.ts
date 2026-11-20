import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import {
    endpoint, ListingHeroPage, NewsFormModel, NewsFormSchema, NewsQueryModel, NewsQuerySchema, PermissionEnum, SeoPage,
} from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { LocaleInterceptor } from '@/common/locale.interceptor';
import { langStorage } from '@/common/i18n.helper';
import { PageContentService } from '@/section/page-content.service';
import { CreateNewsService } from './services/create-news.service';
import { UpdateNewsService } from './services/update-news.service';
import { GetAllNewsService } from './services/get-all-news.service';
import { GetNewsByIdService } from './services/get-news-by-id.service';
import { GetNewsBySlugService } from './services/get-news-by-slug.service';
import { DeleteNewsService } from './services/delete-news.service';
import { PublishNewsService } from './services/publish-news.service';

@Controller()
export class NewsController {
    constructor(
        private readonly createNewsAction: CreateNewsService,
        private readonly getAllNewsAction: GetAllNewsService,
        private readonly getNewsByIdAction: GetNewsByIdService,
        private readonly getNewsBySlugAction: GetNewsBySlugService,
        private readonly updateNewsAction: UpdateNewsService,
        private readonly deleteNewsAction: DeleteNewsService,
        private readonly publishNewsAction: PublishNewsService,
        private readonly pageContent: PageContentService,
    ) {}

    // ---- Public Articles endpoints ----

    @Public()
    @Get('/api/articles')
    async getArticles(
        @Query(new CustomZodValidationPipe(NewsQuerySchema)) query: NewsQueryModel,
        @Query('lang') queryLang?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getAllNewsAction.execute(query, true, lang);
    }

    @Public()
    @Get('/api/articles/:slug')
    async getArticleBySlug(
        @Param('slug') slug: string,
        @Query('lang') queryLang?: string,
        @Query('preview') previewToken?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getNewsBySlugAction.execute(slug, true, lang, previewToken);
    }

    // ---- Public News endpoints (aliases) ----

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.news.listWeb)
    async getWebNews(@Query(new CustomZodValidationPipe(NewsQuerySchema)) query: NewsQueryModel) {
        const lang = langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getAllNewsAction.execute(query, true, lang);
    }

    /** The whole News page in one call: its SEO, its hero and one page of published articles. */
    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.news.pageWeb)
    async getNewsPageWeb(@Query(new CustomZodValidationPipe(NewsQuerySchema)) query: NewsQueryModel) {
        const lang = langStorage.getStore() === 'en' ? 'en' : 'ar';
        const [seo, hero, items] = await Promise.all([
            this.pageContent.getSeo(SeoPage.News),
            this.pageContent.getSection(`${ListingHeroPage.News}-hero`),
            this.getAllNewsAction.execute({ ...query, pageSize: this.pageContent.clampPageSize(query.pageSize) }, true, lang),
        ]);
        return { seo, hero, items };
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.news.getBySlugWeb + '/:slug')
    async getNewsBySlug(@Param('slug') slug: string) {
        const lang = langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getNewsBySlugAction.execute(slug, true, lang);
    }

    // ---- Admin endpoints ----

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsView)
    @Get([endpoint.news.list, '/api/admin/news'])
    async getAllNews(@Query(new CustomZodValidationPipe(NewsQuerySchema)) query: NewsQueryModel) {
        return this.getAllNewsAction.execute(query, false);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsView)
    @Get([endpoint.news.getById + '/:newsId', '/api/admin/news/:newsId'])
    async getNewsById(@Param('newsId') newsId: string) {
        return this.getNewsByIdAction.execute(newsId);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsCreate)
    @Post([endpoint.news.create, '/api/admin/news'])
    async createNews(@Body(new CustomZodValidationPipe(NewsFormSchema)) data: NewsFormModel) {
        const news = await this.createNewsAction.execute(data);
        return { news };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsUpdate)
    @Put([endpoint.news.update + '/:newsId/publish', '/api/admin/news/:newsId/publish'])
    async publishNews(
        @Param('newsId') newsId: string,
        @Body() body: { isPublished: boolean },
    ) {
        const news = await this.publishNewsAction.publish(newsId, body?.isPublished ?? false);
        return { news };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsUpdate)
    @Put([endpoint.news.update + '/:newsId', '/api/admin/news/:newsId'])
    async updateNews(
        @Param('newsId') newsId: string,
        @Body(new CustomZodValidationPipe(NewsFormSchema)) data: NewsFormModel,
    ) {
        const news = await this.updateNewsAction.execute(newsId, data);
        return { news };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsDelete)
    @Delete([endpoint.news.delete + '/:newsId', '/api/admin/news/:newsId'])
    async deleteNews(@Param('newsId') newsId: string) {
        await this.deleteNewsAction.execute(newsId);
        return { message: 'News article deleted successfully' };
    }
}
