import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { OutboxService } from './outbox.service';

@Controller('api/admin/outbox')
export class OutboxController {
    constructor(private readonly outboxService: OutboxService) {}

    @Get()
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSettingsNotifications)
    async list(@Query('status') status?: string) {
        return this.outboxService.listAdmin(status);
    }

    @Post(':id/retry')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSettingsNotifications)
    async retry(@Param('id') id: string) {
        return this.outboxService.retry(id);
    }
}
