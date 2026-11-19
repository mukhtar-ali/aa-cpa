import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PermissionEnum, ServiceForm, ServiceFormSchema } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { ListServicesService } from './services/list-services.service';
import { GetServiceBySlugService } from './services/get-service-by-slug.service';
import { CreateServiceService } from './services/create-service.service';
import { UpdateServiceService } from './services/update-service.service';
import { DeleteServiceService } from './services/delete-service.service';
import { PublishServiceService } from './services/publish-service.service';
import { ReorderServicesService } from './services/reorder-services.service';

@Controller('api/admin/services')
export class AdminServiceController {
    constructor(
        private readonly listServicesAction: ListServicesService,
        private readonly getServiceBySlugAction: GetServiceBySlugService,
        private readonly createServiceAction: CreateServiceService,
        private readonly updateServiceAction: UpdateServiceService,
        private readonly deleteServiceAction: DeleteServiceService,
        private readonly publishServiceAction: PublishServiceService,
        private readonly reorderServicesAction: ReorderServicesService,
    ) {}

    @ProtectedWithPermissions(PermissionEnum.AdminPortalServicesView)
    @Get()
    async list(@Query() query: any) {
        return this.listServicesAction.listAdmin(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalServicesView)
    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.getServiceBySlugAction.getByIdAdmin(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalServicesCreate)
    @Post()
    async create(@Body(new CustomZodValidationPipe(ServiceFormSchema)) data: ServiceForm) {
        const service = await this.createServiceAction.execute(data);
        return { service };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalServicesUpdate)
    @Put('reorder')
    async reorder(@Body() body: { items: Array<{ id: string; order: number }> }) {
        await this.reorderServicesAction.reorder(body?.items || []);
        return { success: true };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalServicesUpdate)
    @Put(':id/publish')
    async publish(
        @Param('id') id: string,
        @Body() body: { isPublished: boolean },
    ) {
        const service = await this.publishServiceAction.publish(id, body?.isPublished ?? false);
        return { service };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalServicesUpdate)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(ServiceFormSchema)) data: ServiceForm,
    ) {
        const service = await this.updateServiceAction.execute(id, data);
        return { service };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalServicesDelete)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.deleteServiceAction.delete(id);
        return { message: 'Service deleted successfully' };
    }
}
