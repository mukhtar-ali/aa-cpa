import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PermissionEnum } from '@repo/shared';
import { Public } from '@/auth/decorators/public.decorator';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { PublicFormGuard } from '@/common/public-form.guard';
import { LeadsService } from './leads.service';

@Controller()
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) {}

    @Public()
    @UseGuards(PublicFormGuard)
    @Throttle({ default: { limit: 5, ttl: 600_000 } })
    @Post('/api/contact')
    @HttpCode(HttpStatus.CREATED)
    async submitContact(@Body() body: unknown, @Req() req: any) {
        return this.leadsService.submitContact(body, {
            lang: req?.lang || 'ar',
            ip: req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1',
            userAgent: req?.headers?.['user-agent'] || 'unknown',
        });
    }

    @Get('/api/admin/leads/export.csv')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalLeadsExport)
    async exportCsv(@Query() query: Record<string, any>, @Res() res: any) {
        const csv = await this.leadsService.exportCsvAdmin(query);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
        return res.status(HttpStatus.OK).send(csv);
    }

    @Get('/api/admin/leads')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalLeadsView)
    async listAdmin(@Query() query: Record<string, any>) {
        return this.leadsService.listAdmin(query);
    }

    @Get('/api/admin/leads/:id')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalLeadsView)
    async getByIdAdmin(@Param('id') id: string) {
        return this.leadsService.getByIdAdmin(id);
    }

    @Patch('/api/admin/leads/:id')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalLeadsUpdate)
    async updateAdmin(@Param('id') id: string, @Body() body: unknown) {
        return this.leadsService.updateAdmin(id, body);
    }

    @Post('/api/admin/leads/:id/notes')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalLeadsUpdate)
    async addNoteAdmin(
        @Param('id') id: string,
        @Body() body: { body?: string },
        @Req() req: any,
    ) {
        const authorId = req?.user?.id || 'admin';
        return this.leadsService.addNoteAdmin(id, authorId, body?.body || '');
    }
}
