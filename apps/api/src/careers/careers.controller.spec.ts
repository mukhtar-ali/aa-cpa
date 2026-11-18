import { BadRequestException, NotFoundException, ParseFilePipe } from '@nestjs/common';
import { INTERCEPTORS_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

// NestJS 11's FileTypeValidator loads `file-type` via `load-esm` dynamic `import()`,
// which throws ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING in Jest's CommonJS VM context.
// Provide a magic-byte detector matching `file-type`'s `fileTypeFromBuffer` contract.
jest.mock('load-esm', () => ({
    loadEsm: async () => ({
        fileTypeFromBuffer: async (buffer: Buffer) => {
            if (buffer && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
                return { ext: 'pdf', mime: 'application/pdf' };
            }
            if (buffer && buffer[0] === 0x89 && buffer.subarray(1, 4).toString('ascii') === 'PNG') {
                return { ext: 'png', mime: 'image/png' };
            }
            return undefined;
        },
    }),
}));
import { IS_PUBLIC_KEY } from '@/auth/decorators/public.decorator';
import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ResourceService } from '@/resource/resource.service';
import { SizeValidator } from '@/resource/size.validator';
import { PageContentService } from '@/section/page-content.service';
import { SectionService } from '@/section/section.service';
import { UsersService } from '@/users/users.service';
import { CareersController } from './careers.controller';
import { CreateJobApplicationService } from './services/create-job-application.service';
import { CreateJobService } from './services/create-job.service';
import { DeleteJobApplicationService } from './services/delete-job-application.service';
import { DeleteJobService } from './services/delete-job.service';
import { GetAllJobApplicationsService } from './services/get-all-job-applications.service';
import { GetAllJobsService } from './services/get-all-jobs.service';
import { GetJobApplicationByIdService } from './services/get-job-application-by-id.service';
import { GetJobByIdService } from './services/get-job-by-id.service';
import { GetJobBySlugService } from './services/get-job-by-slug.service';
import { UpdateJobApplicationStatusService } from './services/update-job-application-status.service';
import { UpdateJobService } from './services/update-job.service';

function getApplyToJobFilePipe(): ParseFilePipe {
    const routeArgs = Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        CareersController,
        'applyToJob',
    ) as Record<string, { index: number; pipes?: unknown[] }>;

    const uploadedFileEntry = Object.values(routeArgs).find(
        (entry) => Array.isArray(entry.pipes) && entry.pipes.some((p) => p instanceof ParseFilePipe),
    );
    const pipe = uploadedFileEntry?.pipes?.find((p): p is ParseFilePipe => p instanceof ParseFilePipe);
    if (!pipe) {
        throw new Error('ParseFilePipe not found on CareersController.applyToJob');
    }
    return pipe;
}

function makeMockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
    return {
        fieldname: 'resume',
        originalname: 'candidate-cv.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 120 * 1024, // 120 KB
        buffer: Buffer.from('%PDF-1.4 mock pdf content'),
        stream: null as never,
        destination: '',
        filename: '',
        path: '',
        ...overrides,
    };
}

describe('CareersController & CreateJobApplicationService (public jobs/apply upload)', () => {
    let controller: CareersController;
    let createApplicationService: CreateJobApplicationService;
    let prisma: {
        job: { findUnique: jest.Mock };
        jobApplication: { create: jest.Mock };
    };
    let resourceService: { uploadFile: jest.Mock };
    let emailService: { sendNewApplicationNotification: jest.Mock };
    let sectionService: { getSection: jest.Mock };

    beforeEach(async () => {
        prisma = {
            job: { findUnique: jest.fn() },
            jobApplication: { create: jest.fn() },
        };
        resourceService = {
            uploadFile: jest.fn().mockResolvedValue('https://bucket.s3.amazonaws.com/cv.pdf'),
        };
        emailService = {
            sendNewApplicationNotification: jest.fn().mockResolvedValue(undefined),
        };
        sectionService = {
            getSection: jest.fn().mockResolvedValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CareersController],
            providers: [
                CreateJobApplicationService,
                { provide: PrismaService, useValue: prisma },
                { provide: ResourceService, useValue: resourceService },
                { provide: EmailService, useValue: emailService },
                { provide: SectionService, useValue: sectionService },
                { provide: PageContentService, useValue: {} },
                { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
                { provide: UsersService, useValue: { getById: jest.fn() } },
                { provide: CreateJobService, useValue: { execute: jest.fn() } },
                { provide: UpdateJobService, useValue: { execute: jest.fn() } },
                { provide: GetAllJobsService, useValue: { execute: jest.fn() } },
                { provide: GetJobByIdService, useValue: { execute: jest.fn() } },
                { provide: GetJobBySlugService, useValue: { execute: jest.fn() } },
                { provide: DeleteJobService, useValue: { execute: jest.fn() } },
                { provide: GetAllJobApplicationsService, useValue: { execute: jest.fn() } },
                { provide: GetJobApplicationByIdService, useValue: { execute: jest.fn() } },
                { provide: UpdateJobApplicationStatusService, useValue: { execute: jest.fn() } },
                { provide: DeleteJobApplicationService, useValue: { execute: jest.fn() } },
            ],
        }).compile();

        controller = module.get<CareersController>(CareersController);
        createApplicationService = module.get<CreateJobApplicationService>(CreateJobApplicationService);
    });

    describe('Route rate-limit and access metadata on applyToJob', () => {
        it('marks applyToJob as @Public() and throttles it to 20 requests per 15 minutes', () => {
            const handler = CareersController.prototype.applyToJob;
            const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, handler);
            const limit = Reflect.getMetadata('THROTTLER:LIMITdefault', handler);
            const ttl = Reflect.getMetadata('THROTTLER:TTLdefault', handler);

            expect(isPublic).toBe(true);
            expect(limit).toBe(20);
            expect(ttl).toBe(15 * 60 * 1000);
        });
    });

    describe('Resume upload validation on applyToJob', () => {
        it('accepts a valid PDF resume via the controller ParseFilePipe and stores the application', async () => {
            const pipe = getApplyToJobFilePipe();
            const pdfFile = makeMockFile({ mimetype: 'application/pdf', size: 256 * 1024 });

            const validatedFile = await pipe.transform(pdfFile);
            expect(validatedFile).toBe(pdfFile);

            prisma.job.findUnique.mockResolvedValue({
                id: 'job-1',
                isPublished: true,
                isDeleted: false,
                translations: [{ language: 'en', title: 'Backend Engineer' }],
            });

            const res = await controller.applyToJob(
                'job-1',
                {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane@example.com',
                    phone: '+123456789',
                    coverLetter: 'Excited to apply',
                },
                validatedFile,
            );

            // Résumés are PII: uploaded with no public ACL (private), read back through signed links.
            expect(resourceService.uploadFile).toHaveBeenCalledWith(pdfFile, { visibility: 'private' });
            expect(prisma.jobApplication.create).toHaveBeenCalledWith({
                data: {
                    jobId: 'job-1',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane@example.com',
                    phone: '+123456789',
                    coverLetter: 'Excited to apply',
                    resumeUrl: 'https://bucket.s3.amazonaws.com/cv.pdf',
                },
            });
            expect(res).toEqual({ message: 'Application submitted successfully' });
        });

        it('rejects non-PDF uploads (image/png, docx, text/plain) with BadRequestException("Only PDF resumes are allowed!")', async () => {
            const pipe = getApplyToJobFilePipe();

            for (const invalidMime of [
                'image/png',
                'image/jpeg',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]) {
                const badFile = makeMockFile({
                    originalname: 'resume.docx',
                    mimetype: invalidMime,
                    buffer: Buffer.from('non-pdf binary content'),
                });

                await expect(pipe.transform(badFile)).rejects.toThrow(
                    new BadRequestException('Only PDF resumes are allowed!'),
                );
            }
        });

        it('rejects missing resume file in ParseFilePipe and in CreateJobApplicationService', async () => {
            const pipe = getApplyToJobFilePipe();

            await expect(pipe.transform(undefined as unknown as Express.Multer.File)).rejects.toThrow(
                new BadRequestException('Only PDF resumes are allowed!'),
            );

            prisma.job.findUnique.mockResolvedValue({
                id: 'job-1',
                isPublished: true,
                isDeleted: false,
                translations: [],
            });
            await expect(
                createApplicationService.execute(
                    'job-1',
                    { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
                    undefined,
                ),
            ).rejects.toThrow(new BadRequestException('A resume file is required'));
        });

        it('rejects missing jobId or unpublished/deleted job postings', async () => {
            const pdfFile = makeMockFile();

            await expect(
                controller.applyToJob(
                    '',
                    { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
                    pdfFile,
                ),
            ).rejects.toThrow(new BadRequestException('jobId is required'));

            prisma.job.findUnique.mockResolvedValueOnce({
                id: 'job-unpublished',
                isPublished: false,
                isDeleted: false,
                translations: [],
            });
            await expect(
                controller.applyToJob(
                    'job-unpublished',
                    { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
                    pdfFile,
                ),
            ).rejects.toThrow(new NotFoundException('This job posting is no longer accepting applications'));
        });

        it('validates file size limits with SizeValidator', () => {
            const validator = new SizeValidator({ maxSize: 20 * 1024 * 1024 });
            expect(validator.isValid(makeMockFile({ size: 20 * 1024 * 1024 }))).toBe(true);
            expect(validator.isValid(makeMockFile({ size: 20 * 1024 * 1024 + 1 }))).toBe(false);
            expect(validator.buildErrorMessage()).toBe('File size should not exceed 20 MB');
        });

        it('rejects an oversized PDF resume (> 5 MB) in applyToJob ParseFilePipe', async () => {
            const pipe = getApplyToJobFilePipe();
            const oversizedPdf = makeMockFile({
                mimetype: 'application/pdf',
                size: 6 * 1024 * 1024, // 6 MB
            });

            await expect(pipe.transform(oversizedPdf)).rejects.toThrow(
                new BadRequestException('File size should not exceed 5 MB'),
            );
        });

        it('enforces the 5 MB boundary in applyToJob ParseFilePipe (5 MB accepted, 5 MB + 1 byte rejected)', async () => {
            const pipe = getApplyToJobFilePipe();
            const maxAllowedBytes = 5 * 1024 * 1024;

            const exactLimitPdf = makeMockFile({
                mimetype: 'application/pdf',
                size: maxAllowedBytes,
            });
            await expect(pipe.transform(exactLimitPdf)).resolves.toBe(exactLimitPdf);

            const overByOneBytePdf = makeMockFile({
                mimetype: 'application/pdf',
                size: maxAllowedBytes + 1,
            });
            await expect(pipe.transform(overByOneBytePdf)).rejects.toThrow(
                new BadRequestException('File size should not exceed 5 MB'),
            );
        });

        it('configures FileInterceptor on applyToJob with a 5 MB fileSize limit and single-file limit', () => {
            const interceptors = Reflect.getMetadata(
                INTERCEPTORS_METADATA,
                CareersController.prototype.applyToJob,
            ) as Array<new () => { multer?: { limits?: { fileSize?: number; files?: number } } }>;

            expect(interceptors).toBeDefined();
            expect(interceptors.length).toBeGreaterThan(0);

            const interceptorInstance = new interceptors[0]();
            expect(interceptorInstance.multer?.limits).toEqual({
                fileSize: 5 * 1024 * 1024,
                files: 1,
            });
        });
    });
});
