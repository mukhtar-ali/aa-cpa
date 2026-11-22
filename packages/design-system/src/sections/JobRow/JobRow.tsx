import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import { Icon } from '../../icons';
import type { JobSummary } from '../../types';

export interface JobRowProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  job: JobSummary;
  /** Label of the decorative button, for example "View details". */
  detailsLabel: string;
}

/**
 * Job listing row (Figma 512:1145 default, 512:1152 hover): white 24 px card with the title at the H5 size, a muted meta line
 * (department · city · contract) and a pill that turns inverse on hover; on hover the card gets the ice fill and a 1.5 px emerald border.
 * The whole row is one link; the pill is decorative.
 *
 * @figma 512:1159
 */
export const JobRow = React.forwardRef<HTMLElement, JobRowProps>(({ job, detailsLabel, className, ...props }, ref) => (
  <article ref={ref} className={cn('group relative', className)} {...props}>
    <a
      href={job.href}
      className={cn(
        'flex min-h-28 items-center justify-between gap-6 rounded-cta border border-solid border-border-subtle bg-bg-surface px-8 py-6 outline-none',
        'transition-colors duration-(--motion-duration-fast) ease-standard',
        'hover:border-(length:--border-width-focus) hover:border-emerald-500 hover:bg-bg-surface-ice focus-visible:ring-3 focus-visible:ring-ring-focus',
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-h5 font-bold text-text-heading">{job.title}</h3>
        <span className="text-body-sm text-text-muted">{[job.department, job.city, job.contract].filter(Boolean).join('  ·  ')}</span>
      </div>
      <span
        aria-hidden="true"
        className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-cta border border-solid border-border-subtle ps-6 pe-5 text-body-sm font-bold text-text-heading transition-colors duration-(--motion-duration-fast) group-hover:border-bg-inverse group-hover:bg-bg-inverse group-hover:text-text-inverse"
      >
        {detailsLabel}
        <Icon name="chevron" size={16} />
      </span>
    </a>
  </article>
));
JobRow.displayName = 'JobRow';

export interface JobSummaryLabels {
  department: string;
  city: string;
  contract: string;
  experience: string;
  postedAt: string;
  closesAt: string;
}

export interface JobSummaryCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  job: JobSummary;
  labels: JobSummaryLabels;
  locale?: 'ar' | 'en';
}

/** Job facts as a description list (department, city, contract, experience, dates). Fields without a value are skipped. */
export const JobSummaryCard = React.forwardRef<HTMLElement, JobSummaryCardProps>(({ job, labels, locale = 'ar', className, ...props }, ref) => {
  const fmt = (iso: string) => formatDate(iso, locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const rows: Array<[string, React.ReactNode]> = [
    ...(job.department ? ([[labels.department, job.department]] as Array<[string, React.ReactNode]>) : []),
    ...(job.city ? ([[labels.city, job.city]] as Array<[string, React.ReactNode]>) : []),
    ...(job.contract ? ([[labels.contract, job.contract]] as Array<[string, React.ReactNode]>) : []),
    ...(job.experience ? ([[labels.experience, job.experience]] as Array<[string, React.ReactNode]>) : []),
    ...(job.postedAt ? ([[labels.postedAt, <time key="p" dateTime={job.postedAt}>{fmt(job.postedAt)}</time>]] as Array<[string, React.ReactNode]>) : []),
    ...(job.closesAt ? ([[labels.closesAt, <time key="c" dateTime={job.closesAt}>{fmt(job.closesAt)}</time>]] as Array<[string, React.ReactNode]>) : []),
  ];
  return (
    <aside ref={ref} className={cn('rounded-cta border border-solid border-border-subtle bg-bg-surface p-6', className)} {...props}>
      <h2 className="mb-4 text-h6 font-bold text-text-heading">{job.title}</h2>
      <dl className="flex flex-col">
        {rows.map(([term, value]) => (
          <div key={term} className="flex items-baseline justify-between gap-4 border-b border-solid border-border-subtle py-3 last:border-b-0">
            <dt className="text-body-sm text-text-muted">{term}</dt>
            <dd className="text-body-sm font-bold text-text-heading">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
});
JobSummaryCard.displayName = 'JobSummaryCard';
