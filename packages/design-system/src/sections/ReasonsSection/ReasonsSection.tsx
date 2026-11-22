import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import { Container } from '../../layout/Container';
import { Section } from '../../layout/Section';
import type { ActionRef, ImageRef, Pillar, Stat } from '../../types';
import { PillarCard } from '../PillarCard';
import { SectionHeading } from '../SectionHeading';
import { StatsStrip } from '../StatsStrip';

export interface ReasonsSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  description?: string;
  /** Up to three pillars: the first two as small cards, the third full width. */
  pillars: Pillar[];
  image: ImageRef;
  action?: ActionRef;
  stats: Stat[];
  locale?: 'ar' | 'en';
}

/**
 * "Why companies move to us" (Figma 411:3728): dark band with the heading and intro, two pillar cards and a wide one, a tall photo with
 * a paper button, and the proof-box statistics underneath. Composition of SectionHeading, PillarCard and StatsStrip; layout follows the Figma rows.
 *
 * @figma 411:3728
 */
export const ReasonsSection = React.forwardRef<HTMLElement, ReasonsSectionProps>(
  ({ title, description, pillars, image, action, stats, locale = 'ar', className, ...props }, ref) => {
    const [first, second, third] = pillars;
    return (
      <Section ref={ref} tone="inverse" rounded="both" spacing="lg" className={cn('text-text-inverse', className)} {...props}>
        <Container className="flex flex-col gap-12">
          {/* Figma 411:3728: heading and button share the top row; below it the cards (right) and the 461 px photo (inline end). */}
          <div className="grid gap-10 lg:grid-cols-[1fr_28.8125rem] lg:gap-x-6 lg:gap-y-8">
            <SectionHeading tone="dark" title={title} description={description} className="lg:max-w-none" />
            {action ? (
              <div className="flex lg:self-end">
                <Button href={action.href} variant="paper" className="shrink-0">
                  {action.label}
                </Button>
              </div>
            ) : (
              <div />
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:self-start">
              {first ? <PillarCard pillar={first} /> : null}
              {second ? <PillarCard pillar={second} /> : null}
              {third ? <PillarCard pillar={third} size="wide" className="sm:col-span-2" /> : null}
            </div>
            <img src={image.src} alt={image.decorative ? '' : image.alt} width={image.width} height={image.height} className="aspect-[461/542] w-full rounded-card object-cover lg:self-start" />
          </div>
          <StatsStrip stats={stats} locale={locale} />
        </Container>
      </Section>
    );
  },
);
ReasonsSection.displayName = 'ReasonsSection';
