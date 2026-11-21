import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config';

/** Coverage run: v8 needs an isolated worker pool here (the default threads/no-isolate setup reports 0%). Used by `pnpm test:coverage`. */
export default mergeConfig(
  base,
  defineConfig({ test: { pool: 'threads', isolate: true, fileParallelism: false } }),
);
