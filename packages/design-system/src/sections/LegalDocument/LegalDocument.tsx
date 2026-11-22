import * as React from 'react';
import { cn } from '../../lib/cn';
import { safeHref } from '../../lib/safe-href';
import { formatDate, formatNumber } from '../../lib/format';
import { Icon } from '../../icons';
import type { LegalDocument as LegalDocumentData } from '../../types';
import { TableOfContents } from '../TableOfContents';

export interface LegalDocumentLabels {
  /** Table of contents card: title and landmark name. */
  tocTitle: string;
  tocLabel: string;
  /** Text before the date in the updated pill, for example "Last updated". */
  updated: string;
  /** Heading of the summary box, for example "Summary". */
  summary: string;
  /** Dark help card. */
  helpTitle: string;
  helpBody: string;
  download: string;
}

export interface LegalDocumentProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  document: LegalDocumentData;
  labels: LegalDocumentLabels;
  locale?: 'ar' | 'en';
}

/**
 * Legal document layout (Figma privacy page 525:3854): a sidebar with the table of contents and a dark "have a question" card with a
 * download button, and a white 30 px-radius document card with an updated pill, an ice summary box with dot bullets, and numbered sections.
 * `section.html` is rendered as-is: it must be sanitised before it reaches this component (the API stores sanitised HTML).
 *
 * @figma 525:3854, 525:4136
 */
export const LegalDocument = React.forwardRef<HTMLElement, LegalDocumentProps>(({ document: doc, labels, locale = 'ar', className, ...props }, ref) => {
  const date = formatDate(doc.updatedAt, locale, { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <section ref={ref} className={cn('grid gap-8 lg:grid-cols-[22.75rem_1fr] lg:items-start', className)} {...props}>
      <div className="flex flex-col gap-6 lg:sticky lg:top-8">
        <TableOfContents title={labels.tocTitle} label={labels.tocLabel} locale={locale} items={doc.sections.map((s, i) => ({ id: s.id, label: s.title, index: i + 1 }))} />
        <aside className="flex flex-col gap-3 rounded-cta bg-bg-inverse p-6 text-text-inverse">
          <h2 className="text-h6 font-bold">{labels.helpTitle}</h2>
          <p className="text-body-sm text-text-inverse-muted">{labels.helpBody}</p>
          {safeHref(doc.downloadHref) ? (
            <a href={safeHref(doc.downloadHref)} className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-full border border-solid border-border-inverse-strong px-4 text-body-sm font-bold hover:bg-bg-inverse-raised">
              <Icon name="file" size={16} />
              {labels.download}
            </a>
          ) : null}
        </aside>
      </div>
      <article className="flex flex-col gap-8 rounded-section border border-solid border-border-subtle bg-bg-surface p-8 sm:p-14">
        <p className="inline-flex h-10 items-center self-start rounded-full bg-emerald-50 px-5 text-body-sm text-text-body">
          {labels.updated}: <time dateTime={doc.updatedAt} className="ms-1 font-bold">{date}</time>
        </p>
        {doc.summary.length > 0 ? (
          <div className="flex flex-col gap-4 rounded-card bg-bg-surface-ice p-6">
            <h2 className="text-h6 font-bold text-text-heading">{labels.summary}</h2>
            <ul className="flex flex-col gap-2.5">
              {doc.summary.map((item) => (
                <li key={item} className="relative ps-6 text-body-md text-text-body before:absolute before:start-0 before:top-2.5 before:size-2 before:rounded-full before:bg-emerald-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {doc.sections.map((section, index) => (
          <section key={section.id} aria-labelledby={`${section.id}-title`} className="flex flex-col gap-4">
            <h2 id={section.id} className="text-h3 font-bold text-text-heading">
              <span id={`${section.id}-title`}>
                {formatNumber(index + 1, locale)}. {section.title}
              </span>
            </h2>
            <div className="ds-prose" dangerouslySetInnerHTML={{ __html: section.html }} />
          </section>
        ))}
      </article>
    </section>
  );
});
LegalDocument.displayName = 'LegalDocument';
