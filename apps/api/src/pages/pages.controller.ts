import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { PagesService } from './pages.service';
import { SectionService } from '@/section/section.service';

@Controller()
export class PagesController {
    constructor(
        private readonly pagesService: PagesService,
        private readonly sectionService: SectionService,
    ) {}

    private resolveLang(req: any, queryLang?: string): string {
        if (queryLang === 'ar' || queryLang === 'en') return queryLang;
        if (req?.lang === 'ar' || req?.lang === 'en') return req.lang;
        return 'ar';
    }

    @Public()
    @Get('/api/site/chrome')
    async getSiteChrome(@Req() req: any, @Query('lang') lang?: string) {
        return this.pagesService.getSiteChrome(this.resolveLang(req, lang));
    }

    @Public()
    @Get('/api/site/seo-global')
    async getSeoGlobal() {
        return this.sectionService.getSection('seo-global').catch(() => ({}));
    }

    @Public()
    @Get('/api/pages/home')
    async getHomePage(@Req() req: any, @Query('lang') lang?: string) {
        return this.pagesService.getHomePage(this.resolveLang(req, lang));
    }

    @Public()
    @Get('/api/pages/about')
    async getAboutPage(@Req() req: any, @Query('lang') lang?: string) {
        return this.pagesService.getAboutPage(this.resolveLang(req, lang));
    }

    @Public()
    @Get('/api/pages/services')
    async getServicesPage(@Req() req: any, @Query('lang') lang?: string) {
        return this.pagesService.getServicesPage(this.resolveLang(req, lang));
    }

    @Public()
    @Get('/api/pages/sectors')
    async getSectorsPage(@Req() req: any, @Query('lang') lang?: string) {
        return this.pagesService.getSectorsPage(this.resolveLang(req, lang));
    }

    @Public()
    @Get('/api/pages/articles')
    async getArticlesPage(
        @Req() req: any,
        @Query('lang') lang?: string,
        @Query('category') category?: string,
        @Query('sector') sector?: string,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        return this.pagesService.getArticlesPage(this.resolveLang(req, lang), {
            category,
            sector,
            page,
            pageSize,
        });
    }

    @Public()
    @Get('/api/pages/careers')
    async getCareersPage(
        @Req() req: any,
        @Query('lang') lang?: string,
        @Query('department') department?: string,
    ) {
        return this.pagesService.getCareersPage(this.resolveLang(req, lang), {
            department,
        });
    }

    @Public()
    @Get('/api/pages/contact')
    async getContactPage(@Req() req: any, @Query('lang') lang?: string) {
        return this.pagesService.getContactPage(this.resolveLang(req, lang));
    }

    @Public()
    @Get('/api/pages/legal/:key')
    async getLegalPage(
        @Param('key') key: string,
        @Req() req: any,
        @Query('lang') lang?: string,
    ) {
        return this.pagesService.getLegalPage(key, this.resolveLang(req, lang));
    }
}
