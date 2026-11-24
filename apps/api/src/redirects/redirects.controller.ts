import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionEnum } from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { RedirectsService } from './redirects.service';

@Controller()
export class RedirectsController {
    constructor(private readonly redirectsService: RedirectsService) {}

    /**
     * Public endpoint for web proxy to fetch all active redirects.
     * Cacheable (Cache-Control: public, max-age=60, s-maxage=3600).
     */
    @Get('/api/redirects/map')
    async getPublicMap(@Res() res: any) {
        const map = await this.redirectsService.getPublicMap();
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600');
        return res.status(HttpStatus.OK).json(map);
    }

    /**
     * Called by the web proxy for every redirect it serves (fire and forget); counts are batched in memory and flushed every 30 s.
     * Public but harmless: it only ever increments the counter of an existing redirect.
     */
    @Post('/api/redirects/hit')
    @HttpCode(HttpStatus.NO_CONTENT)
    recordHit(@Body() body: { path?: unknown }): void {
        if (typeof body?.path === 'string') this.redirectsService.recordHit(body.path);
    }

    /**
     * Admin export redirects as CSV.
     */
    @Get('/api/admin/redirects/export.csv')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSeoView)
    async exportCsv(@Res() res: any) {
        const csv = await this.redirectsService.exportCsvAdmin();
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="redirects.csv"');
        return res.status(HttpStatus.OK).send(csv);
    }

    /**
     * Admin list redirects.
     */
    @Get('/api/admin/redirects')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSeoView)
    async listAdmin(@Query() query: Record<string, any>) {
        return this.redirectsService.listAdmin(query as any);
    }

    /**
     * Admin get redirect by ID.
     */
    @Get('/api/admin/redirects/:id')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSeoView)
    async getByIdAdmin(@Param('id') id: string) {
        return this.redirectsService.getByIdAdmin(id);
    }

    /**
     * Admin create redirect.
     */
    @Post('/api/admin/redirects')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSeoUpdate)
    @HttpCode(HttpStatus.CREATED)
    async createAdmin(@Body() body: unknown, @Req() req: any) {
        const userId = req.user?.id;
        return this.redirectsService.createAdmin(body, userId);
    }

    /**
     * Admin update redirect.
     */
    @Put('/api/admin/redirects/:id')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSeoUpdate)
    async updateAdmin(
        @Param('id') id: string,
        @Body() body: unknown,
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        return this.redirectsService.updateAdmin(id, body, userId);
    }

    /**
     * Admin delete redirect.
     */
    @Delete('/api/admin/redirects/:id')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSeoUpdate)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAdmin(@Param('id') id: string) {
        await this.redirectsService.deleteAdmin(id);
    }

    /**
     * Admin import redirects from CSV.
     * Supports both multipart file upload and JSON/text payload.
     */
    @Post('/api/admin/redirects/import')
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSeoUpdate)
    @UseInterceptors(FileInterceptor('file'))
    async importCsv(
        @UploadedFile() file: any,
        @Body() body: any,
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        let csvContent = '';
        if (file && file.buffer) {
            csvContent = file.buffer.toString('utf-8');
        } else if (typeof body === 'string') {
            csvContent = body;
        } else if (body && body.csv) {
            csvContent = body.csv;
        } else if (body && body.content) {
            csvContent = body.content;
        }
        return this.redirectsService.importCsvAdmin(csvContent, userId);
    }
}
