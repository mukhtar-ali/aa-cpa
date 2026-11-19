import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { langStorage } from '@/common/i18n.helper';
import { ListSectorsService } from './services/list-services.service';
import { GetSectorBySlugService } from './services/get-sector-by-slug.service';

@Controller('api/sectors')
export class SectorController {
    constructor(
        private readonly listSectorsAction: ListSectorsService,
        private readonly getSectorBySlugAction: GetSectorBySlugService,
    ) {}

    @Public()
    @Get()
    async list(@Query('lang') queryLang?: string) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.listSectorsAction.listWeb(lang);
    }

    @Public()
    @Get(':slug')
    async getBySlug(
        @Param('slug') slug: string,
        @Query('lang') queryLang?: string,
        @Query('preview') previewToken?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getSectorBySlugAction.getBySlugWeb(slug, lang, previewToken);
    }
}
