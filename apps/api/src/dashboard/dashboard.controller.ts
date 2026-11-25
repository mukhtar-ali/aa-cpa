import { BadRequestException, Controller, Get, Query, Req } from '@nestjs/common';
import { endpoint, LeadStatsModel, LeadStatsQuerySchema, PermissionEnum } from '@repo/shared';
import { Protected, ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Protected()
    @Get(endpoint.dashboard.stats)
    async getStats() {
        return this.dashboardService.getStats();
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalLeadsView)
    @Get(endpoint.dashboard.leadStats)
    async getLeadStats(@Query() rawQuery: Record<string, any>, @Req() req: any): Promise<LeadStatsModel> {
        const parsed = LeadStatsQuerySchema.safeParse(rawQuery);
        if (!parsed.success) {
            const error = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
            throw new BadRequestException({
                statusCode: 400,
                message: 'Invalid query parameters',
                error,
                errors: parsed.error.issues,
            });
        }
        const lang = (req?.query?.lang === 'en' || req?.query?.lang === 'ar')
            ? req.query.lang
            : (req?.lang ?? (req?.headers?.['accept-language']?.toLowerCase().startsWith('en') ? 'en' : 'ar'));

        return this.dashboardService.getLeadStats(parsed.data, lang);
    }
}
