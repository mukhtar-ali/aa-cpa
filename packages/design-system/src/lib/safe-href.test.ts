import { describe, expect, it } from 'vitest';
import { safeHref } from './safe-href';

describe('safeHref', () => {
  it('keeps relative paths, fragments, queries and the allowed schemes', () => {
    for (const v of ['/about', '#top', '?page=2', 'about', '../news', 'https://aacpa.sa/x', 'http://localhost:3000', 'mailto:info@aacpa.sa', 'tel:+966555346560']) expect(safeHref(v), v).toBe(v);
  });

  it('drops script and data schemes, including obfuscated ones', () => {
    for (const v of ['javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)', 'jav\nascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4=', 'vbscript:msgbox(1)', 'file:///etc/passwd']) expect(safeHref(v), v).toBeUndefined();
  });

  it('drops protocol-relative URLs and empty values', () => {
    for (const v of ['//evil.example/x', '', '   ', undefined, null]) expect(safeHref(v as string | undefined), String(v)).toBeUndefined();
  });
});
