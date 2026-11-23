import { describe, expect, it } from 'vitest';
import { scan, sourceFiles } from './files';

// FR-014: visible copy comes from the CMS or the label dictionaries, never from JSX or string literals in pages and components.
// Flags Arabic letters anywhere in code, and JSX text of three or more Latin words. Add `// allow-copy: reason` for a real exception.
const ARABIC = /[؀-ۿ]/;
const LATIN_SENTENCE = />\s*[A-Z][A-Za-z']+(\s+[A-Za-z']+){2,}[^<{]*</;

describe('web guard: no hard-coded copy', () => {
    const files = sourceFiles(['.tsx']).filter((f) => !f.includes(`${'src'}${'/'}monitoring`));
    it('has no Arabic literals in components or pages', () => {
        const hits = scan(files, ARABIC, 'copy');
        expect(hits, `Move copy to the CMS or dictionaries. Violations:\n${hits.join('\n')}`).toEqual([]);
    });
    it('has no English sentences in JSX text', () => {
        const hits = scan(files, LATIN_SENTENCE, 'copy');
        expect(hits, `Move copy to the CMS or dictionaries. Violations:\n${hits.join('\n')}`).toEqual([]);
    });
});
