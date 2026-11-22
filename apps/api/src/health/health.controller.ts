import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@/auth/decorators/public.decorator';

@Controller()
export class HealthController {
    @Public()
    @SkipThrottle()
    @Get('api/health')
    check(): { status: 'ok' } {
        return { status: 'ok' };
    }
}
