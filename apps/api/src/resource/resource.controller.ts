import {
    BadRequestException,
    Controller,
    FileTypeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { endpoint, PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { SizeValidator } from './size.validator';
import { MAX_IMAGE_BYTES, MAX_PDF_BYTES, MAX_VIDEO_BYTES } from './upload-limits';
import { ResourceService } from './resource.service';

// Uploads are bandwidth/CPU-heavy (Sharp compression) — 50 per 15 min/IP, matching
// wujud's uploadLimiter.
@Throttle({ default: { limit: 50, ttl: 15 * 60 * 1000 } })
@Controller()
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {}

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Post(endpoint.upload.image)
    @UseInterceptors(
        FileInterceptor('image', {
            limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
            fileFilter: (req, file, cb) => {
                if (/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Only image files are allowed!'), false);
                }
            },
        }),
    )
    async uploadImage(@UploadedFile() image: Express.Multer.File) {
        const result = await this.resourceService.uploadImage(image);
        return { data: result.url, url: result.url, width: result.width, height: result.height };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Post(endpoint.upload.video)
    @UseInterceptors(FileInterceptor('video', { limits: { fileSize: MAX_VIDEO_BYTES, files: 1 } }))
    async uploadVideo(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /^video\/(mp4|webm|ogg)$/ }),
                    new SizeValidator({ maxSize: MAX_VIDEO_BYTES }),
                ],
                exceptionFactory: () =>
                    new BadRequestException('Only video files (mp4, webm, ogg) are allowed!'),
                fileIsRequired: true,
            }),
        )
        video: Express.Multer.File,
    ) {
        return { data: await this.resourceService.uploadFile(video) };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    @Post(endpoint.upload.pdf)
    @UseInterceptors(FileInterceptor('pdf', { limits: { fileSize: MAX_PDF_BYTES, files: 1 } }))
    async uploadPdf(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /^application\/pdf$/ }),
                    new SizeValidator({ maxSize: MAX_PDF_BYTES }),
                ],
                exceptionFactory: () => new BadRequestException('Only PDF files are allowed!'),
                fileIsRequired: true,
            }),
        )
        pdf: Express.Multer.File,
    ) {
        return { data: await this.resourceService.uploadFile(pdf) };
    }
}
