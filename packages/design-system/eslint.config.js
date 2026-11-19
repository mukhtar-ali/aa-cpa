import { config as reactConfig } from '@repo/eslint-config/react-internal';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  jsxA11y.flatConfigs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'storybook-static/**', 'coverage/**'],
  },
];
