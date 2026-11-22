import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(import.meta.dirname, './vitest.setup.ts')],
    css: true,
    // Generous limits: the guard tests scan hundreds of files and the first test of a run pays a cold start on slow drives.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    pool: 'threads',
    fileParallelism: false,
    isolate: false,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/__guards__/**',
        'src/**/*.mdx',
        'src/**/index.ts',
        'src/**/*.d.ts',
        'src/icons/generated/**',
      ],
    },
  },
});
