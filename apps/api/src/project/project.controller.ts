import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import {
    endpoint, ListingHeroPage, PermissionEnum, SeoPage, ProjectFormModel, ProjectFormSchema,
    ProjectQueryModel, ProjectQuerySchema, RankModel, ReRankSchema,
} from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { getZodDto } from '@/common/swagger/zod-dto';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { LocaleInterceptor } from '@/common/locale.interceptor';
import { PageContentService } from '@/section/page-content.service';
import { CreateProjectService } from './services/create-project.service';
import { UpdateProjectService } from './services/update-project.service';
import { GetAllProjectsService } from './services/get-all-projects.service';
import { GetProjectByIdService } from './services/get-project-by-id.service';
import { GetProjectBySlugService } from './services/get-project-by-slug.service';
import { GetProjectsLookupService } from './services/get-projects-lookup.service';
import { DeleteProjectService } from './services/delete-project.service';
import { ReRankProjectService } from './services/re-rank-project.service';

@Controller()
export class ProjectController {
    constructor(
        private readonly createProjectAction: CreateProjectService,
        private readonly getAllProjectsAction: GetAllProjectsService,
        private readonly getProjectByIdAction: GetProjectByIdService,
        private readonly updateProjectAction: UpdateProjectService,
        private readonly deleteProjectAction: DeleteProjectService,
        private readonly getProjectBySlugAction: GetProjectBySlugService,
        private readonly getProjectsLookupAction: GetProjectsLookupService,
        private readonly reRankProjectAction: ReRankProjectService,
        private readonly pageContent: PageContentService,
    ) {}

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @ApiQuery({ type: getZodDto(ProjectQuerySchema) })
    @Get(endpoint.project.listWeb)
    async getWebProjects(@Query(new CustomZodValidationPipe(ProjectQuerySchema)) query: ProjectQueryModel) {
        return this.getAllProjectsAction.execute(query, true);
    }

    /** The whole Projects page in one call: its SEO, its hero and one page of published projects. */
    @Public()
    @UseInterceptors(LocaleInterceptor)
    @ApiQuery({ type: getZodDto(ProjectQuerySchema) })
    @Get(endpoint.project.pageWeb)
    async getProjectsPageWeb(@Query(new CustomZodValidationPipe(ProjectQuerySchema)) query: ProjectQueryModel) {
        const [seo, hero, items] = await Promise.all([
            this.pageContent.getSeo(SeoPage.Projects),
            this.pageContent.getSection(`${ListingHeroPage.Projects}-hero`),
            this.getAllProjectsAction.execute({ ...query, pageSize: this.pageContent.clampPageSize(query.pageSize) }, true),
        ]);
        return { seo, hero, items };
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.project.getBySlug + '/:projectSlug')
    async getProjectBySlug(@Param('projectSlug') projectSlug: string) {
        return this.getProjectBySlugAction.execute(projectSlug, true);
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.project.lookupWeb)
    async getProjectsLookup() {
        return this.getProjectsLookupAction.execute();
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsView)
    @ApiQuery({ type: getZodDto(ProjectQuerySchema) })
    @Get(endpoint.project.list)
    async getAllProjects(@Query(new CustomZodValidationPipe(ProjectQuerySchema)) query: ProjectQueryModel) {
        return this.getAllProjectsAction.execute(query, false);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsView)
    @Get(endpoint.project.getById + '/:projectId')
    async getProjectById(@Param('projectId') projectId: string) {
        return this.getProjectByIdAction.execute(projectId);
    }

    @ApiBody({ type: getZodDto(ProjectFormSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsCreate)
    @Post(endpoint.project.create)
    async createProject(@Body(new CustomZodValidationPipe(ProjectFormSchema)) data: ProjectFormModel) {
        const project = await this.createProjectAction.execute(data);
        return { project };
    }

    @ApiBody({ type: getZodDto(ProjectFormSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsUpdate)
    @Put(endpoint.project.update + '/:projectId')
    async updateProject(
        @Param('projectId') projectId: string,
        @Body(new CustomZodValidationPipe(ProjectFormSchema)) data: ProjectFormModel,
    ) {
        const project = await this.updateProjectAction.execute(projectId, data);
        return { project };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsDelete)
    @Delete(endpoint.project.delete + '/:projectId')
    async deleteProject(@Param('projectId') projectId: string) {
        await this.deleteProjectAction.execute(projectId);
        return { message: 'Project deleted successfully' };
    }

    @ApiBody({ type: getZodDto(ReRankSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalProjectsUpdate)
    @Put(endpoint.project.reRank)
    async reRankProject(@Body(new CustomZodValidationPipe(ReRankSchema)) data: { movedItems: RankModel[] }) {
        await this.reRankProjectAction.execute(data.movedItems);
        return { message: 'Projects re-ranked successfully' };
    }
}
