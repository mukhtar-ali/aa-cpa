import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ArticleCategoryForm, ArticleCategoryFormSchema, PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { ArticleCategoriesService } from './article-categories.service';

@Controller('api')
export class ArticleCategoriesController {
    constructor(private readonly categoriesService: ArticleCategoriesService) {}

    @Public()
    @Get('article-categories')
    async listPublic(@Query() query: any) {
        return this.categoriesService.list(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsView)
    @Get('admin/article-categories')
    async listAdmin(@Query() query: any) {
        return this.categoriesService.list(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsView)
    @Get('admin/article-categories/:id')
    async getById(@Param('id') id: string) {
        return this.categoriesService.getById(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsCreate)
    @Post('admin/article-categories')
    async create(@Body(new CustomZodValidationPipe(ArticleCategoryFormSchema)) data: ArticleCategoryForm) {
        return this.categoriesService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsUpdate)
    @Put('admin/article-categories/:id')
    async update(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(ArticleCategoryFormSchema)) data: ArticleCategoryForm,
    ) {
        return this.categoriesService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsDelete)
    @Delete('admin/article-categories/:id')
    async delete(@Param('id') id: string) {
        await this.categoriesService.delete(id);
        return { message: 'Article category deleted successfully' };
    }
}
