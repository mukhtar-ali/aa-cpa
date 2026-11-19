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
    pool: 'threads',
    fileParallelism: false,
    isolate: false,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/__guards__/**',
      ],
    },
  },
});
