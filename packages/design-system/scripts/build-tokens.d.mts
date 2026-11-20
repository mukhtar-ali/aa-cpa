export interface FigmaVariable {
  name: string;
  value: string | number;
  type?: string;
  figmaValue?: string | number;
  a11yOverride?: boolean;
  reason?: string;
  description?: string;
}

export interface FigmaVariablesDoc {
  variables: FigmaVariable[];
}

export interface GeneratedToken {
  name: string;
  value: string;
  isColor: boolean;
}

export interface BuildTokensOptions {
  inputPath?: string;
  outDir?: string;
}

export function validateTokenDoc(data: unknown): FigmaVariable[];
export function toCssVariableName(rawName: string, type: string | undefined, value: string | number): string;
export function formatCssValue(value: string | number, varName: string): string;
export function generateTokens(variables: FigmaVariable[]): { css: string; ts: string; tokens: GeneratedToken[] };
export function buildTokens(options?: BuildTokensOptions): { cssPath: string; tsPath: string; count: number };
