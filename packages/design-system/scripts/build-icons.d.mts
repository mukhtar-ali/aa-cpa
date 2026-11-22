export const DIRECTIONAL: Set<string>;
export function toPascalCase(name: string): string;
export function parseSvg(source: string, file?: string): { viewBox: string; width: number; height: number; inner: string };
export function toJsx(inner: string): string;
export function componentSource(name: string, parsed: { viewBox: string; inner: string }): string;
export function buildIcons(options?: { inputDir?: string; outDir?: string }): { outDir: string; count: number };
