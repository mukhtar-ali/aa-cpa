import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import type { ActionRef } from '../../types';

export interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small gradient line above the title. */
  eyebrow?: string;
  title: string;
  /** Second title line rendered in the accent gradient. */
  accent?: string;
  description?: string;
  action?: ActionRef;
  tone?: 'light' | 'dark';
  /** Title on one side, description and action on the other (from lg). */
  split?: boolean;
  /** Heading level of the title (default 2). */
  level?: 2 | 3;
}

/**
 * Section heading (Figma 530:4339): gradient eyebrow in Body/Large Bold, H2 title in the heading colour, 6 px apart. Optional accent
 * line, description, action and split layout.
 *
 * @figma 530:4339, 411:3827
 */
export const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ eyebrow, title, accent, description, action, tone = 'light', split = false, level = 2, className, ...props }, ref) => {
    const Title = `h${level}` as const;
    const dark = tone === 'dark';
    return (
      <div ref={ref} className={cn('flex flex-col gap-6', split && 'lg:flex-row lg:items-end lg:justify-between lg:gap-12', className)} {...props}>
        <div className="flex flex-col gap-1.5">
          {eyebrow ? <p className="bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-body-lg font-bold text-transparent">{eyebrow}</p> : null}
          <Title className={cn('text-h2 font-bold', dark ? 'text-text-inverse' : 'text-text-heading')}>
            {title}
            {accent ? <span className="block bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-transparent">{accent}</span> : null}
          </Title>
        </div>
        {description || action ? (
          <div className={cn('flex flex-col items-start gap-6', split && 'lg:max-w-140')}>
            {description ? <p className={cn('text-body-lg', dark ? 'text-text-inverse-muted' : 'text-text-body')}>{description}</p> : null}
            {action ? (
              <Button href={action.href} variant={action.variant ?? (dark ? 'paper' : 'primary')}>
                {action.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
SectionHeading.displayName = 'SectionHeading';
