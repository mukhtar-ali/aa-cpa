#!/usr/bin/env node
/**
 * @file build-tokens.mjs
 * Generates CSS custom properties (tokens.css) and TypeScript token definitions (tokens.ts)
 * from Figma variables JSON.
 *
 * Schema Definition:
 * @typedef {Object} FigmaVariable
 * @property {string} name - Variable name, e.g. "bg/page", "action/primary", "spacing/24"
 * @property {string|number} value - Shipped value to emit in CSS, e.g. "#228664", "24px", 24
 * @property {string} [type] - Variable type ("COLOR" | "FLOAT" | "STRING" | "BOOLEAN")
 * @property {string|number} [figmaValue] - Original Figma value if overridden for a11y
 * @property {boolean} [a11yOverride] - True if value was overridden for contrast/a11y
 * @property {string} [reason] - Rationale for a11y override
 * @property {string} [description] - Usage notes or description
 *
 * @typedef {Object} FigmaVariablesDoc
 * @property {FigmaVariable[]} [variables]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Validates the parsed token document.
 * @param {unknown} data
 * @returns {FigmaVariable[]}
 */
export function validateTokenDoc(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed token input: Root must be an object or array.');
  }

  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(/** @type {any} */ (data).variables)
      ? /** @type {any} */ (data).variables
      : null;

  if (!rawList) {
    throw new Error(
      'Malformed token input: Expected a top-level array or an object with a "variables" array.',
    );
  }

  if (rawList.length === 0) {
    throw new Error('Malformed token input: Variables array must not be empty.');
  }

  const validated = [];

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (!item || typeof item !== 'object') {
      throw new Error(`Malformed token at index ${i}: Token entry must be an object.`);
    }

    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      throw new Error(`Malformed token at index ${i}: "name" is required and must be a non-empty string.`);
    }

    if (item.value === undefined || item.value === null || item.value === '') {
      throw new Error(`Malformed token at index ${i} ("${item.name}"): "value" is required.`);
    }

    if (typeof item.value !== 'string' && typeof item.value !== 'number') {
      throw new Error(
        `Malformed token at index ${i} ("${item.name}"): "value" must be a string or number, received ${typeof item.value}.`,
      );
    }

    if (item.a11yOverride) {
      if (!item.figmaValue) {
        throw new Error(
          `Malformed token at index ${i} ("${item.name}"): "figmaValue" is required when a11yOverride is true.`,
        );
      }
      if (!item.reason || typeof item.reason !== 'string' || item.reason.trim() === '') {
        throw new Error(
          `Malformed token at index ${i} ("${item.name}"): "reason" is required when a11yOverride is true.`,
        );
      }
    }

    validated.push({
      name: item.name.trim(),
      value: item.value,
      type: item.type ? String(item.type).trim() : undefined,
      figmaValue: item.figmaValue,
      a11yOverride: Boolean(item.a11yOverride),
      reason: item.reason,
      description: item.description,
    });
  }

  return validated;
}

/**
 * Normalizes Figma group/name into a CSS custom property name.
 * e.g. "bg/page" -> "--color-bg-page"
 *      "action/primary" -> "--color-action-primary"
 *      "spacing/24" -> "--spacing-24"
 *      "radius/32" -> "--radius-32"
 * @param {string} rawName
 * @param {string|undefined} type
 * @param {string|number} value
 * @returns {string}
 */
export function toCssVariableName(rawName, type, value) {
  // Normalize segments: split by / or whitespace, replace symbols with hyphens
  const cleaned = rawName
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();

  const isColor =
    type?.toUpperCase() === 'COLOR' ||
    (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb')));

  if (isColor) {
    if (!cleaned.startsWith('color-')) {
      return `--color-${cleaned}`;
    }
  }

  return `--${cleaned}`;
}

/**
 * Normalizes token value for CSS output.
 * @param {string|number} value
 * @param {string} varName
 * @returns {string}
 */
export function formatCssValue(value, varName) {
  if (typeof value === 'number') {
    if (
      varName.includes('spacing') ||
      varName.includes('radius') ||
      varName.includes('font-size')
    ) {
      return `${value}px`;
    }
    return String(value);
  }
  return String(value);
}

/**
 * Generates tokens.css and tokens.ts contents from validated token list.
 * @param {FigmaVariable[]} variables
 * @returns {{ css: string, ts: string, tokens: Array<{ name: string, value: string, isColor: boolean }> }}
 */
export function generateTokens(variables) {
  const tokenMap = new Map();

  for (const item of variables) {
    // Shipped value is always used (honouring a11yOverride)
    const varName = toCssVariableName(item.name, item.type, item.value);
    const cssValue = formatCssValue(item.value, varName);
    const isColor = varName.startsWith('--color-');
    tokenMap.set(varName, { name: varName, value: cssValue, isColor });
  }

  // Sort deterministically by token name
  const sortedTokens = Array.from(tokenMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Generate tokens.css
  const cssLines = [
    '/* Generated by build-tokens.mjs - DO NOT EDIT MANUALLY */',
    ':root {',
    ...sortedTokens.map((t) => `  ${t.name}: ${t.value};`),
    '}',
    '',
  ];
  const css = cssLines.join('\n');

  // Generate tokens.ts
  const colorTokens = sortedTokens.filter((t) => t.isColor).map((t) => t.name);
  const allTokens = sortedTokens.map((t) => t.name);

  const tsLines = [
    '/**',
    ' * Generated by build-tokens.mjs - DO NOT EDIT MANUALLY',
    ' */',
    '',
    'export const colorTokens = [',
    ...colorTokens.map((name) => `  '${name}',`),
    '] as const;',
    '',
    'export type ColorToken = (typeof colorTokens)[number];',
    '',
    'export const allTokens = [',
    ...allTokens.map((name) => `  '${name}',`),
    '] as const;',
    '',
    'export type DesignToken = (typeof allTokens)[number];',
    'export type TokenName = DesignToken;',
    '',
    'export const tokenValues = {',
    ...sortedTokens.map((t) => `  '${t.name}': '${t.value.replace(/'/g, "\\'")}',`),
    '} as const;',
    '',
  ];
  const ts = tsLines.join('\n');

  return { css, ts, tokens: sortedTokens };
}

/**
 * Main buildTokens function.
 * @param {{ inputPath?: string, outDir?: string }} options
 */
export function buildTokens(options = {}) {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const packageDir = path.resolve(scriptDir, '..');

  const inputPath = options.inputPath
    ? path.resolve(process.cwd(), options.inputPath)
    : path.resolve(packageDir, 'tokens/figma-variables.json');

  const outDir = options.outDir
    ? path.resolve(process.cwd(), options.outDir)
    : path.resolve(packageDir, 'src');

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input token file not found at: ${inputPath}`);
  }

  const rawJson = fs.readFileSync(inputPath, 'utf-8');
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    throw new Error(`Failed to parse JSON at ${inputPath}: ${err.message}`);
  }

  const validated = validateTokenDoc(parsed);
  const { css, ts } = generateTokens(validated);

  const stylesDir = path.join(outDir, 'styles');
  const libDir = path.join(outDir, 'lib');

  fs.mkdirSync(stylesDir, { recursive: true });
  fs.mkdirSync(libDir, { recursive: true });

  const cssPath = path.join(stylesDir, 'tokens.css');
  const tsPath = path.join(libDir, 'tokens.ts');

  fs.writeFileSync(cssPath, css, 'utf-8');
  fs.writeFileSync(tsPath, ts, 'utf-8');

  return { cssPath, tsPath, count: validated.length };
}

// CLI Execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let inputArg;
  let outDirArg;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      inputArg = args[++i];
    } else if (args[i] === '--out-dir' || args[i] === '-o') {
      outDirArg = args[++i];
    }
  }

  try {
    const result = buildTokens({ inputPath: inputArg, outDir: outDirArg });
    console.log(`Successfully built ${result.count} design tokens:`);
    console.log(`  CSS: ${result.cssPath}`);
    console.log(`  TS:  ${result.tsPath}`);
  } catch (error) {
    console.error(`build-tokens error: ${error.message}`);
    process.exit(1);
  }
}
