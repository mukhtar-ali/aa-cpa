import { describe, expect, it } from 'vitest';
import { scan, sourceFiles } from './files';

// Constitution II: colours, spacing and sizes come from design tokens, not raw hex/rgb or arbitrary pixel values.
const RAW = /#([0-9a-fA-F]{3,8})\b|rgba?\(|-\[\d+px\]/;

describe('web guard: no raw colours or arbitrary pixel values', () => {
    it('uses tokens only', () => {
        const hits = scan(sourceFiles(['.tsx']), RAW, 'raw');
        expect(hits, `Use design tokens. Violations:\n${hits.join('\n')}`).toEqual([]);
    });
});
