import 'reflect-metadata';
import { AuthController } from './auth.controller';
import {
    AUTH_THROTTLE_TTL_MS,
    authThrottle,
    DEFAULT_AUTH_THROTTLE_LIMIT,
    MAX_AUTH_THROTTLE_LIMIT,
    resolveAuthThrottleLimit,
} from './auth-throttle';

const THROTTLER_LIMIT_DEFAULT_KEY = 'THROTTLER:LIMITdefault';
const THROTTLER_TTL_DEFAULT_KEY = 'THROTTLER:TTLdefault';

describe('auth-throttle', () => {
    describe('constants', () => {
        it('exports expected default limit, max limit, and 15-minute TTL', () => {
            expect(DEFAULT_AUTH_THROTTLE_LIMIT).toBe(10);
            expect(MAX_AUTH_THROTTLE_LIMIT).toBe(10000);
            expect(AUTH_THROTTLE_TTL_MS).toBe(15 * 60 * 1000);
        });
    });

    describe('resolveAuthThrottleLimit', () => {
        it.each([
            ['production default (no override)', { NODE_ENV: 'production' }, 10],
            ['production ignores valid override 500', { NODE_ENV: 'production', AUTH_THROTTLE_LIMIT: '500' }, 10],
            ['production ignores valid override 1', { NODE_ENV: 'production', AUTH_THROTTLE_LIMIT: '1' }, 10],
            ['development with no override fails closed to 10', { NODE_ENV: 'development' }, 10],
            ['NODE_ENV unset with no override fails closed to 10', {}, 10],
            ['NODE_ENV="Production" typo with no override fails closed to 10', { NODE_ENV: 'Production' }, 10],
            ['NODE_ENV="prod" typo with no override fails closed to 10', { NODE_ENV: 'prod' }, 10],
            ['override "500" in development', { NODE_ENV: 'development', AUTH_THROTTLE_LIMIT: '500' }, 500],
            ['override "250" in test env', { NODE_ENV: 'test', AUTH_THROTTLE_LIMIT: '250' }, 250],
            ['lower bound override "1" in development', { NODE_ENV: 'development', AUTH_THROTTLE_LIMIT: '1' }, 1],
            ['upper bound override "10000" in development', { NODE_ENV: 'development', AUTH_THROTTLE_LIMIT: '10000' }, 10000],
        ])('%s -> %i', (_label, env, expected) => {
            expect(resolveAuthThrottleLimit(env)).toBe(expected);
        });

        it.each([
            ['non-numeric "abc"', 'abc'],
            ['empty string ""', ''],
            ['zero "0"', '0'],
            ['negative "-5"', '-5'],
            ['decimal "12.5"', '12.5'],
            ['scientific notation "1e3"', '1e3'],
            ['whitespace-padded " 50 " (not trimmed)', ' 50 '],
            ['above upper bound "10001"', '10001'],
            ['above upper bound "999999"', '999999'],
            ['NaN string "NaN"', 'NaN'],
            ['undefined', undefined],
        ])('invalid override (%s) fails closed to 10', (_label, rawLimit) => {
            expect(
                resolveAuthThrottleLimit({
                    NODE_ENV: 'development',
                    AUTH_THROTTLE_LIMIT: rawLimit,
                }),
            ).toBe(DEFAULT_AUTH_THROTTLE_LIMIT);
        });
    });

    describe('authThrottle', () => {
        it('returns default throttler config with resolved limit and 15-minute TTL', () => {
            expect(authThrottle({ NODE_ENV: 'production', AUTH_THROTTLE_LIMIT: '500' })).toEqual({
                default: {
                    limit: 10,
                    ttl: 15 * 60 * 1000,
                },
            });

            expect(authThrottle({ NODE_ENV: 'development', AUTH_THROTTLE_LIMIT: '500' })).toEqual({
                default: {
                    limit: 500,
                    ttl: 15 * 60 * 1000,
                },
            });
        });
    });

    describe('AuthController @Throttle metadata', () => {
        it('attaches resolved limit and TTL under the default throttler on login and password-reset handlers', () => {
            const expectedLimit = resolveAuthThrottleLimit(process.env);

            for (const handler of [
                AuthController.prototype.login,
                AuthController.prototype.forgetPassword,
                AuthController.prototype.canResetPassword,
                AuthController.prototype.resetPassword,
            ]) {
                expect(Reflect.getMetadata(THROTTLER_LIMIT_DEFAULT_KEY, handler)).toBe(expectedLimit);
                expect(Reflect.getMetadata(THROTTLER_TTL_DEFAULT_KEY, handler)).toBe(AUTH_THROTTLE_TTL_MS);
            }
        });
    });
});
