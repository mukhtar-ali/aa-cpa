import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { langStorage } from '@/common/i18n.helper';
import { ListServicesService } from './services/list-services.service';
import { GetServiceBySlugService } from './services/get-service-by-slug.service';

@Controller('api/services')
export class ServiceController {
    constructor(
        private readonly listServicesAction: ListServicesService,
        private readonly getServiceBySlugAction: GetServiceBySlugService,
    ) {}

    @Public()
    @Get()
    async list(@Query('lang') queryLang?: string) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.listServicesAction.listWeb(lang);
    }

    @Public()
    @Get(':slug')
    async getBySlug(
        @Param('slug') slug: string,
        @Query('lang') queryLang?: string,
        @Query('preview') previewToken?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getServiceBySlugAction.getBySlugWeb(slug, lang, previewToken);
    }
}
