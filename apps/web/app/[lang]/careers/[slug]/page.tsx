import { notFound } from 'next/navigation';
import { endpoint, type JobModelWeb } from '@repo/shared';
import { JobApplyForm } from '@/src/components/careers/JobApplyForm';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    full_time: 'Full time',
    part_time: 'Part time',
    contract: 'Contract',
    internship: 'Internship',
};

export default async function JobPage({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}) {
    const { lang, slug } = await params;

    const res = await fetch(`${BASE_URL}${endpoint.job.getBySlugWeb}/${encodeURIComponent(slug)}`, {
        headers: { 'Accept-Language': lang },
        next: { revalidate: 60 },
    });

    if (!res.ok) notFound();
    const job = (await res.json()) as JobModelWeb;

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="page-title">{job.title || job.slug}</h1>
                <span className="rounded-full border border-line px-3 py-1 text-xs">
                    {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
                </span>
            </div>
            {job.location && <p className="mt-2 text-sm text-muted">{job.location}</p>}
            {job.summary && <p className="mt-4 text-muted">{job.summary}</p>}

            {/* job.body is sanitized server-side on every create/update, same as News. */}
            {job.body && (
                <div
                    className="rich-text mt-6"
                    dangerouslySetInnerHTML={{ __html: job.body }}
                />
            )}

            <section className="mt-12 border-t border-line pt-8">
                <JobApplyForm jobId={job.id} />
            </section>
        </div>
    );
}
