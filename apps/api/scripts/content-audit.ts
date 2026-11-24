import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import {
    auditSection,
    auditService,
    auditSector,
    auditArticle,
    auditJob,
    auditAuthor,
    auditFaq,
    auditTestimonial,
    auditClientLogo,
    auditCredential,
    auditEstimator,
    compileAuditReport,
    buildMarkdownReport,
    AuditIssue,
} from './content-audit.lib';

const prisma = new PrismaClient();

function getArgValue(argName: string): string | null {
    const args = process.argv.slice(2);
    const idx = args.indexOf(argName);
    if (idx !== -1 && idx + 1 < args.length) {
        return args[idx + 1];
    }
    const prefix = `${argName}=`;
    const found = args.find((a) => a.startsWith(prefix));
    if (found) {
        return found.slice(prefix.length);
    }
    return null;
}

async function main() {
    const outFile = getArgValue('--out');

    try {
        await prisma.$connect();
    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ Database connection error while starting content audit:', errorMsg);
        process.exit(1);
    }

    try {
        // 1. Fetch all data
        const [
            sections,
            services,
            sectors,
            articles,
            jobs,
            authors,
            faqs,
            testimonials,
            clientLogos,
            credentials,
        ] = await Promise.all([
            prisma.section.findMany({ where: { isDeleted: false } }),
            prisma.service.findMany({ where: { isDeleted: false }, include: { translations: true } }),
            prisma.sector.findMany({ where: { isDeleted: false }, include: { translations: true } }),
            prisma.news.findMany({ where: { isDeleted: false }, include: { translations: true } }),
            prisma.job.findMany({ where: { isDeleted: false }, include: { translations: true } }),
            prisma.author.findMany({ where: { isDeleted: false } }),
            prisma.faqItem.findMany({ where: { isDeleted: false } }),
            prisma.testimonial.findMany({ where: { isDeleted: false } }),
            prisma.clientLogo.findMany({ where: { isDeleted: false } }),
            prisma.credential.findMany({ where: { isDeleted: false } }),
        ]);

        const sectionItems: { id: string; issues: AuditIssue[] }[] = [];
        const estimatorItems: { id: string; issues: AuditIssue[] }[] = [];

        for (const s of sections) {
            if (s.type === 'estimator-config' || s.type === 'estimator_config') {
                estimatorItems.push({
                    id: s.type,
                    issues: auditEstimator(s.data, s.type),
                });
            } else {
                sectionItems.push({
                    id: s.type,
                    issues: auditSection(s.type, s.data),
                });
            }
        }

        const serviceItems = services.map((s) => {
            const arTrans = s.translations.find((t) => t.language === 'ar');
            const enTrans = s.translations.find((t) => t.language === 'en');
            return {
                id: s.slug || s.id,
                issues: auditService({
                    id: s.id,
                    slug: s.slug,
                    image: s.image,
                    heroImage: s.heroImage,
                    methodology: s.methodology,
                    deliverables: s.deliverables,
                    translations: {
                        ar: arTrans as Record<string, unknown> | undefined,
                        en: enTrans as Record<string, unknown> | undefined,
                    },
                }),
            };
        });

        const sectorItems = sectors.map((sec) => {
            const arTrans = sec.translations.find((t) => t.language === 'ar');
            const enTrans = sec.translations.find((t) => t.language === 'en');
            return {
                id: sec.slug || sec.id,
                issues: auditSector({
                    id: sec.id,
                    slug: sec.slug,
                    bandImage: sec.bandImage,
                    translations: {
                        ar: arTrans as Record<string, unknown> | undefined,
                        en: enTrans as Record<string, unknown> | undefined,
                    },
                }),
            };
        });

        const articleItems = articles.map((art) => {
            const arTrans = art.translations.find((t) => t.language === 'ar');
            const enTrans = art.translations.find((t) => t.language === 'en');
            return {
                id: art.slug || art.id,
                issues: auditArticle({
                    id: art.id,
                    slug: art.slug,
                    coverImage: art.coverImage,
                    translations: {
                        ar: arTrans as Record<string, unknown> | undefined,
                        en: enTrans as Record<string, unknown> | undefined,
                    },
                }),
            };
        });

        const jobItems = jobs.map((j) => {
            const arTrans = j.translations.find((t) => t.language === 'ar');
            const enTrans = j.translations.find((t) => t.language === 'en');
            return {
                id: j.slug || j.id,
                issues: auditJob({
                    id: j.id,
                    slug: j.slug,
                    responsibilities: j.responsibilities,
                    requirements: j.requirements,
                    benefits: j.benefits,
                    translations: {
                        ar: arTrans as Record<string, unknown> | undefined,
                        en: enTrans as Record<string, unknown> | undefined,
                    },
                }),
            };
        });

        const authorItems = authors.map((a) => ({
            id: a.id,
            issues: auditAuthor(a),
        }));

        const faqItems = faqs.map((f) => ({
            id: f.id,
            issues: auditFaq(f),
        }));

        const testimonialItems = testimonials.map((t) => ({
            id: t.id,
            issues: auditTestimonial(t),
        }));

        const logoItems = clientLogos.map((l) => ({
            id: l.name || l.id,
            issues: auditClientLogo(l),
        }));

        const credentialItems = credentials.map((c) => ({
            id: c.id,
            issues: auditCredential(c),
        }));

        const report = compileAuditReport([
            { entityType: 'pages/sections', items: sectionItems },
            { entityType: 'services', items: serviceItems },
            { entityType: 'sectors', items: sectorItems },
            { entityType: 'articles', items: articleItems },
            { entityType: 'jobs', items: jobItems },
            { entityType: 'authors', items: authorItems },
            { entityType: 'faqs', items: faqItems },
            { entityType: 'testimonials', items: testimonialItems },
            { entityType: 'logos', items: logoItems },
            { entityType: 'credentials', items: credentialItems },
            { entityType: 'estimator', items: estimatorItems },
        ]);

        const markdown = buildMarkdownReport(report);

        // Output to stdout
        console.log(markdown);

        // Output to file if requested
        if (outFile) {
            const resolvedPath = path.isAbsolute(outFile) ? outFile : path.resolve(process.cwd(), outFile);
            const parentDir = path.dirname(resolvedPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(resolvedPath, markdown, 'utf8');
            console.log(`Report written to ${resolvedPath}`);
        }

        if (!report.isClean) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ Content audit encountered an error:', errorMsg);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

void main();
