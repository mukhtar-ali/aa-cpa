import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { endpoint, InquiryFormModel, InquiryFormSchema, InquiryQueryModel, InquiryQuerySchema, PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { InquiryService } from './inquiry.service';

@Controller()
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) {}

    @Public()
    @Post(endpoint.inquiry.create)
    async create(@Body(new CustomZodValidationPipe(InquiryFormSchema)) data: InquiryFormModel) {
        await this.inquiryService.create(data);
        return { message: 'Inquiry submitted successfully' };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.inquiry.list)
    async findAll(@Query(new CustomZodValidationPipe(InquiryQuerySchema)) query: InquiryQueryModel) {
        return this.inquiryService.findAll(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.inquiry.getById + '/:id')
    async findById(@Param('id') id: string) {
        return this.inquiryService.findById(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Delete(endpoint.inquiry.delete + '/:id')
    async delete(@Param('id') id: string) {
        await this.inquiryService.delete(id);
        return { message: 'Inquiry deleted successfully' };
    }
}
