import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Put,
    Req,
} from '@nestjs/common';
import { PermissionEnum, SectionType } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { SectionService } from './section.service';
import { validateSectionData } from './section-registry';

@Controller('api/admin/sections')
export class AdminSectionController {
    constructor(private readonly sectionService: SectionService) {}

    @Get(':type')
    @ProtectedWithPermissions(
        PermissionEnum.AdminPortalSiteContentView,
        PermissionEnum.AdminPortalManageContent,
        PermissionEnum.AdminPortalEstimatorUpdate,
        PermissionEnum.AdminPortalSettingsNotifications,
    )
    async getSection(@Param('type') type: string) {
        return this.sectionService.getSection(type);
    }

    @Put(':type')
    @ProtectedWithPermissions(
        PermissionEnum.AdminPortalSiteContentUpdate,
        PermissionEnum.AdminPortalManageContent,
        PermissionEnum.AdminPortalEstimatorUpdate,
        PermissionEnum.AdminPortalSettingsNotifications,
    )
    async updateSection(
        @Param('type') type: string,
        @Body() body: unknown,
        @Req() req?: any,
    ) {
        if (req?.user?.permissions) {
            this.assertPermissionForType(type, req.user.permissions);
        }

        const validatedData = validateSectionData(type, body);
        return this.sectionService.updateSection(type, validatedData);
    }

    private assertPermissionForType(type: string, userPermissions: string[]) {
        const has = (p: string) =>
            userPermissions.includes(p) ||
            userPermissions.includes(PermissionEnum.AdminPortalManageContent);

        if (type === SectionType.EstimatorConfig) {
            if (!has(PermissionEnum.AdminPortalEstimatorUpdate)) {
                throw new ForbiddenException('Missing estimator.update permission');
            }
        } else if (
            type === SectionType.NotificationSettings ||
            type === SectionType.SpamSettings
        ) {
            if (!has(PermissionEnum.AdminPortalSettingsNotifications)) {
                throw new ForbiddenException('Missing settings.notifications permission');
            }
        } else {
            if (!has(PermissionEnum.AdminPortalSiteContentUpdate)) {
                throw new ForbiddenException('Missing site_content.update permission');
            }
        }
    }
}
