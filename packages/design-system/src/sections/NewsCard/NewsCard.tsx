import { HeadingTag, type HeadingLevel } from '../../lib/heading-tag';
import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import { Icon } from '../../icons';
import { CategoryBadge } from '../../primitives/CategoryBadge';
import type { ArticleSummary } from '../../types';

type Locale = 'ar' | 'en';

export interface NewsCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Heading level of the card title (default 3), so the card fits the page's heading outline. */
  headingLevel?: HeadingLevel;
  article: ArticleSummary;
  /** Label of the read-more link, for example "Read more". */
  readMoreLabel: string;
  locale?: Locale;
  /** Category badge tone: `gold` on news cards, `gradient` on related-article cards. */
  badgeTone?: 'gold' | 'gradient';
}

/**
 * News card (Figma 423:1145): 250 px photo with 12 px radius, category tag, H6 title, date, read-more link. The whole card is one
 * link target through the title.
 *
 * @figma 423:1145
 */
export const NewsCard = React.forwardRef<HTMLElement, NewsCardProps>(({ article, readMoreLabel, locale = 'ar', badgeTone = 'gold', headingLevel = 3, className, ...props }, ref) => (
  <article ref={ref} className={cn('group relative flex flex-col gap-3.5 has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-solid has-[a:focus-visible]:outline-ring-focus', className)} {...props}>
    {article.image ? (
      <img
        src={article.image.src}
        alt={article.image.decorative ? '' : article.image.alt}
        width={article.image.width}
        height={article.image.height}
        className="h-62.5 w-full rounded-image object-cover"
      />
    ) : (
      <div aria-hidden="true" className="h-62.5 w-full rounded-image bg-pine-200" />
    )}
    <div className="flex flex-col items-start gap-3">
      <CategoryBadge tone={badgeTone}>{article.category}</CategoryBadge>
      <HeadingTag level={headingLevel} className="text-h6 font-bold text-text-heading">
        <a href={article.href} className="after:absolute after:inset-0">
          {article.title}
        </a>
      </HeadingTag>
      <time dateTime={article.date} className="text-body-xs text-text-muted">
        {formatDate(article.date, locale, { day: 'numeric', month: 'long', year: 'numeric' })}
      </time>
      <span aria-hidden="true" className="flex items-center gap-1.5 text-body-sm font-bold text-text-link group-hover:underline">
        <Icon name="chevron" size={14} reverse />
        {readMoreLabel}
      </span>
    </div>
  </article>
));
NewsCard.displayName = 'NewsCard';

export interface NewsGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  articles: ArticleSummary[];
  readMoreLabel: string;
  locale?: Locale;
  /** Optional filter bar (for example a FilterChipGroup) rendered above the grid. */
  filters?: React.ReactNode;
  /** Optional pagination rendered below the grid. */
  pagination?: React.ReactNode;
  /** Heading level of the card titles (default 3). */
  headingLevel?: HeadingLevel;
}

/** Grid of news cards, four across on large screens, with optional filter and pagination slots. */
export const NewsGrid = React.forwardRef<HTMLDivElement, NewsGridProps>(({ articles, readMoreLabel, locale = 'ar', filters, pagination, headingLevel = 3, className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-10', className)} {...props}>
    {filters}
    <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {articles.map((article) => (
        <li key={article.id}>
          <NewsCard article={article} readMoreLabel={readMoreLabel} locale={locale} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
    {pagination}
  </div>
));
NewsGrid.displayName = 'NewsGrid';
