import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { JobDepartmentForm, JobDepartmentFormSchema, PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { JobDepartmentsService } from './job-departments.service';

@Controller('api')
export class JobDepartmentsController {
    constructor(private readonly departmentsService: JobDepartmentsService) {}

    @Public()
    @Get('job-departments')
    async listPublic(@Query() query: any) {
        return this.departmentsService.list(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get('admin/job-departments')
    async listAdmin(@Query() query: any) {
        return this.departmentsService.list(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get('admin/job-departments/:id')
    async getById(@Param('id') id: string) {
        return this.departmentsService.getById(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersCreate)
    @Post('admin/job-departments')
    async create(@Body(new CustomZodValidationPipe(JobDepartmentFormSchema)) data: JobDepartmentForm) {
        return this.departmentsService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersUpdate)
    @Put('admin/job-departments/:id')
    async update(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(JobDepartmentFormSchema)) data: JobDepartmentForm,
    ) {
        return this.departmentsService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersDelete)
    @Delete('admin/job-departments/:id')
    async delete(@Param('id') id: string) {
        await this.departmentsService.delete(id);
        return { message: 'Job department deleted successfully' };
    }
}
