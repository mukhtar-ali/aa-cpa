import fs from 'node:fs';
import path from 'node:path';

export const WEB_ROOT = path.resolve(import.meta.dirname, '..', '..');

/** Source files the guards cover: everything under `app/` and `src/`, minus tests, stories, the reference harness and these guards. */
export function sourceFiles(extensions: string[] = ['.tsx', '.ts']): string[] {
    const out: string[] = [];
    const walk = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (['__guards__', 'reference', 'node_modules', '.next'].includes(entry.name)) continue;
                walk(full);
            } else if (extensions.some((e) => entry.name.endsWith(e)) && !/\.(test|spec|stories)\.tsx?$/.test(entry.name)) out.push(full);
        }
    };
    walk(path.join(WEB_ROOT, 'app'));
    walk(path.join(WEB_ROOT, 'src'));
    return out;
}

/** `[file:line, text]` for every line a pattern matches, honouring a `// allow-<tag>: reason` comment on the same or previous line. */
export function scan(files: string[], pattern: RegExp, allowTag: string): string[] {
    const allow = new RegExp(`//\\s*allow-${allowTag}:\\s*\\S+`);
    const hits: string[] = [];
    for (const file of files) {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
            if (!pattern.test(line) || allow.test(line) || (i > 0 && allow.test(lines[i - 1]))) return;
            hits.push(`${path.relative(WEB_ROOT, file)}:${i + 1}: ${line.trim()}`);
        });
    }
    return hits;
}
