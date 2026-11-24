export interface AuditIssue {
    entityType: string;
    entityId: string;
    field?: string;
    issue: string;
}

export interface EntityAuditSummary {
    entityType: string;
    total: number;
    approved: number;
    issuesCount: number;
}

export interface AuditReport {
    summaries: EntityAuditSummary[];
    issues: AuditIssue[];
    totalEntities: number;
    totalApproved: number;
    totalIssues: number;
    isClean: boolean;
}

export const PLACEHOLDER_PATTERNS: { name: string; regex: RegExp }[] = [
    { name: '[PLACEHOLDER]', regex: /\[placeholder\]/i },
    { name: 'lorem ipsum', regex: /lorem\s+ipsum/i },
    { name: 'شعار الجهة', regex: /شعار\s+الجهة/ },
    { name: 'TODO', regex: /\bTODO\b/i },
    { name: 'TBD', regex: /\bTBD\b/i },
];

/**
 * Searches a string for any known placeholder markers.
 */
export function findPlaceholders(text: unknown): string[] {
    if (typeof text !== 'string' || !text) return [];
    const matched: string[] = [];
    for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.regex.test(text)) {
            matched.push(pattern.name);
        }
    }
    return matched;
}

/**
 * Validates a bilingual field for completeness and placeholders.
 */
export function checkBilingualField(
    field: unknown,
    fieldName: string,
    entityType: string,
    entityId: string,
    options: { requiredAr?: boolean; requiredEn?: boolean } = { requiredAr: true, requiredEn: true }
): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const requiredAr = options.requiredAr !== false;
    const requiredEn = options.requiredEn !== false;

    if (!field || typeof field !== 'object') {
        if (requiredAr) {
            issues.push({
                entityType,
                entityId,
                field: `${fieldName}.ar`,
                issue: `Missing Arabic text for "${fieldName}"`,
            });
        }
        if (requiredEn) {
            issues.push({
                entityType,
                entityId,
                field: `${fieldName}.en`,
                issue: `Missing English text for "${fieldName}"`,
            });
        }
        return issues;
    }

    const obj = field as Record<string, unknown>;
    const arVal = typeof obj.ar === 'string' ? obj.ar.trim() : '';
    const enVal = typeof obj.en === 'string' ? obj.en.trim() : '';

    if (requiredAr && !arVal) {
        issues.push({
            entityType,
            entityId,
            field: `${fieldName}.ar`,
            issue: `Missing Arabic text for "${fieldName}"`,
        });
    }

    if (requiredEn && !enVal) {
        issues.push({
            entityType,
            entityId,
            field: `${fieldName}.en`,
            issue: `Missing English text for "${fieldName}"`,
        });
    }

    if (arVal) {
        const phs = findPlaceholders(arVal);
        for (const ph of phs) {
            issues.push({
                entityType,
                entityId,
                field: `${fieldName}.ar`,
                issue: `Placeholder marker "${ph}" found in Arabic text of "${fieldName}"`,
            });
        }
    }

    if (enVal) {
        const phs = findPlaceholders(enVal);
        for (const ph of phs) {
            issues.push({
                entityType,
                entityId,
                field: `${fieldName}.en`,
                issue: `Placeholder marker "${ph}" found in English text of "${fieldName}"`,
            });
        }
    }

    return issues;
}

/**
 * Validates an image field (alt text in both languages, license note, placeholders).
 */
export function checkImageField(
    image: unknown,
    fieldName: string,
    entityType: string,
    entityId: string
): AuditIssue[] {
    const issues: AuditIssue[] = [];
    if (!image || typeof image !== 'object') {
        return issues;
    }

    const img = image as Record<string, unknown>;
    const url = typeof img.url === 'string' ? img.url : typeof img.src === 'string' ? img.src : '';

    // If an image object is present with a URL
    if (url && url.trim()) {
        const alt = img.alt;
        if (!alt) {
            issues.push({
                entityType,
                entityId,
                field: `${fieldName}.alt`,
                issue: `Image "${fieldName}" is missing alt text`,
            });
        } else if (typeof alt === 'object') {
            const altObj = alt as Record<string, unknown>;
            const arAlt = typeof altObj.ar === 'string' ? altObj.ar.trim() : '';
            const enAlt = typeof altObj.en === 'string' ? altObj.en.trim() : '';

            if (!arAlt) {
                issues.push({
                    entityType,
                    entityId,
                    field: `${fieldName}.alt.ar`,
                    issue: `Image "${fieldName}" is missing Arabic alt text`,
                });
            } else {
                for (const ph of findPlaceholders(arAlt)) {
                    issues.push({
                        entityType,
                        entityId,
                        field: `${fieldName}.alt.ar`,
                        issue: `Placeholder marker "${ph}" found in Arabic alt text of image "${fieldName}"`,
                    });
                }
            }

            if (!enAlt) {
                issues.push({
                    entityType,
                    entityId,
                    field: `${fieldName}.alt.en`,
                    issue: `Image "${fieldName}" is missing English alt text`,
                });
            } else {
                for (const ph of findPlaceholders(enAlt)) {
                    issues.push({
                        entityType,
                        entityId,
                        field: `${fieldName}.alt.en`,
                        issue: `Placeholder marker "${ph}" found in English alt text of image "${fieldName}"`,
                    });
                }
            }
        } else if (typeof alt === 'string') {
            if (!alt.trim()) {
                issues.push({
                    entityType,
                    entityId,
                    field: `${fieldName}.alt`,
                    issue: `Image "${fieldName}" is missing alt text`,
                });
            } else {
                for (const ph of findPlaceholders(alt)) {
                    issues.push({
                        entityType,
                        entityId,
                        field: `${fieldName}.alt`,
                        issue: `Placeholder marker "${ph}" found in alt text of image "${fieldName}"`,
                    });
                }
            }
        }

        // License check (defensively reading license as unknown)
        const lic = img.license;
        let hasLicense = false;
        if (lic && typeof lic === 'object') {
            const licObj = lic as Record<string, unknown>;
            if (typeof licObj.source === 'string' && licObj.source.trim().length > 0) {
                hasLicense = true;
            }
        } else if (typeof lic === 'string' && lic.trim().length > 0) {
            hasLicense = true;
        }

        if (!hasLicense) {
            issues.push({
                entityType,
                entityId,
                field: `${fieldName}.license`,
                issue: `Image "${fieldName}" has no license note`,
            });
        }
    }

    return issues;
}

export function auditService(service: {
    id: string;
    slug: string;
    image?: unknown;
    heroImage?: unknown;
    methodology?: unknown;
    deliverables?: unknown;
    translations?: {
        ar?: Record<string, unknown>;
        en?: Record<string, unknown>;
    };
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = service.slug || service.id;
    const type = 'services';

    const arTrans = service.translations?.ar ?? {};
    const enTrans = service.translations?.en ?? {};

    const requiredFields = [
        'title',
        'summary',
        'heroSubtitle',
        'statement',
        'audience',
        'whyUs',
    ];

    for (const f of requiredFields) {
        issues.push(
            ...checkBilingualField(
                { ar: arTrans[f], en: enTrans[f] },
                f,
                type,
                id
            )
        );
    }

    // Methodology items
    if (Array.isArray(service.methodology)) {
        service.methodology.forEach((item, idx) => {
            if (item && typeof item === 'object') {
                issues.push(...checkBilingualField(item.title, `methodology[${idx}].title`, type, id));
                issues.push(...checkBilingualField(item.body, `methodology[${idx}].body`, type, id));
            }
        });
    }

    // Deliverables items
    if (Array.isArray(service.deliverables)) {
        service.deliverables.forEach((item, idx) => {
            if (item && typeof item === 'object') {
                issues.push(...checkBilingualField(item.title, `deliverables[${idx}].title`, type, id));
            }
        });
    }

    // Images
    if (service.image) {
        issues.push(...checkImageField(service.image, 'image', type, id));
    }
    if (service.heroImage) {
        issues.push(...checkImageField(service.heroImage, 'heroImage', type, id));
    }

    return issues;
}

export function auditSector(sector: {
    id: string;
    slug: string;
    bandImage?: unknown;
    translations?: {
        ar?: Record<string, unknown>;
        en?: Record<string, unknown>;
    };
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = sector.slug || sector.id;
    const type = 'sectors';

    const arTrans = sector.translations?.ar ?? {};
    const enTrans = sector.translations?.en ?? {};

    const requiredFields = ['title', 'summary', 'bandTitle', 'bandBody', 'bandCtaLabel'];

    for (const f of requiredFields) {
        issues.push(
            ...checkBilingualField(
                { ar: arTrans[f], en: enTrans[f] },
                f,
                type,
                id
            )
        );
    }

    if (sector.bandImage) {
        issues.push(...checkImageField(sector.bandImage, 'bandImage', type, id));
    }

    return issues;
}

export function auditArticle(article: {
    id: string;
    slug?: string | null;
    coverImage?: unknown;
    translations?: {
        ar?: Record<string, unknown>;
        en?: Record<string, unknown>;
    };
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = article.slug || article.id;
    const type = 'articles';

    const arTrans = article.translations?.ar ?? {};
    const enTrans = article.translations?.en ?? {};

    const requiredFields = ['title', 'excerpt', 'body'];

    for (const f of requiredFields) {
        issues.push(
            ...checkBilingualField(
                { ar: arTrans[f], en: enTrans[f] },
                f,
                type,
                id
            )
        );
    }

    if (article.coverImage) {
        issues.push(...checkImageField(article.coverImage, 'coverImage', type, id));
    }

    return issues;
}

export function auditJob(job: {
    id: string;
    slug?: string | null;
    responsibilities?: unknown;
    requirements?: unknown;
    benefits?: unknown;
    translations?: {
        ar?: Record<string, unknown>;
        en?: Record<string, unknown>;
    };
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = job.slug || job.id;
    const type = 'jobs';

    const arTrans = job.translations?.ar ?? {};
    const enTrans = job.translations?.en ?? {};

    issues.push(...checkBilingualField({ ar: arTrans.title, en: enTrans.title }, 'title', type, id));
    issues.push(...checkBilingualField({ ar: arTrans.summary, en: enTrans.summary }, 'summary', type, id));

    if (Array.isArray(job.responsibilities)) {
        job.responsibilities.forEach((resp, idx) => {
            issues.push(...checkBilingualField(resp, `responsibilities[${idx}]`, type, id));
        });
    }

    if (Array.isArray(job.requirements)) {
        job.requirements.forEach((req, idx) => {
            issues.push(...checkBilingualField(req, `requirements[${idx}]`, type, id));
        });
    }

    if (Array.isArray(job.benefits)) {
        job.benefits.forEach((ben, idx) => {
            if (ben && typeof ben === 'object') {
                issues.push(...checkBilingualField(ben.title, `benefits[${idx}].title`, type, id));
                issues.push(...checkBilingualField(ben.body, `benefits[${idx}].body`, type, id));
            }
        });
    }

    return issues;
}

export function auditAuthor(author: {
    id: string;
    name?: unknown;
    role?: unknown;
    bio?: unknown;
    avatar?: unknown;
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = author.id;
    const type = 'authors';

    issues.push(...checkBilingualField(author.name, 'name', type, id));
    issues.push(...checkBilingualField(author.role, 'role', type, id));
    issues.push(...checkBilingualField(author.bio, 'bio', type, id));

    if (author.avatar) {
        issues.push(...checkImageField(author.avatar, 'avatar', type, id));
    }

    return issues;
}

export function auditFaq(faq: {
    id: string;
    question?: unknown;
    answer?: unknown;
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = faq.id;
    const type = 'faqs';

    issues.push(...checkBilingualField(faq.question, 'question', type, id));
    issues.push(...checkBilingualField(faq.answer, 'answer', type, id));

    return issues;
}

export function auditTestimonial(testimonial: {
    id: string;
    quote?: unknown;
    name?: unknown;
    role?: unknown;
    company?: unknown;
    avatar?: unknown;
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = testimonial.id;
    const type = 'testimonials';

    issues.push(...checkBilingualField(testimonial.quote, 'quote', type, id));
    issues.push(...checkBilingualField(testimonial.name, 'name', type, id));
    issues.push(...checkBilingualField(testimonial.role, 'role', type, id));
    if (testimonial.company) {
        issues.push(...checkBilingualField(testimonial.company, 'company', type, id, { requiredAr: false, requiredEn: false }));
    }

    if (testimonial.avatar) {
        issues.push(...checkImageField(testimonial.avatar, 'avatar', type, id));
    }

    return issues;
}

export function auditClientLogo(logoItem: {
    id: string;
    name?: unknown;
    logo?: unknown;
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = typeof logoItem.name === 'string' ? logoItem.name : logoItem.id;
    const type = 'logos';

    if (typeof logoItem.name === 'string') {
        for (const ph of findPlaceholders(logoItem.name)) {
            issues.push({
                entityType: type,
                entityId: id,
                field: 'name',
                issue: `Placeholder marker "${ph}" found in logo name`,
            });
        }
    }

    if (logoItem.logo) {
        issues.push(...checkImageField(logoItem.logo, 'logo', type, id));
    } else {
        issues.push({
            entityType: type,
            entityId: id,
            field: 'logo',
            issue: 'Missing logo image',
        });
    }

    return issues;
}

export function auditCredential(cred: {
    id: string;
    name?: unknown;
    logo?: unknown;
}): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const id = cred.id;
    const type = 'credentials';

    issues.push(...checkBilingualField(cred.name, 'name', type, id));

    if (cred.logo) {
        issues.push(...checkImageField(cred.logo, 'logo', type, id));
    } else {
        issues.push({
            entityType: type,
            entityId: id,
            field: 'logo',
            issue: 'Missing credential logo image',
        });
    }

    return issues;
}

export function auditEstimator(data: unknown, sectionType = 'estimator'): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const type = 'estimator';
    const id = sectionType;

    if (!data || typeof data !== 'object') {
        issues.push({
            entityType: type,
            entityId: id,
            issue: 'Estimator configuration is missing or invalid',
        });
        return issues;
    }

    const cfg = data as Record<string, unknown>;

    // 1. Status draft check
    if (cfg.status !== 'approved' || cfg.isDraft === true) {
        issues.push({
            entityType: type,
            entityId: id,
            field: 'status',
            issue: `Estimator is still in draft (status: ${String(cfg.status ?? 'draft')})`,
        });
    }

    // 2. Disclaimer
    if (cfg.disclaimer) {
        issues.push(...checkBilingualField(cfg.disclaimer, 'disclaimer', type, id));
    }

    // 3. Questions
    if (Array.isArray(cfg.questions)) {
        cfg.questions.forEach((q, qIdx) => {
            if (q && typeof q === 'object') {
                const qObj = q as Record<string, unknown>;
                issues.push(...checkBilingualField(qObj.title, `questions[${qIdx}].title`, type, id));
                if (Array.isArray(qObj.options)) {
                    qObj.options.forEach((opt, oIdx) => {
                        if (opt && typeof opt === 'object') {
                            const optObj = opt as Record<string, unknown>;
                            issues.push(...checkBilingualField(optObj.label, `questions[${qIdx}].options[${oIdx}].label`, type, id));
                        }
                    });
                }
            }
        });
    }

    return issues;
}

/**
 * Traverses an arbitrary JSON object to audit all bilingual fields, images, and string placeholders.
 */
export function auditSection(sectionType: string, data: unknown): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const type = 'pages/sections';
    const id = sectionType;

    function walk(node: unknown, path: string) {
        if (!node) return;

        if (typeof node === 'string') {
            for (const ph of findPlaceholders(node)) {
                issues.push({
                    entityType: type,
                    entityId: id,
                    field: path,
                    issue: `Placeholder marker "${ph}" found in text at "${path}"`,
                });
            }
            return;
        }

        if (typeof node === 'object') {
            if (Array.isArray(node)) {
                node.forEach((item, idx) => walk(item, `${path}[${idx}]`));
                return;
            }

            const obj = node as Record<string, unknown>;

            // Check if this is an image object: has url or src, and alt/width/height
            const hasImageKey = typeof obj.url === 'string' || typeof obj.src === 'string';
            if (hasImageKey) {
                issues.push(...checkImageField(obj, path, type, id));
                return;
            }

            // Check if this is a bilingual text field: { ar: ..., en: ... } with no other complex fields
            if ('ar' in obj && 'en' in obj && typeof obj.ar === 'string' && typeof obj.en === 'string') {
                issues.push(...checkBilingualField(obj, path, type, id));
                return;
            }

            // Otherwise, recurse through properties
            for (const [key, val] of Object.entries(obj)) {
                const subPath = path ? `${path}.${key}` : key;
                walk(val, subPath);
            }
        }
    }

    walk(data, '');
    return issues;
}

export function compileAuditReport(entityResults: {
    entityType: string;
    items: { id: string; issues: AuditIssue[] }[];
}[]): AuditReport {
    const summaries: EntityAuditSummary[] = [];
    const allIssues: AuditIssue[] = [];

    let totalEntities = 0;
    let totalApproved = 0;

    for (const group of entityResults) {
        const total = group.items.length;
        let approved = 0;
        let issuesCount = 0;

        for (const item of group.items) {
            if (item.issues.length === 0) {
                approved++;
            } else {
                issuesCount += item.issues.length;
                allIssues.push(...item.issues);
            }
        }

        totalEntities += total;
        totalApproved += approved;

        summaries.push({
            entityType: group.entityType,
            total,
            approved,
            issuesCount,
        });
    }

    const totalIssues = allIssues.length;

    return {
        summaries,
        issues: allIssues,
        totalEntities,
        totalApproved,
        totalIssues,
        isClean: totalIssues === 0,
    };
}

export function buildMarkdownReport(report: AuditReport): string {
    const dateStr = new Date().toISOString();
    const statusText = report.isClean ? '✅ APPROVED' : '❌ FAILED (GATING)';

    const lines: string[] = [
        '# Content Audit Report',
        '',
        `**Generated at**: ${dateStr}`,
        `**Status**: ${statusText}`,
        `**Total Entities**: ${report.totalEntities} | **Approved**: ${report.totalApproved} | **Issues**: ${report.totalIssues}`,
        '',
        '## Summary',
        '',
        '| Entity | Total | Approved | Issues |',
        '| --- | --- | --- | --- |',
    ];

    for (const s of report.summaries) {
        lines.push(`| ${s.entityType} | ${s.total} | ${s.approved} | ${s.issuesCount} |`);
    }

    lines.push(`| **Total** | **${report.totalEntities}** | **${report.totalApproved}** | **${report.totalIssues}** |`);
    lines.push('');

    if (report.issues.length === 0) {
        lines.push('## Issues (0)');
        lines.push('');
        lines.push('🎉 All content is 100% complete, placeholder-free, and properly licensed!');
    } else {
        lines.push(`## Issues (${report.issues.length})`);
        lines.push('');
        for (const issue of report.issues) {
            const fieldPart = issue.field ? ` (${issue.field})` : '';
            lines.push(`- **[${issue.entityType}]** \`${issue.entityId}\`${fieldPart}: ${issue.issue}`);
        }
    }

    lines.push('');
    return lines.join('\n');
}
