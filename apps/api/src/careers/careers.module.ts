import { Module } from '@nestjs/common';
import { SectionModule } from '@/section/section.module';
import { ResourceModule } from '@/resource/resource.module';
import { EmailModule } from '@/email/email.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { CareersController } from './careers.controller';
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
import { JobDepartmentsController } from './departments/job-departments.controller';
import { JobDepartmentsService } from './departments/job-departments.service';

@Module({
    imports: [SectionModule, ResourceModule, EmailModule, PrismaModule],
    controllers: [CareersController, JobDepartmentsController],
    providers: [
        CreateJobService,
        UpdateJobService,
        GetAllJobsService,
        GetJobByIdService,
        GetJobBySlugService,
        DeleteJobService,
        PublishJobService,
        CreateJobApplicationService,
        GetAllJobApplicationsService,
        GetJobApplicationByIdService,
        UpdateJobApplicationStatusService,
        DeleteJobApplicationService,
        JobDepartmentsService,
    ],
    exports: [
        GetAllJobsService,
        GetJobBySlugService,
        JobDepartmentsService,
    ],
})
export class CareersModule {}
