import { Body, Controller, Get, Put, Query, UseInterceptors } from '@nestjs/common';
import { endpoint, PermissionEnum, SeoModel, SeoSchema } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { LocaleInterceptor } from '@/common/locale.interceptor';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { SeoService } from './seo.service';

@Controller()
export class SeoController {
    constructor(private readonly seoService: SeoService) {}

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.seo.web)
    async getSeoWeb(@Query('pageKey') pageKey: string) {
        return this.seoService.getByPageKey(pageKey);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.seo.getByPageKey)
    async getSeo(@Query('pageKey') pageKey: string) {
        return this.seoService.getByPageKey(pageKey);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.seo.update)
    async updateSeo(@Body(new CustomZodValidationPipe(SeoSchema)) data: SeoModel) {
        return this.seoService.update(data);
    }
}
