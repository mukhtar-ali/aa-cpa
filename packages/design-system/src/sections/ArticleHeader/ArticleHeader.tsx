import * as React from 'react';
import { cn } from '../../lib/cn';
import { warnMissingBreadcrumbLabel } from '../../lib/dev-warn';
import { Avatar } from '../../primitives/Avatar';
import { Breadcrumbs } from '../../primitives/Breadcrumbs';
import { Chip } from '../../primitives/Chip';
import { Heading } from '../../primitives/Heading';
import type { Author, ImageRef, LinkRef } from '../../types';

export interface ArticleHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  breadcrumbs?: LinkRef[];
  breadcrumbsLabel?: string;
  category: string;
  title: string;
  author: Pick<Author, 'name' | 'avatar'>;
  /** Preformatted line under the author name, for example "12 October 2026 · 6 min read". */
  meta: string;
  /** Machine-readable publication date for the `<time>` element. */
  dateISO?: string;
  /** Share controls (for example a row of icon buttons), shown at the end of the author row. */
  share?: React.ReactNode;
  cover?: ImageRef;
}

/**
 * Article header (Figma 506:2706): breadcrumbs, category chip, H1 title (max two lines at the H1 size), author row with a 52 px avatar,
 * name and date line, share controls at the end, then the 1140 x 480 cover image.
 *
 * @figma 506:2785, 506:3929, 506:3931, 506:3932, 506:3933, 506:3934, 506:3952
 */
export const ArticleHeader = React.forwardRef<HTMLElement, ArticleHeaderProps>(
  ({ breadcrumbs, breadcrumbsLabel, category, title, author, meta, dateISO, share, cover, className, ...props }, ref) => (
    <header ref={ref} className={cn('flex flex-col gap-6', className)} {...props}>
      {warnMissingBreadcrumbLabel(breadcrumbs, breadcrumbsLabel, 'ArticleHeader')}
      {breadcrumbs && breadcrumbs.length > 0 && breadcrumbsLabel ? <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} /> : null}
      <Chip className="self-start">{category}</Chip>
      <Heading level={1} className="max-w-225">
        {title}
      </Heading>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar name={author.name} image={author.avatar} className="size-13" />
          <div className="flex flex-col">
            <p className="text-body-md font-bold text-text-heading">{author.name}</p>
            {dateISO ? (
              <time dateTime={dateISO} className="text-body-sm text-text-muted">
                {meta}
              </time>
            ) : (
              <p className="text-body-sm text-text-muted">{meta}</p>
            )}
          </div>
        </div>
        {share}
      </div>
      {cover ? <img src={cover.src} alt={cover.decorative ? '' : cover.alt} width={cover.width} height={cover.height} className="aspect-[1140/480] w-full rounded-card object-cover" /> : null}
    </header>
  ),
);
ArticleHeader.displayName = 'ArticleHeader';
