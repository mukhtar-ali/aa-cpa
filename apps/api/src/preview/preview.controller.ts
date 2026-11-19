import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { PermissionEnum } from '@repo/shared';
import { z } from 'zod';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { PreviewService } from './preview.service';

const PreviewTokenRequestSchema = z.object({
    kind: z.enum(['page', 'service', 'sector', 'article', 'job']),
    key: z.string().min(1, 'Preview key is required'),
});

@Controller('api/preview')
export class PreviewController {
    constructor(private readonly previewService: PreviewService) {}

    @Post('token')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalManageContent)
    issueToken(@Body() body: unknown) {
        const parsed = PreviewTokenRequestSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Invalid preview token request',
                errors: parsed.error.issues,
            });
        }
        return this.previewService.issueToken(parsed.data);
    }
}
