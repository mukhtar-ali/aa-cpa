import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import {
    CareersPageSettingsSchema,
    endpoint,
    JobApplicationFormModel,
    JobApplicationFormSchema,
    JobApplicationQueryModel,
    JobApplicationQuerySchema,
    JobApplicationStatusModel,
    JobApplicationStatusSchema,
    JobFormModel,
    JobFormSchema,
    JobQueryModel,
    JobQuerySchema,
    SeoPage,
    PermissionEnum,
} from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { LocaleInterceptor } from '@/common/locale.interceptor';
import { langStorage } from '@/common/i18n.helper';
import { SizeValidator } from '@/resource/size.validator';
import { PageContentService } from '@/section/page-content.service';
import { SectionService } from '@/section/section.service';
import { CreateJobService } from './services/create-job.service';
import { UpdateJobService } from './services/update-job.service';
import { GetAllJobsService } from './services/get-all-jobs.service';
import { GetJobByIdService } from './services/get-job-by-id.service';
import { GetJobBySlugService } from './services/get-job-by-slug.service';
import { DeleteJobService } from './services/delete-job.service';
import { PublishJobService } from './services/publish-job.service';
import { CreateJobApplicationService } from './services/create-job-application.service';
import { GetAllJobApplicationsService } from './services/get-all-job-applications.service';
import { GetJobApplicationByIdService } from './services/get-job-application-by-id.service';
import { UpdateJobApplicationStatusService } from './services/update-job-application-status.service';
import { DeleteJobApplicationService } from './services/delete-job-application.service';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

@Controller()
export class CareersController {
    constructor(
        private readonly sectionService: SectionService,
        private readonly pageContent: PageContentService,
        private readonly createJobAction: CreateJobService,
        private readonly updateJobAction: UpdateJobService,
        private readonly getAllJobsAction: GetAllJobsService,
        private readonly getJobByIdAction: GetJobByIdService,
        private readonly getJobBySlugAction: GetJobBySlugService,
        private readonly deleteJobAction: DeleteJobService,
        private readonly publishJobAction: PublishJobService,
        private readonly createApplicationAction: CreateJobApplicationService,
        private readonly getAllApplicationsAction: GetAllJobApplicationsService,
        private readonly getApplicationByIdAction: GetJobApplicationByIdService,
        private readonly updateApplicationStatusAction: UpdateJobApplicationStatusService,
        private readonly deleteApplicationAction: DeleteJobApplicationService,
    ) {}

    // ---- Careers page settings (hero/why/work-fields/CTA) ----

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.careersPage.web)
    async getCareersPageWeb() {
        return this.sectionService.getSection('careers-page');
    }

    /** The whole Careers page in one call: its SEO, its page settings (as `hero`) and one page of open jobs. */
    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.careersPage.pageWeb)
    async getCareersPageFullWeb(@Query(new CustomZodValidationPipe(JobQuerySchema)) query: JobQueryModel) {
        const lang = langStorage.getStore() === 'en' ? 'en' : 'ar';
        const [seo, hero, items] = await Promise.all([
            this.pageContent.getSeo(SeoPage.Careers),
            this.pageContent.getSection('careers-page'),
            this.getAllJobsAction.execute({ ...query, pageSize: this.pageContent.clampPageSize(query.pageSize) }, true, lang),
        ]);
        return { seo, hero, items };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.careersPage.settings)
    async getCareersPageSettings() {
        return this.sectionService.getSection('careers-page');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersUpdate)
    @Put(endpoint.careersPage.settings)
    async updateCareersPageSettings(
        @Body(new CustomZodValidationPipe(CareersPageSettingsSchema)) body: unknown,
    ) {
        return this.sectionService.updateSection('careers-page', body);
    }

    // ---- Jobs (Public) ----

    @Public()
    @Get('/api/jobs')
    async getPublicJobs(
        @Query(new CustomZodValidationPipe(JobQuerySchema)) query: JobQueryModel,
        @Query('lang') queryLang?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getAllJobsAction.execute(query, true, lang);
    }

    @Public()
    @Get('/api/jobs/:slug')
    async getPublicJobBySlug(
        @Param('slug') slug: string,
        @Query('lang') queryLang?: string,
        @Query('preview') previewToken?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getJobBySlugAction.execute(slug, true, lang, previewToken);
    }

    // Legacy web endpoints
    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.job.listWeb)
    async getWebJobs(@Query(new CustomZodValidationPipe(JobQuerySchema)) query: JobQueryModel) {
        const lang = langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getAllJobsAction.execute(query, true, lang);
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.job.getBySlugWeb + '/:slug')
    async getJobBySlug(@Param('slug') slug: string) {
        const lang = langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.getJobBySlugAction.execute(slug, true, lang);
    }

    // ---- Jobs (Admin) ----

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get('/api/admin/jobs')
    async getAdminJobs(@Query(new CustomZodValidationPipe(JobQuerySchema)) query: JobQueryModel) {
        return this.getAllJobsAction.execute(query, false);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.job.list)
    async getAllJobs(@Query(new CustomZodValidationPipe(JobQuerySchema)) query: JobQueryModel) {
        return this.getAllJobsAction.execute(query, false);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get('/api/admin/jobs/:jobId')
    async getAdminJobById(@Param('jobId') jobId: string) {
        return this.getJobByIdAction.execute(jobId);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.job.getById + '/:jobId')
    async getJobById(@Param('jobId') jobId: string) {
        return this.getJobByIdAction.execute(jobId);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersCreate)
    @Post('/api/admin/jobs')
    async createAdminJob(@Body(new CustomZodValidationPipe(JobFormSchema)) data: JobFormModel) {
        const job = await this.createJobAction.execute(data);
        return { job };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersCreate)
    @Post(endpoint.job.create)
    async createJob(@Body(new CustomZodValidationPipe(JobFormSchema)) data: JobFormModel) {
        const job = await this.createJobAction.execute(data);
        return { job };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersUpdate)
    @Put('/api/admin/jobs/:jobId/publish')
    async publishJob(
        @Param('jobId') jobId: string,
        @Body() body: { isPublished: boolean },
    ) {
        const job = await this.publishJobAction.publish(jobId, body?.isPublished ?? false);
        return { job };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersUpdate)
    @Put('/api/admin/jobs/:jobId')
    async updateAdminJob(
        @Param('jobId') jobId: string,
        @Body(new CustomZodValidationPipe(JobFormSchema)) data: JobFormModel,
    ) {
        const job = await this.updateJobAction.execute(jobId, data);
        return { job };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersUpdate)
    @Put(endpoint.job.update + '/:jobId')
    async updateJob(
        @Param('jobId') jobId: string,
        @Body(new CustomZodValidationPipe(JobFormSchema)) data: JobFormModel,
    ) {
        const job = await this.updateJobAction.execute(jobId, data);
        return { job };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersDelete)
    @Delete('/api/admin/jobs/:jobId')
    async deleteAdminJob(@Param('jobId') jobId: string) {
        await this.deleteJobAction.execute(jobId);
        return { message: 'Job posting deleted successfully' };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersDelete)
    @Delete(endpoint.job.delete + '/:jobId')
    async deleteJob(@Param('jobId') jobId: string) {
        await this.deleteJobAction.execute(jobId);
        return { message: 'Job posting deleted successfully' };
    }

    // ---- Applications (public submit; admin manage) ----

    @Public()
    @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
    @Post('/api/jobs/:slug/apply')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('resume'))
    async applyToJobBySlug(
        @Param('slug') slug: string,
        @Body() body: Record<string, any>,
        @UploadedFile() resume: Express.Multer.File,
        @Req() req: any,
    ) {
        return this.createApplicationAction.applyBySlug(slug, body, resume, {
            lang: req?.lang || 'ar',
            ip: req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1',
            userAgent: req?.headers?.['user-agent'] || 'unknown',
        });
    }

    @Public()
    @Throttle({ default: { limit: 20, ttl: 15 * 60 * 1000 } })
    @Post(endpoint.job.apply)
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('resume'))
    async applyToJob(
        @Body('jobId') jobId: string,
        @Body() data: Record<string, any>,
        @UploadedFile() resume: Express.Multer.File,
        @Req() req: any,
    ) {
        if (!jobId) throw new BadRequestException('jobId is required');
        return this.createApplicationAction.applyBySlug(jobId, data, resume, {
            lang: req?.lang || 'ar',
            ip: req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1',
            userAgent: req?.headers?.['user-agent'] || 'unknown',
        });
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalApplicationsExport)
    @Get('/api/admin/applications/export.csv')
    async exportApplicationsCsv(
        @Query() query: { jobId?: string; status?: string },
        @Res() res: any,
    ) {
        const csv = await this.createApplicationAction.exportCsvAdmin(query);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
        return res.status(HttpStatus.OK).send(csv);
    }

    @ProtectedWithPermissions(
        PermissionEnum.AdminPortalApplicationsView,
        PermissionEnum.AdminPortalCareersView,
    )
    @Get('/api/admin/applications')
    async getAdminApplications(
        @Query(new CustomZodValidationPipe(JobApplicationQuerySchema)) query: JobApplicationQueryModel,
    ) {
        return this.getAllApplicationsAction.execute(query);
    }

    @ProtectedWithPermissions(
        PermissionEnum.AdminPortalApplicationsView,
        PermissionEnum.AdminPortalCareersView,
    )
    @Get('/api/admin/applications/:id')
    async getAdminApplicationById(@Param('id') id: string) {
        return this.getApplicationByIdAction.execute(id);
    }

    @ProtectedWithPermissions(
        PermissionEnum.AdminPortalApplicationsUpdate,
        PermissionEnum.AdminPortalCareersUpdate,
    )
    @Patch('/api/admin/applications/:id')
    async patchAdminApplication(
        @Param('id') id: string,
        @Body() body: { status?: string; assignedToId?: string | null },
    ) {
        return this.createApplicationAction.updateStatusAdmin(id, body);
    }

    @ProtectedWithPermissions(
        PermissionEnum.AdminPortalApplicationsUpdate,
        PermissionEnum.AdminPortalCareersUpdate,
    )
    @Post('/api/admin/applications/:id/notes')
    async addAdminApplicationNote(
        @Param('id') id: string,
        @Body() body: { body?: string },
        @Req() req: any,
    ) {
        const authorId = req?.user?.id || 'admin';
        return this.createApplicationAction.addNoteAdmin(id, authorId, body?.body || '');
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalApplicationsView)
    @Get('/api/admin/applications/:id/resume')
    async downloadApplicationResume(
        @Param('id') id: string,
        @Req() req: any,
        @Res() res: any,
    ) {
        const adminId = req?.user?.id || 'admin';
        const signed = await this.createApplicationAction.issueSignedResumeUrl(id, adminId);
        return res.redirect(HttpStatus.FOUND, signed.url);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.jobApplication.list)
    async getAllApplications(
        @Query(new CustomZodValidationPipe(JobApplicationQuerySchema)) query: JobApplicationQueryModel,
    ) {
        return this.getAllApplicationsAction.execute(query);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.jobApplication.listForJob + '/:jobId')
    async getApplicationsForJob(
        @Param('jobId') jobId: string,
        @Query(new CustomZodValidationPipe(JobApplicationQuerySchema)) query: JobApplicationQueryModel,
    ) {
        return this.getAllApplicationsAction.execute(query, jobId);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.jobApplication.getById + '/:id')
    async getApplicationById(@Param('id') id: string) {
        return this.getApplicationByIdAction.execute(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersUpdate)
    @Put(endpoint.jobApplication.updateStatus + '/:id/status')
    async updateApplicationStatus(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(JobApplicationStatusSchema)) data: JobApplicationStatusModel,
    ) {
        await this.updateApplicationStatusAction.execute(id, data);
        return { message: 'Application status updated' };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersDelete)
    @Delete(endpoint.jobApplication.delete + '/:id')
    async deleteApplication(@Param('id') id: string) {
        await this.deleteApplicationAction.execute(id);
        return { message: 'Application deleted successfully' };
    }
}
