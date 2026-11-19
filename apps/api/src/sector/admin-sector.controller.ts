import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PermissionEnum, SectorForm, SectorFormSchema } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { ListSectorsService } from './services/list-services.service';
import { GetSectorBySlugService } from './services/get-sector-by-slug.service';
import { CreateSectorService } from './services/create-sector.service';
import { UpdateSectorService } from './services/update-sector.service';
import { DeleteSectorService } from './services/delete-sector.service';
import { PublishSectorService } from './services/publish-sector.service';
import { ReorderSectorsService } from './services/reorder-sectors.service';

@Controller('api/admin/sectors')
export class AdminSectorController {
    constructor(
        private readonly listSectorsAction: ListSectorsService,
        private readonly getSectorBySlugAction: GetSectorBySlugService,
        private readonly createSectorAction: CreateSectorService,
        private readonly updateSectorAction: UpdateSectorService,
        private readonly deleteSectorAction: DeleteSectorService,
        private readonly publishSectorAction: PublishSectorService,
        private readonly reorderSectorsAction: ReorderSectorsService,
    ) {}

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSectorsView)
    @Get()
    async list(@Query() query: any) {
        return this.listSectorsAction.listAdmin(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSectorsView)
    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.getSectorBySlugAction.getByIdAdmin(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSectorsCreate)
    @Post()
    async create(@Body(new CustomZodValidationPipe(SectorFormSchema)) data: SectorForm) {
        const sector = await this.createSectorAction.execute(data);
        return { sector };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSectorsUpdate)
    @Put('reorder')
    async reorder(@Body() body: { items: Array<{ id: string; order: number }> }) {
        await this.reorderSectorsAction.reorder(body?.items || []);
        return { success: true };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSectorsUpdate)
    @Put(':id/publish')
    async publish(
        @Param('id') id: string,
        @Body() body: { isPublished: boolean },
    ) {
        const sector = await this.publishSectorAction.publish(id, body?.isPublished ?? false);
        return { sector };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSectorsUpdate)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(SectorFormSchema)) data: SectorForm,
    ) {
        const sector = await this.updateSectorAction.execute(id, data);
        return { sector };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSectorsDelete)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.deleteSectorAction.delete(id);
        return { message: 'Sector deleted successfully' };
    }
}
