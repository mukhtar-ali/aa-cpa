import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import { Icon } from '../../icons';
import { CategoryBadge } from '../../primitives/CategoryBadge';
import type { ArticleSummary } from '../../types';
import { ArticleCardCompact } from '../ArticleCardCompact';

export interface FeaturedNewsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  featured: ArticleSummary;
  /** Latest articles listed in the dark panel. */
  latest: ArticleSummary[];
  latestTitle: string;
  readMoreLabel: string;
  locale?: 'ar' | 'en';
}

/**
 * Blog opener: one featured article (large photo, category, H3-sized title, excerpt, date, read-more) next to a dark panel listing the latest
 * articles as compact rows. The blog frame (473:36031) does not expose its children, so proportions are inferred from the compact card
 * (501:1155) and the news card (423:1145): to verify.
 *
 * @figma 473:36031 (unverified), 501:1155
 */
export const FeaturedNews = React.forwardRef<HTMLElement, FeaturedNewsProps>(({ featured, latest, latestTitle, readMoreLabel, locale = 'ar', className, ...props }, ref) => (
  <section ref={ref} className={cn('grid gap-8 lg:grid-cols-[1fr_20.375rem]', className)} {...props}>
    <article className="group relative flex flex-col gap-5">
      <img src={featured.image.src} alt={featured.image.decorative ? '' : featured.image.alt} width={featured.image.width} height={featured.image.height} className="aspect-[16/9] w-full rounded-card object-cover" />
      <div className="flex flex-col items-start gap-3">
        <CategoryBadge>{featured.category}</CategoryBadge>
        <h2 className="text-h3 font-bold text-text-heading">
          <a href={featured.href} className="after:absolute after:inset-0">
            {featured.title}
          </a>
        </h2>
        {featured.excerpt ? <p className="text-body-lg text-text-body">{featured.excerpt}</p> : null}
        <time dateTime={featured.date} className="text-body-sm text-text-muted">
          {formatDate(featured.date, locale, { day: 'numeric', month: 'long', year: 'numeric' })}
        </time>
        <span aria-hidden="true" className="flex items-center gap-1.5 text-body-sm font-bold text-text-link group-hover:underline">
          {readMoreLabel}
          <Icon name="chevron" size={14} />
        </span>
      </div>
    </article>
    <aside className="flex flex-col gap-5 rounded-cta bg-bg-inverse p-6 text-text-inverse">
      <h2 className="text-h6 font-bold">{latestTitle}</h2>
      <div className="flex flex-col gap-5">
        {latest.map((article, index) => (
          <ArticleCardCompact key={article.id} article={article} divider={index < latest.length - 1} locale={locale} />
        ))}
      </div>
    </aside>
  </section>
));
FeaturedNews.displayName = 'FeaturedNews';
