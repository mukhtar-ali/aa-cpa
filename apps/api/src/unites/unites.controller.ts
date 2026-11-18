import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import {
    endpoint, PermissionEnum, UnitFormModel, UnitFormSchema,
    UnitQueryModel, UnitQuerySchema,
} from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { getZodDto } from '@/common/swagger/zod-dto';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { LocaleInterceptor } from '@/common/locale.interceptor';
import { CreateUnitService } from './services/create-unit.service';
import { UpdateUnitService } from './services/update-unit.service';
import { GetAllUnitsService } from './services/get-all-units.service';
import { GetUnitByIdService } from './services/get-unit-by-id.service';
import { GetUnitBySlugService } from './services/get-unit-by-slug.service';
import { DeleteUnitService } from './services/delete-unit.service';

@Controller()
export class UnitesController {
    constructor(
        private readonly createUnitAction: CreateUnitService,
        private readonly getAllUnitsAction: GetAllUnitsService,
        private readonly getUnitByIdAction: GetUnitByIdService,
        private readonly getUnitBySlugAction: GetUnitBySlugService,
        private readonly updateUnitAction: UpdateUnitService,
        private readonly deleteUnitAction: DeleteUnitService,
    ) {}

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @ApiQuery({ type: getZodDto(UnitQuerySchema) })
    @Get(endpoint.units.listWeb)
    async getWebUnits(@Query(new CustomZodValidationPipe(UnitQuerySchema)) query: UnitQueryModel) {
        return this.getAllUnitsAction.execute(query, true);
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.units.getBySlugWeb + '/:unitSlug')
    async getUnitBySlug(@Param('unitSlug') unitSlug: string) {
        return this.getUnitBySlugAction.execute(unitSlug, true);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsView)
    @ApiQuery({ type: getZodDto(UnitQuerySchema) })
    @Get(endpoint.units.list)
    async getAllUnits(@Query(new CustomZodValidationPipe(UnitQuerySchema)) query: UnitQueryModel) {
        return this.getAllUnitsAction.execute(query, false);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsView)
    @Get(endpoint.units.getById + '/:unitId')
    async getUnitById(@Param('unitId') unitId: string) {
        return this.getUnitByIdAction.execute(unitId);
    }

    @ApiBody({ type: getZodDto(UnitFormSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsCreate)
    @Post(endpoint.units.create + '/:projectId/units')
    async createUnit(
        @Param('projectId') projectId: string,
        @Body(new CustomZodValidationPipe(UnitFormSchema)) data: UnitFormModel,
    ) {
        const unit = await this.createUnitAction.execute(projectId, data);
        return { unit };
    }

    @ApiBody({ type: getZodDto(UnitFormSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsUpdate)
    @Put(endpoint.units.update + '/:unitId')
    async updateUnit(
        @Param('unitId') unitId: string,
        @Body(new CustomZodValidationPipe(UnitFormSchema)) data: UnitFormModel,
    ) {
        const unit = await this.updateUnitAction.execute(unitId, data);
        return { unit };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsDelete)
    @Delete(endpoint.units.delete + '/:unitId')
    async deleteUnit(@Param('unitId') unitId: string) {
        await this.deleteUnitAction.execute(unitId);
        return { message: 'Unit deleted successfully' };
    }
}
