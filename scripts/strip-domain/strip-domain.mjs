#!/usr/bin/env node
/**
 * Turns this repository into the generic "core starter" (MUK-474): keeps Auth, Users/RBAC, uploads (S3),
 * Email, Monitoring, Settings/SEO and the generic Section CMS, and removes the Real-Estate / corporate-CMS
 * domain: Projects, Units, Inquiries, Contact submissions, News and Careers (+ job applications) across the
 * API, Prisma schema (with a DROP migration), admin portal, public web app and e2e specs.
 *
 *   node scripts/strip-domain/strip-domain.mjs            # dry run: prints what would change
 *   node scripts/strip-domain/strip-domain.mjs --apply    # does it
 *
 * Run it on a clean git tree (so `git diff` / `git checkout .` can review or undo it), then see
 * docs/STARTER_CORE.md for the follow-up commands. Every patch asserts that its target text exists, and --apply
 * first runs the whole script as a dry run, so if the repo drifted from what this script expects it stops
 * before writing anything.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TEMPLATES = join(dirname(fileURLToPath(import.meta.url)), 'templates');
const APPLY = process.argv.includes('--apply');
// --apply first runs the whole script as a dry run (which checks every file and patch without writing) and
// only proceeds when that passes, so a drifted repo is rejected before anything is deleted or rewritten.
if (APPLY && !process.env.STRIP_DOMAIN_PRECHECKED) {
    try {
        execFileSync(process.execPath, [fileURLToPath(import.meta.url)], { stdio: 'pipe', env: { ...process.env, STRIP_DOMAIN_PRECHECKED: '1' } });
    } catch (e) {
        console.error(String(e.stderr ?? e.message));
        console.error('Pre-check failed: nothing was changed.');
        process.exit(1);
    }
}

const log = (...a) => console.log(APPLY ? '' : '[dry-run]', ...a);
const abs = (p) => join(ROOT, p);

let failed = false;
const fail = (msg) => {
    failed = true;
    console.error(`ERROR: ${msg}`);
};

// ---------------------------------------------------------------------------------------------- delete
const DELETE = [
    // API modules
    ...['project', 'unites', 'news', 'careers', 'inquiry', 'contact'].map((m) => `apps/api/src/${m}`),
    // admin features, routes and API clients
    ...['projects', 'units', 'news', 'careers', 'inquiries', 'contact-submissions', 'home', 'about-page', 'contact-page'].map(
        (f) => `apps/admin/src/features/${f}`,
    ),
    ...['projects', 'news', 'careers', 'inquiries', 'contact-submissions', 'home', 'about-page', 'contact-page'].map(
        (r) => `apps/admin/src/routes/_authenticated/${r}`,
    ),
    ...['about', 'careers', 'contact-page', 'contact-submissions', 'home', 'inquiries', 'news', 'projects', 'units'].map(
        (f) => `apps/admin/src/lib/${f}-api.ts`,
    ),
    ...['content-overview', 'content-pipeline', 'pending-actions', 'quick-action-cards', 'activity-timeline'].map(
        (c) => `apps/admin/src/features/dashboard/components/${c}.tsx`,
    ),
    // one-off script built on the careers module / job applications
    'apps/api/prisma/move-resumes-to-private.ts',
    // API specs written against the removed list services
    'apps/api/src/common/list-filters.spec.ts',
    // public web
    ...['[slug]', 'about', 'careers', 'contact', 'news', '_components'].map((p) => `apps/web/app/[lang]/${p}`),
    ...['careers', 'contact', 'units'].map((c) => `apps/web/src/components/${c}`),
    // e2e specs that exercise the removed domain (see docs/STARTER_CORE.md)
    ...[
        '04-admin-projects',
        '05-admin-news-careers',
        '06-admin-inquiries-contacts',
        '08-public-web',
        '07-admin-cms-settings',
        '09-cross-system-e2e',
    ].map((s) => `e2e/specs/${s}.spec.ts`),
];

// ---------------------------------------------------------------------------------------------- helpers
function read(p) {
    return readFileSync(abs(p), 'utf8');
}
function write(p, s) {
    if (APPLY) writeFileSync(abs(p), s);
}

/** Apply a patch function to a file, failing loudly when the file is missing or nothing changed. */
function patch(p, fn) {
    if (!existsSync(abs(p))) return fail(`${p}: file not found`);
    const before = read(p);
    let after;
    try {
        after = fn(before);
    } catch (e) {
        return fail(`${p}: ${e.message}`);
    }
    if (after === before) return fail(`${p}: patch changed nothing (repo drifted from what the script expects)`);
    write(p, after);
    log(`patched  ${p}`);
}

function mustReplace(src, pattern, replacement) {
    const next = src.replace(pattern, replacement);
    if (next === src) throw new Error(`pattern not found: ${pattern}`);
    return next;
}

/** Removes the `{ ... }` object literal that contains `marker` (and its trailing comma/newline). */
function removeObjectContaining(src, marker) {
    const at = src.indexOf(marker);
    if (at === -1) throw new Error(`marker not found: ${marker}`);
    let start = at;
    for (let depth = 0; start >= 0; start--) {
        const ch = src[start];
        if (ch === '}') depth++;
        else if (ch === '{') {
            if (depth === 0) break;
            depth--;
        }
    }
    let end = start;
    for (let depth = 0; end < src.length; end++) {
        if (src[end] === '{') depth++;
        else if (src[end] === '}' && --depth === 0) break;
    }
    // swallow the comma and the rest of the line, plus the indentation before the object
    let tail = end + 1;
    if (src[tail] === ',') tail++;
    if (src[tail] === '\n') tail++;
    let head = start;
    while (head > 0 && src[head - 1] === ' ') head--;
    return src.slice(0, head) + src.slice(tail);
}

// ---------------------------------------------------------------------------------------------- run
if (!existsSync(abs('pnpm-workspace.yaml'))) fail('run this from inside the repository');

for (const p of DELETE) {
    if (!existsSync(abs(p))) {
        fail(`${p}: expected to exist (already stripped, or the repo drifted)`);
        continue;
    }
    log(`delete   ${p}`);
    if (APPLY) rmSync(abs(p), { recursive: true, force: true });
}

// API module registration
patch('apps/api/src/app.module.ts', (s) => {
    for (const name of ['Project', 'Unites', 'Inquiry', 'Contact', 'News', 'Careers']) {
        s = mustReplace(s, new RegExp(`^import \\{ ${name}Module \\} from .*\\n`, 'm'), '');
        s = mustReplace(s, new RegExp(`^\\s+${name}Module,\\n`, 'm'), '');
    }
    return s;
});

// The package.json script that runs the removed résumé migration
patch('apps/api/package.json', (s) => mustReplace(s, /^\s+"resumes:make-private":.*\n/m, ''));

// Prisma schema: models + their enums
patch('apps/api/prisma/schema.prisma', (s) => {
    const models = ['Project', 'ProjectTranslation', 'Unit', 'UnitTranslation', 'Inquiry', 'Contact', 'News', 'NewsTranslation', 'Job', 'JobTranslation', 'JobApplication'];
    for (const m of models) s = mustReplace(s, new RegExp(`^model ${m} \\{[\\s\\S]*?^\\}\\n\\n?`, 'm'), '');
    for (const e of ['NewsTag', 'EmploymentType', 'JobApplicationStatus']) {
        s = mustReplace(s, new RegExp(`^enum ${e} \\{[\\s\\S]*?^\\}\\n\\n?`, 'm'), '');
    }
    return s;
});

// Migration that drops the removed tables (children first; foreign-key checks off for the DROPs)
const STAMP = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
const MIGRATION_DIR = `apps/api/prisma/migrations/${STAMP}_strip_domain`;
{
    const tables = ['job_applications', 'job_translations', 'jobs', 'news_translations', 'news', 'unit_translations', 'units', 'inquiries', 'contacts', 'project_translations', 'projects'];
    const sql = `-- Generated by scripts/strip-domain: removes the Real-Estate / corporate-CMS tables.\nSET FOREIGN_KEY_CHECKS = 0;\n${tables.map((t) => `DROP TABLE IF EXISTS \`${t}\`;`).join('\n')}\nSET FOREIGN_KEY_CHECKS = 1;\n`;
    log(`write    ${MIGRATION_DIR}/migration.sql`);
    if (APPLY) {
        mkdirSync(abs(MIGRATION_DIR), { recursive: true });
        writeFileSync(abs(`${MIGRATION_DIR}/migration.sql`), sql);
    }
}

// Admin sidebar
patch('apps/admin/src/components/layout/data/sidebar-data.ts', (s) => {
    for (const marker of ["id: 'inquiries'", "id: 'contact-submissions'"]) s = removeObjectContaining(s, marker);
    s = removeObjectContaining(s, "title: 'Content'");
    for (const icon of ['Landmark', 'Newspaper', 'Briefcase', 'FileText', 'Phone', 'Mail']) {
        s = mustReplace(s, new RegExp(`^\\s+${icon},\\n`, 'm'), '');
    }
    s = mustReplace(s, /^\s+Home as HomeIcon,\n/m, '');
    return s;
});

// Admin nav badge for contact submissions
patch('apps/admin/src/components/layout/nav-group.tsx', (s) => {
    s = mustReplace(s, /^import \{ useContactSubmissionsUnreadCount \}.*\n/m, '');
    s = mustReplace(s, /\/\*\* Live unread-count badge[\s\S]*?\n\}\n\n/, '');
    s = mustReplace(s, /^\s+if \(item\.id === 'contact-submissions'\).*\n/m, '');
    return s;
});

// Web layout no longer feeds the header a project list
patch('apps/web/app/[lang]/layout.tsx', (s) => {
    s = mustReplace(s, 'import { getHeaderProjects, getWebsiteInfo }', 'import { getWebsiteInfo }');
    s = mustReplace(s, /const \[seo, websiteInfo, headerProjects\] = await Promise\.all\(\[\n\s+getGlobalSeo\(lang\),\n\s+getWebsiteInfo\(lang\),\n\s+getHeaderProjects\(lang\),\n\s+\]\);/, 'const [seo, websiteInfo] = await Promise.all([getGlobalSeo(lang), getWebsiteInfo(lang)]);');
    return mustReplace(s, ' projects={headerProjects}', '');
});
patch('apps/web/src/components/ui/layouts/WebLayout.tsx', (s) => {
    s = mustReplace(s, /^import type \{ HeaderProject \}.*\n/m, '');
    s = mustReplace(s, /^\s+projects\?: HeaderProject\[\];\n/m, '');
    s = mustReplace(s, '({ children, websiteInfo, projects })', '({ children, websiteInfo })');
    return mustReplace(s, '<CustomHeader projects={projects} />', '<CustomHeader />');
});
patch('apps/web/src/lib/server-data.ts', (s) => mustReplace(s, /\nexport interface HeaderProject[\s\S]*$/, ''));

// e2e specs that stay: drop only the assertions about the removed screens
patch('e2e/specs/02-admin-dashboard.spec.ts', (s) => {
    s = mustReplace(s, /  test\('TC-DASH-01[\s\S]*?\n  \}\);\n\n/, '');
    for (const name of ['/projects/i', '/news/i', '/careers/i', '/inquiries/i']) {
        s = mustReplace(s, new RegExp(`^\\s+await expect\\(sidebar\\.getByRole\\('link', \\{ name: ${name.replace('/', '\\/')}.*\\n`, 'm'), '');
    }
    for (const name of ['Contact Submissions', 'Contact Page']) {
        s = mustReplace(s, new RegExp(`^\\s+await expect\\(sidebar\\.getByRole\\('link', \\{ name: '${name}' \\}\\)\\)\\.toBeVisible.*\\n`, 'm'), '');
    }
    return s;
});
patch('e2e/specs/01-auth.spec.ts', (s) =>
    mustReplace(s, /\n    await page\.goto\('http:\/\/localhost:3002\/projects'\);\n    await expect\(page\)\.toHaveURL\(\/\\\/sign-in\/, \{ timeout: 8000 \}\);\n/, '\n'),
);
patch('e2e/specs/11-permissions.spec.ts', (s) => {
    s = mustReplace(s, /^\s+await expect\(sidebar\.getByRole\('link', \{ name: \/inquiries\/i \}\)\)\.toHaveCount\(0\);\n/m, '');
    s = mustReplace(s, /^\s+await expect\(sidebar\.getByRole\('link', \{ name: 'Contact Submissions' \}\)\)\.toHaveCount\(0\);\n/m, '');
    for (const route of ['/inquiries', '/contact-submissions', '/home', '/about-page', '/contact-page']) {
        s = mustReplace(s, new RegExp(`^\\s+'${route}',\\n`, 'm'), '');
    }
    return s;
});

// Files replaced wholesale by small generic versions (their originals were built on the removed domain)
function* walk(dir) {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) yield* walk(full);
        else yield full;
    }
}
for (const file of walk(TEMPLATES)) {
    const target = relative(TEMPLATES, file);
    log(`replace  ${target}`);
    if (APPLY) {
        mkdirSync(dirname(abs(target)), { recursive: true });
        copyFileSync(file, abs(target));
    }
}

if (failed) {
    console.error('\nStopped with errors. Nothing was written; the repo no longer matches what this script expects, so update the script.');
    process.exit(1);
}
console.log(APPLY ? '\nDone. Next steps are in docs/STARTER_CORE.md.' : '\nDry run complete. Re-run with --apply to make the changes.');
