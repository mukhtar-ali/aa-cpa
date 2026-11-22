import { HeadingTag, type HeadingLevel } from '../../lib/heading-tag';
import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import type { ArticleSummary } from '../../types';

export interface ArticleCardCompactProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Heading level of the card title (default 3), so the card fits the page's heading outline. */
  headingLevel?: HeadingLevel;
  article: ArticleSummary;
  /** Bottom divider (all but the last card in a list). */
  divider?: boolean;
  locale?: 'ar' | 'en';
}

/**
 * Compact article row for dark panels (Figma 501:1145): 16 px Body/Medium Bold title, 11 px date, 72 x 75 thumbnail with 14 px radius, 20 px
 * bottom padding and an optional inverse divider.
 *
 * @figma 501:1155, 501:1145
 */
export const ArticleCardCompact = React.forwardRef<HTMLElement, ArticleCardCompactProps>(({ article, divider = true, locale = 'ar', headingLevel = 3, className, ...props }, ref) => (
  <article ref={ref} className={cn('relative flex items-start gap-4 pb-5 has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-solid has-[a:focus-visible]:outline-ring-focus', divider && 'border-b border-solid border-border-inverse', className)} {...props}>
    <img src={article.image.src} alt={article.image.decorative ? '' : article.image.alt} width={article.image.width} height={article.image.height} className="h-18.75 w-18 shrink-0 rounded-thumb-lg object-cover" />
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
      <HeadingTag level={headingLevel} className="text-body-md font-bold text-text-inverse">
        <a href={article.href} className="after:absolute after:inset-0">
          {article.title}
        </a>
      </HeadingTag>
      <time dateTime={article.date} className="text-body-xs text-text-inverse-muted">
        {formatDate(article.date, locale, { day: 'numeric', month: 'long', year: 'numeric' })}
      </time>
    </div>
  </article>
));
ArticleCardCompact.displayName = 'ArticleCardCompact';
