import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
    ContactFormModel, ContactFormSchema, ContactQueryModel, ContactQuerySchema,
    ContactStatusModel, ContactStatusSchema, endpoint, PermissionEnum,
} from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { ContactService } from './contact.service';

@Controller()
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Public()
    @Post(endpoint.contact.create)
    async create(@Body(new CustomZodValidationPipe(ContactFormSchema)) data: ContactFormModel) {
        await this.contactService.create(data);
        return { message: 'Message submitted successfully' };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.contact.list)
    async findAll(@Query(new CustomZodValidationPipe(ContactQuerySchema)) query: ContactQueryModel) {
        return this.contactService.findAll(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.contact.unreadCount)
    async unreadCount() {
        return { count: await this.contactService.countUnread() };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Get(endpoint.contact.getById + '/:id')
    async findById(@Param('id') id: string) {
        return this.contactService.findById(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Put(endpoint.contact.updateStatus + '/:id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(ContactStatusSchema)) data: ContactStatusModel,
    ) {
        return this.contactService.updateStatus(id, data.status);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Delete(endpoint.contact.delete + '/:id')
    async delete(@Param('id') id: string) {
        await this.contactService.delete(id);
        return { message: 'Contact submission deleted successfully' };
    }
}
