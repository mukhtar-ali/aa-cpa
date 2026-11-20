import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from '@nestjs/common';
import { PermissionEnum } from '@repo/shared';
import { Protected, ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { PrivacyService } from './privacy.service';

@Controller('api/admin/privacy')
export class PrivacyController {
    constructor(private readonly privacyService: PrivacyService) {}

    @Post('export')
    @HttpCode(HttpStatus.OK)
    @Protected()
    async exportData(@Body() body: { email?: string }, @Req() req: any) {
        const userPerms: string[] = req?.user?.permissions ?? [];
        const hasEither =
            userPerms.includes(PermissionEnum.AdminPortalLeadsErase) ||
            userPerms.includes(PermissionEnum.AdminPortalApplicationsErase);

        if (!hasEither) {
            throw new ForbiddenException(
                'leads.erase or applications.erase permission is required for PDPL export',
            );
        }
        return this.privacyService.exportForEmail(body?.email || '');
    }

    @Post('erase')
    @HttpCode(HttpStatus.OK)
    @ProtectedWithPermissions(
        PermissionEnum.AdminPortalLeadsErase,
        PermissionEnum.AdminPortalApplicationsErase,
    )
    async eraseData(
        @Body() body: { email?: string; confirm?: boolean },
        @Req() req: any,
    ) {
        const userPerms: string[] = req?.user?.permissions ?? [];
        const hasBoth =
            userPerms.includes(PermissionEnum.AdminPortalLeadsErase) &&
            userPerms.includes(PermissionEnum.AdminPortalApplicationsErase);

        if (!hasBoth) {
            throw new ForbiddenException(
                'Both leads.erase and applications.erase permissions are required for PDPL erasure',
            );
        }

        const adminId = req?.user?.id || 'admin';
        return this.privacyService.eraseForEmail(
            body?.email || '',
            Boolean(body?.confirm),
            adminId,
        );
    }
}
