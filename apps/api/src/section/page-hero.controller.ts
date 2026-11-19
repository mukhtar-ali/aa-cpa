import { Body, Controller, Get, Param, ParseEnumPipe, Put, UseInterceptors } from '@nestjs/common';
import { endpoint, ListingHeroPage, PageHeroSchema, PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { LocaleInterceptor } from '@/common/locale.interceptor';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { SectionService } from './section.service';

const sectionType = (page: ListingHeroPage) => `${page}-hero`;

/** Hero blocks of the listing pages (projects, news). The page's SEO lives in the `Seo` model under the same key. */
@Controller(endpoint.pageHero.base)
export class PageHeroController {
    constructor(private readonly sectionService: SectionService) {}

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(':page/web')
    async getWeb(@Param('page', new ParseEnumPipe(ListingHeroPage)) page: ListingHeroPage) {
        return this.sectionService.getSection(sectionType(page));
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(':page')
    async get(@Param('page', new ParseEnumPipe(ListingHeroPage)) page: ListingHeroPage) {
        return this.sectionService.getSection(sectionType(page));
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(':page')
    async update(
        @Param('page', new ParseEnumPipe(ListingHeroPage)) page: ListingHeroPage,
        @Body(new CustomZodValidationPipe(PageHeroSchema)) body: Record<string, unknown>,
    ) {
        return this.sectionService.updateSection(sectionType(page), body);
    }
}
