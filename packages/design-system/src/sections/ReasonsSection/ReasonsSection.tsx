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
 * a paper button, and the proof-box statistics underneath. Composition of SectionHeading, PillarCard and StatsStrip; grid offsets are
 * approximate (to verify in the parity pass).
 *
 * @figma 411:3728
 */
export const ReasonsSection = React.forwardRef<HTMLElement, ReasonsSectionProps>(
  ({ title, description, pillars, image, action, stats, locale = 'ar', className, ...props }, ref) => {
    const [first, second, third] = pillars;
    return (
      <Section ref={ref} tone="inverse" rounded="both" spacing="lg" className={cn('text-text-inverse', className)} {...props}>
        <Container className="flex flex-col gap-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
            <div className="flex flex-col gap-6 lg:col-span-7 lg:col-start-1">
              <SectionHeading tone="dark" title={title} description={description} />
              <div className="grid gap-6 sm:grid-cols-2">
                {first ? <PillarCard pillar={first} /> : null}
                {second ? <PillarCard pillar={second} /> : null}
                {third ? <PillarCard pillar={third} size="wide" className="sm:col-span-2" /> : null}
              </div>
            </div>
            <div className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8">
              <img src={image.src} alt={image.decorative ? '' : image.alt} width={image.width} height={image.height} className="aspect-[461/542] w-full object-cover" />
              {action ? (
                <Button href={action.href} variant="paper" className="self-start">
                  {action.label}
                </Button>
              ) : null}
            </div>
          </div>
          <StatsStrip stats={stats} locale={locale} />
        </Container>
      </Section>
    );
  },
);
ReasonsSection.displayName = 'ReasonsSection';
