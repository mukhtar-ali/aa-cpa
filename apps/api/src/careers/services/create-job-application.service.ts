import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JobApplicationFormModel, LanguageEnum } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';
import { EmailService } from '@/email/email.service';
import { SectionService } from '@/section/section.service';

interface CareersPageSettingsData {
    notificationEmail?: string;
}

@Injectable()
export class CreateJobApplicationService {
    constructor(
        private prisma: PrismaService,
        private resourceService: ResourceService,
        private emailService: EmailService,
        private sectionService: SectionService,
    ) {}

    async execute(jobId: string, data: JobApplicationFormModel, resume?: Express.Multer.File) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { translations: true },
        });
        if (!job || job.isDeleted || !job.isPublished) {
            throw new NotFoundException('This job posting is no longer accepting applications');
        }
        if (!resume) {
            throw new BadRequestException('A resume file is required');
        }

        const resumeUrl = await this.resourceService.uploadFile(resume, { visibility: 'private' });

        await this.prisma.jobApplication.create({
            data: {
                jobId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone || undefined,
                coverLetter: data.coverLetter || undefined,
                resumeUrl,
            },
        });

        const settings = (await this.sectionService
            .getSection('careers-page')
            .catch(() => ({}))) as CareersPageSettingsData;
        if (settings.notificationEmail) {
            const jobTitle =
                job.translations.find((t) => t.language === LanguageEnum.En)?.title ?? job.translations[0]?.title;
            void this.emailService.sendNewApplicationNotification(
                settings.notificationEmail,
                jobTitle ?? 'a job posting',
                `${data.firstName} ${data.lastName}`,
            );
        }
    }
}
