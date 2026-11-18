import { isSwaggerEnabled } from './swagger';

describe('isSwaggerEnabled', () => {
    it.each([
        ['development (SWAGGER_ENABLED unset)', { NODE_ENV: 'development' }, true],
        ['development (SWAGGER_ENABLED="false")', { NODE_ENV: 'development', SWAGGER_ENABLED: 'false' }, true],
        ['test environment', { NODE_ENV: 'test' }, true],
        ['NODE_ENV unset', {}, true],
        ['NODE_ENV="Production" (case-sensitive)', { NODE_ENV: 'Production' }, true],
        ['production with SWAGGER_ENABLED unset', { NODE_ENV: 'production' }, false],
        ['production with SWAGGER_ENABLED=""', { NODE_ENV: 'production', SWAGGER_ENABLED: '' }, false],
        ['production with SWAGGER_ENABLED="false"', { NODE_ENV: 'production', SWAGGER_ENABLED: 'false' }, false],
        ['production with SWAGGER_ENABLED="TRUE"', { NODE_ENV: 'production', SWAGGER_ENABLED: 'TRUE' }, false],
        ['production with SWAGGER_ENABLED="1"', { NODE_ENV: 'production', SWAGGER_ENABLED: '1' }, false],
        ['production with SWAGGER_ENABLED="yes"', { NODE_ENV: 'production', SWAGGER_ENABLED: 'yes' }, false],
        ['production with SWAGGER_ENABLED="true "', { NODE_ENV: 'production', SWAGGER_ENABLED: 'true ' }, false],
        ['production with SWAGGER_ENABLED="true"', { NODE_ENV: 'production', SWAGGER_ENABLED: 'true' }, true],
    ])('%s -> %s', (_label, env, expected) => {
        expect(isSwaggerEnabled(env)).toBe(expected);
    });
});
