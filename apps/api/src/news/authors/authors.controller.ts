import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AuthorForm, AuthorFormSchema, PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { AuthorsService } from './authors.service';

@Controller('api')
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @Public()
    @Get('authors')
    async listPublic(@Query() query: any) {
        return this.authorsService.list(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsView)
    @Get('admin/authors')
    async listAdmin(@Query() query: any) {
        return this.authorsService.list(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsView)
    @Get('admin/authors/:id')
    async getById(@Param('id') id: string) {
        return this.authorsService.getById(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsCreate)
    @Post('admin/authors')
    async create(@Body(new CustomZodValidationPipe(AuthorFormSchema)) data: AuthorForm) {
        return this.authorsService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsUpdate)
    @Put('admin/authors/:id')
    async update(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(AuthorFormSchema)) data: AuthorForm,
    ) {
        return this.authorsService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalNewsDelete)
    @Delete('admin/authors/:id')
    async delete(@Param('id') id: string) {
        await this.authorsService.delete(id);
        return { message: 'Author deleted successfully' };
    }
}
