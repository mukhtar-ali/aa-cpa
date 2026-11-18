import { Module } from '@nestjs/common';
import { SectionModule } from '@/section/section.module';
import { ProjectController } from './project.controller';
import { CreateProjectService } from './services/create-project.service';
import { UpdateProjectService } from './services/update-project.service';
import { GetAllProjectsService } from './services/get-all-projects.service';
import { GetProjectByIdService } from './services/get-project-by-id.service';
import { GetProjectBySlugService } from './services/get-project-by-slug.service';
import { GetProjectsLookupService } from './services/get-projects-lookup.service';
import { DeleteProjectService } from './services/delete-project.service';
import { ReRankProjectService } from './services/re-rank-project.service';

@Module({
    imports: [SectionModule],
    controllers: [ProjectController],
    providers: [
        CreateProjectService, UpdateProjectService, GetAllProjectsService,
        GetProjectByIdService, GetProjectBySlugService, GetProjectsLookupService,
        DeleteProjectService, ReRankProjectService,
    ],
    exports: [
        CreateProjectService, UpdateProjectService, GetAllProjectsService,
        GetProjectByIdService, GetProjectBySlugService, GetProjectsLookupService,
        DeleteProjectService,
    ],
})
export class ProjectModule {}
