import { Module } from '@nestjs/common';
import { SectionModule } from '@/section/section.module';
import { ResourceModule } from '@/resource/resource.module';
import { EmailModule } from '@/email/email.module';
import { CareersController } from './careers.controller';
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

@Module({
    imports: [SectionModule, ResourceModule, EmailModule],
    controllers: [CareersController],
    providers: [
        CreateJobService, UpdateJobService, GetAllJobsService, GetJobByIdService,
        GetJobBySlugService, DeleteJobService, CreateJobApplicationService,
        GetAllJobApplicationsService, GetJobApplicationByIdService,
        UpdateJobApplicationStatusService, DeleteJobApplicationService,
    ],
})
export class CareersModule {}
