import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import { CategoryBadge } from '../../primitives/CategoryBadge';
import type { CaseStory } from '../../types';
import { SectionHeading } from '../SectionHeading';

export interface CaseStoryCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  story: CaseStory;
}

/**
 * Case story card (Figma 547:4555 "Case · …", 267 px wide): 250 px photo with 12 px radius, sector tag, H6 title, optional service line and a
 * read-more link. The whole card links through the title.
 *
 * @figma 547:4555
 */
export const CaseStoryCard = React.forwardRef<HTMLElement, CaseStoryCardProps>(({ story, className, ...props }, ref) => (
  <article ref={ref} className={cn('group relative flex flex-col gap-3.5', className)} {...props}>
    <img src={story.image.src} alt={story.image.decorative ? '' : story.image.alt} width={story.image.width} height={story.image.height} className="h-62.5 w-full rounded-image object-cover" />
    <div className="flex flex-col items-start gap-3">
      <CategoryBadge tone="gradient">{story.sector}</CategoryBadge>
      <h3 className="text-h6 font-bold text-text-heading">
        <a href={story.href} className="after:absolute after:inset-0">
          {story.title}
        </a>
      </h3>
      {story.service ? <p className="text-body-xs text-text-muted">{story.service}</p> : null}
      <span aria-hidden="true" className="flex items-center gap-1.5 text-body-sm font-bold text-text-link group-hover:underline">
        <Icon name="chevron" size={14} reverse />
        {story.ctaLabel}
      </span>
    </div>
  </article>
));
CaseStoryCard.displayName = 'CaseStoryCard';

export interface CaseStoriesProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: string;
  title: string;
  stories: CaseStory[];
}

/** "Stories from the sectors" band on the ice tone: heading and a four-across grid of case story cards. */
export const CaseStories = React.forwardRef<HTMLElement, CaseStoriesProps>(({ eyebrow, title, stories, className, ...props }, ref) => (
  <section ref={ref} className={cn('flex flex-col gap-12 bg-bg-surface-ice py-section-lg', className)} {...props}>
    <SectionHeading eyebrow={eyebrow} title={title} />
    <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {stories.map((story) => (
        <li key={story.href + story.title}>
          <CaseStoryCard story={story} />
        </li>
      ))}
    </ul>
  </section>
));
CaseStories.displayName = 'CaseStories';
