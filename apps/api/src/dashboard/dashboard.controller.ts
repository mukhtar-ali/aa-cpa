import { Controller, Get } from '@nestjs/common';
import { endpoint } from '@repo/shared';
import { Protected } from '@/auth/decorators/auth.decorator';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Protected()
    @Get(endpoint.dashboard.stats)
    async getStats() {
        return this.dashboardService.getStats();
    }
}
