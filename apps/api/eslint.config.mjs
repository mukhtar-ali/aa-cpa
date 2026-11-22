import { nestJsConfig } from '@repo/eslint-config/nest-js';

/** @type {import("eslint").Linter.Config} */
export default [
    ...nestJsConfig,
    {
        ignores: ['.prettierrc.mjs', 'eslint.config.mjs', 'dist/**', 'prisma/generated/**'],
    },
    {
        // prisma/seed.ts is a standalone script run via ts-node, not part of the Nest app
        // bundle — it's deliberately excluded from tsconfig.json's `include` (which is scoped
        // to src/, matching rootDir/outDir for the build). Typed lint rules need a tsconfig
        // that covers the file, so fall back to untyped parsing here instead.
        files: ['prisma/**/*.ts'],
        languageOptions: {
            parserOptions: { projectService: false, project: null },
        },
        rules: {
            // Needs type info, which the disabled projectService above no longer provides here.
            '@typescript-eslint/no-floating-promises': 'off',
        },
    },
];
