'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import { IconButton } from '../../primitives/IconButton';
import type { ArticleSummary } from '../../types';
import { NewsCard } from '../NewsCard';
import { SectionHeading } from '../SectionHeading';

export interface RelatedCarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: string;
  title: string;
  articles: ArticleSummary[];
  readMoreLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** Accessible name of the progress bar, for example "Related articles". */
  progressLabel: string;
  locale?: 'ar' | 'en';
}

/**
 * Related articles slider (Figma 506:4135): CSS scroll-snap track of 267 px cards (gradient category tag), 48 px previous/next buttons that
 * disable at the ends, a counter and a 2 px progress line. Scrolling respects prefers-reduced-motion and the reading direction.
 *
 * @figma 506:4135, 529:4427, 530:4363
 */
export function RelatedCarousel({ eyebrow, title, articles, readMoreLabel, prevLabel, nextLabel, progressLabel, locale = 'ar', className, ...props }: RelatedCarouselProps) {
  const track = React.useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [state, setState] = React.useState({ index: 0, atStart: true, atEnd: articles.length <= 1 });

  const measure = React.useCallback(() => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 0) + 24 || el.clientWidth || 1;
    const pos = Math.abs(el.scrollLeft);
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setState({ index: Math.min(articles.length - 1, Math.round(pos / step)), atStart: pos <= 1, atEnd: max === 0 ? articles.length <= 1 : pos >= max - 1 });
  }, [articles.length]);

  React.useEffect(() => {
    measure();
  }, [measure]);

  const move = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 0) + 24 || el.clientWidth || 1;
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollBy?.({ left: direction * step * (rtl ? -1 : 1), behavior: reduced ? 'auto' : 'smooth' });
  };

  const total = articles.length;
  const current = state.index + 1;
  return (
    <section className={cn('flex flex-col gap-10', className)} {...props}>
      <SectionHeading eyebrow={eyebrow} title={title} />
      <ul ref={track} onScroll={measure} className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {articles.map((article) => (
          <li key={article.id} className="w-66.75 shrink-0 snap-start">
            <NewsCard article={article} readMoreLabel={readMoreLabel} locale={locale} badgeTone="gradient" />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-6">
        <div className="flex gap-3">
          <IconButton label={nextLabel} icon="chevron" variant="solid" disabled={state.atEnd} onClick={() => move(1)} />
          <IconButton label={prevLabel} icon="chevron" reverseIcon disabled={state.atStart} onClick={() => move(-1)} />
        </div>
        <div className="flex items-center gap-4">
          <div role="progressbar" aria-label={progressLabel} aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} className="h-0.5 w-62 rounded-full bg-border-subtle">
            <div className="h-full rounded-full bg-text-heading" style={{ width: `${(current / Math.max(total, 1)) * 100}%` }} />
          </div>
          <p className="text-body-sm text-text-heading">
            <bdi dir="ltr">
              {current}/{total}
            </bdi>
          </p>
        </div>
      </div>
    </section>
  );
}
