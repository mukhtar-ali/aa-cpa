import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/auth/decorators/public.decorator';
import { PublicFormGuard } from '@/common/public-form.guard';
import { EstimatorService } from './estimator.service';

@Controller('api/estimator')
export class EstimatorController {
    constructor(private readonly estimatorService: EstimatorService) {}

    private resolveLang(req: any, queryLang?: string): string {
        if (queryLang === 'ar' || queryLang === 'en') return queryLang;
        if (req?.lang === 'ar' || req?.lang === 'en') return req.lang;
        return 'ar';
    }

    @Public()
    @Get()
    async getEstimatorConfig(@Req() req: any, @Query('lang') lang?: string) {
        return this.estimatorService.getPublicConfig(this.resolveLang(req, lang));
    }

    @Public()
    @Throttle({ default: { limit: 30, ttl: 600_000 } })
    @Post('estimate')
    @HttpCode(HttpStatus.OK)
    async computeEstimate(
        @Body() body: unknown,
        @Req() req: any,
        @Query('lang') lang?: string,
    ) {
        return this.estimatorService.computeEstimate(body, this.resolveLang(req, lang));
    }

    @Public()
    @UseGuards(PublicFormGuard)
    @Throttle({ default: { limit: 5, ttl: 600_000 } })
    @Post('quote')
    @HttpCode(HttpStatus.CREATED)
    async submitQuote(@Body() body: unknown, @Req() req: any) {
        return this.estimatorService.submitQuote(body, {
            lang: req?.lang || 'ar',
            ip: req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1',
            userAgent: req?.headers?.['user-agent'] || 'unknown',
        });
    }
}
