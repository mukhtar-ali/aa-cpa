import { describe, expect, it } from 'vitest';
import { scan, sourceFiles } from './files';

// Constitution III: layout uses logical utilities (ms-*, pe-*, start-*, text-start) so Arabic (RTL) and English (LTR) both work.
const PHYSICAL = /\b(ml|mr|pl|pr|left|right|rounded-[lr]|border-[lr]|scroll-m[lr]|scroll-p[lr])-|\btext-(left|right)\b/;

describe('web guard: no physical direction utilities', () => {
    it('uses logical properties only', () => {
        const hits = scan(sourceFiles(['.tsx']), PHYSICAL, 'physical');
        expect(hits, `Use logical utilities. Violations:\n${hits.join('\n')}`).toEqual([]);
    });
});
