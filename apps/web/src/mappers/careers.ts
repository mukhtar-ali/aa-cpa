import type { JobSummary, Perk, ProcessStep, Stat } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { toPageHero, type HeroApi } from './hero';
import { localizeHref } from './href';
import { toImageRef, type ImageLike } from './image';

export interface JobApi {
    id: string;
    slug: string;
    title: string;
    department: string;
    city: string;
    contract: string;
    experience: string;
    summary?: string;
    closesAt?: string;
    postedAt?: string;
    href?: string;
}

export interface CareersPageApi {
    hero: HeroApi;
    perks: { eyebrow: string; title: string; items: Perk[] };
    team?: { eyebrow: string; title: string; accent?: string; body: string; image?: ImageLike; stats?: Stat[] };
    jobsEyebrow: string;
    jobsTitle: string;
    departments?: { id: string; slug: string; name: string }[];
    items?: JobApi[];
    hiringSteps?: { eyebrow: string; title: string; steps: { title: string; body: string }[] };
    seo?: unknown;
}

export interface JobDetailApi extends JobApi {
    body: string;
    responsibilities: string[];
    requirements: string[];
    benefits?: { title: string; body: string }[];
    similarJobs?: JobApi[];
    isOpen: boolean;
    isFallback?: boolean;
    redirectTo?: string;
    seo?: unknown;
}

export const jobPath = (slug: string) => `/careers/${slug}`;

export function toJobSummary(j: JobApi, lang: Lang): JobSummary {
    return { id: j.id, title: j.title, department: j.department, city: j.city, contract: j.contract, experience: j.experience, postedAt: j.postedAt, closesAt: j.closesAt, href: localizeHref(lang, j.href ?? jobPath(j.slug)) };
}

export function careersHref(lang: Lang, department?: string) {
    return `/${lang}/careers${department ? `?department=${encodeURIComponent(department)}` : ''}`;
}

export function toCareersProps(api: CareersPageApi, lang: Lang, department?: string) {
    const steps: ProcessStep[] = (api.hiringSteps?.steps ?? []).map((s, i) => ({ index: i + 1, title: s.title, body: s.body }));
    return {
        hero: toPageHero(api.hero, lang),
        perks: api.perks,
        team: api.team && { ...api.team, image: toImageRef(api.team.image, { decorative: true }) },
        jobs: { eyebrow: api.jobsEyebrow, title: api.jobsTitle, items: (api.items ?? []).map((j) => toJobSummary(j, lang)) },
        departments: (api.departments ?? []).map((d) => ({ label: d.name, href: careersHref(lang, d.slug), active: d.slug === department })),
        allHref: careersHref(lang),
        hiring: api.hiringSteps && { eyebrow: api.hiringSteps.eyebrow, title: api.hiringSteps.title, steps },
    };
}

export function toJobDetailProps(api: JobDetailApi, lang: Lang) {
    return {
        summary: toJobSummary(api, lang),
        title: api.title,
        lead: api.summary,
        bodyHtml: api.body,
        responsibilities: api.responsibilities,
        requirements: api.requirements,
        benefits: api.benefits ?? [],
        similar: (api.similarJobs ?? []).map((j) => toJobSummary(j, lang)),
        isOpen: api.isOpen !== false,
        facts: [
            ['department', api.department],
            ['city', api.city],
            ['contract', api.contract],
            ['experience', api.experience],
            ...(api.closesAt ? [['closes', api.closesAt] as const] : []),
        ] as ReadonlyArray<readonly [string, string]>,
    };
}
