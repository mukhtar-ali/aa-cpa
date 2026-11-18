import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    Param,
    ParseFilePipe,
    Post,
    Put,
    Query,
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
import { SizeValidator } from '@/resource/size.validator';
import { PageContentService } from '@/section/page-content.service';
import { SectionService } from '@/section/section.service';
import { CreateJobService } from './services/create-job.service';
import { UpdateJobService } from './services/update-job.service';
import { GetAllJobsService } from './services/get-all-jobs.service';
import { GetJobByIdService } from './services/get-job-by-id.service';
import { GetJobBySlugService } from './services/get-job-by-slug.service';
import { DeleteJobService } from './services/delete-job.service';
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
        const [seo, hero, items] = await Promise.all([
            this.pageContent.getSeo(SeoPage.Careers),
            this.pageContent.getSection('careers-page'),
            this.getAllJobsAction.execute({ ...query, pageSize: this.pageContent.clampPageSize(query.pageSize) }, true),
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

    // ---- Jobs ----

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.job.listWeb)
    async getWebJobs(@Query(new CustomZodValidationPipe(JobQuerySchema)) query: JobQueryModel) {
        return this.getAllJobsAction.execute(query, true);
    }

    @Public()
    @UseInterceptors(LocaleInterceptor)
    @Get(endpoint.job.getBySlugWeb + '/:slug')
    async getJobBySlug(@Param('slug') slug: string) {
        return this.getJobBySlugAction.execute(slug, true);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.job.list)
    async getAllJobs(@Query(new CustomZodValidationPipe(JobQuerySchema)) query: JobQueryModel) {
        return this.getAllJobsAction.execute(query, false);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersView)
    @Get(endpoint.job.getById + '/:jobId')
    async getJobById(@Param('jobId') jobId: string) {
        return this.getJobByIdAction.execute(jobId);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalCareersCreate)
    @Post(endpoint.job.create)
    async createJob(@Body(new CustomZodValidationPipe(JobFormSchema)) data: JobFormModel) {
        const job = await this.createJobAction.execute(data);
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
    @Delete(endpoint.job.delete + '/:jobId')
    async deleteJob(@Param('jobId') jobId: string) {
        await this.deleteJobAction.execute(jobId);
        return { message: 'Job posting deleted successfully' };
    }

    // ---- Applications (public submit; admin manage) ----

    // Public, unauthenticated candidates apply here with a resume file — throttled like
    // the general upload endpoints since it also processes/stores a file.
    @Public()
    @Throttle({ default: { limit: 20, ttl: 15 * 60 * 1000 } })
    @Post(endpoint.job.apply)
    @UseInterceptors(
        FileInterceptor('resume', {
            limits: { fileSize: MAX_RESUME_SIZE_BYTES, files: 1 },
        }),
    )
    async applyToJob(
        @Body('jobId') jobId: string,
        @Body(new CustomZodValidationPipe(JobApplicationFormSchema)) data: JobApplicationFormModel,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /^application\/pdf$/ }),
                    new SizeValidator({ maxSize: MAX_RESUME_SIZE_BYTES }),
                ],
                exceptionFactory: (error: string) =>
                    new BadRequestException(
                        error.includes('File size') ? error : 'Only PDF resumes are allowed!',
                    ),
                fileIsRequired: true,
            }),
        )
        resume: Express.Multer.File,
    ) {
        if (!jobId) throw new BadRequestException('jobId is required');
        await this.createApplicationAction.execute(jobId, data, resume);
        return { message: 'Application submitted successfully' };
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
