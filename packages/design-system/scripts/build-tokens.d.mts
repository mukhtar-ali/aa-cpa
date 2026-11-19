export interface TokenVariable {
  id?: string;
  name: string;
  type: string;
  value: string | number;
  description?: string;
  a11yOverride?: boolean;
  figmaValue?: string | number;
  reason?: string;
}

export interface TokenCollection {
  name: string;
  modes?: Array<{ modeId: string; name: string }>;
  variables: TokenVariable[];
}

export interface FigmaVariablesDoc {
  version?: string;
  collections: TokenCollection[];
}

export interface BuildTokensOptions {
  inputPath: string;
  outDir: string;
}

export interface BuildTokensResult {
  cssPath: string;
  tsPath: string;
  css: string;
  ts: string;
}

export function validateTokenDoc(data: unknown): FigmaVariablesDoc;
export function toCssVariableName(name: string, type: string): string;
export function formatCssValue(value: string | number, type: string): string;
export function generateTokens(doc: FigmaVariablesDoc): { css: string; ts: string };
export function buildTokens(options: BuildTokensOptions): BuildTokensResult;
export function main(): void;
