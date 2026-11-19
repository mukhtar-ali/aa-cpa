import 'reflect-metadata';
import { PATH_METADATA } from '@nestjs/common/constants';
import { IS_PUBLIC_KEY } from '@/auth/decorators/public.decorator';
import { HealthController } from './health.controller';

const THROTTLER_SKIP_DEFAULT_KEY = 'THROTTLER:SKIPdefault';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(() => {
        controller = new HealthController();
    });

    it('returns { status: "ok" } with no extra fields', () => {
        expect(controller.check()).toEqual({ status: 'ok' });
    });

    it('binds GET handler to literal "api/health" path', () => {
        expect(Reflect.getMetadata(PATH_METADATA, HealthController.prototype.check)).toBe('api/health');
    });

    it('marks the check handler as @Public() via IS_PUBLIC_KEY metadata', () => {
        expect(Reflect.getMetadata(IS_PUBLIC_KEY, HealthController.prototype.check)).toBe(true);
    });

    it('marks the check handler with @SkipThrottle() via THROTTLER:SKIPdefault metadata', () => {
        expect(Reflect.getMetadata(THROTTLER_SKIP_DEFAULT_KEY, HealthController.prototype.check)).toBe(true);
    });
});
