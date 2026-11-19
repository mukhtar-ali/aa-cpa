import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
    MonitoringBatchSchema,
    MonitoringMetricsQuerySchema,
    MonitoringEventsQuerySchema,
    MonitoringErrorsQuerySchema,
    endpoint,
    PermissionEnum,
} from '@repo/shared';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@Controller()
export class MonitoringController {
    constructor(private readonly monitoringService: MonitoringService) {}

    @Throttle({ default: { limit: 100, ttl: 60000 } })
    @Post(endpoint.monitoring.ingest)
    async ingest(@Body(new CustomZodValidationPipe(MonitoringBatchSchema)) body: unknown) {
        return this.monitoringService.ingest(body as Parameters<MonitoringService['ingest']>[0]);
    }

    @ProtectedWithPermissions(PermissionEnum.MonitoringView)
    @Get(endpoint.monitoring.overview)
    async getOverview() {
        return this.monitoringService.getOverview();
    }

    @ProtectedWithPermissions(PermissionEnum.MonitoringView)
    @ApiQuery({ name: 'period', required: false })
    @ApiQuery({ name: 'type', required: false })
    @ApiQuery({ name: 'days', required: false })
    @Get(endpoint.monitoring.metrics)
    async getMetrics(@Query(new CustomZodValidationPipe(MonitoringMetricsQuerySchema)) query: unknown) {
        return this.monitoringService.getMetrics(query as Parameters<MonitoringService['getMetrics']>[0]);
    }

    @ProtectedWithPermissions(PermissionEnum.MonitoringView)
    @ApiQuery({ name: 'period', required: false })
    @ApiQuery({ name: 'name', required: false })
    @ApiQuery({ name: 'days', required: false })
    @Get(endpoint.monitoring.events)
    async getEvents(@Query(new CustomZodValidationPipe(MonitoringEventsQuerySchema)) query: unknown) {
        return this.monitoringService.getEvents(query as Parameters<MonitoringService['getEvents']>[0]);
    }

    @ProtectedWithPermissions(PermissionEnum.MonitoringView)
    @ApiQuery({ name: 'type', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Get(endpoint.monitoring.errors)
    async getErrors(@Query(new CustomZodValidationPipe(MonitoringErrorsQuerySchema)) query: unknown) {
        return this.monitoringService.getErrors(query as Parameters<MonitoringService['getErrors']>[0]);
    }

    @ProtectedWithPermissions(PermissionEnum.MonitoringView)
    @Get(`${endpoint.monitoring.errorDetail}/:id`)
    async getErrorDetail(@Param('id') id: string) {
        return this.monitoringService.getErrorDetail(id);
    }
}
