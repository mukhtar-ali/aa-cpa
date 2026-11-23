import * as React from 'react';
import { cn } from '../../lib/cn';
import { warnMissingBreadcrumbLabel } from '../../lib/dev-warn';
import { Button } from '../../primitives/Button';
import { Breadcrumbs } from '../../primitives/Breadcrumbs';
import { Heading } from '../../primitives/Heading';
import { Text } from '../../primitives/Text';
import type { ActionRef, ImageRef, LinkRef } from '../../types';
import { Container } from '../Container';

export interface PageHeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  subtitle?: string;
  /** Background photo; shown under an 81 % dark overlay. */
  image: ImageRef;
  breadcrumbs?: LinkRef[];
  /** Accessible name of the breadcrumb landmark (required when `breadcrumbs` is set). */
  breadcrumbsLabel?: string;
  action?: ActionRef;
}

/**
 * Inner-page hero (Figma "Page title" 445:40591): photo with a dark overlay, H1 (max two lines) and the supporting sentence under it,
 * 200 px above and 96 px below the text, text at the inline start. Optional breadcrumbs above and one action below.
 *
 * @figma 445:40591, 212:9721
 */
export const PageHero = React.forwardRef<HTMLElement, PageHeroProps>(
  ({ title, subtitle, image, breadcrumbs, breadcrumbsLabel, action, className, ...props }, ref) => (
    <section ref={ref} className={cn('relative isolate overflow-hidden bg-bg-hero text-text-inverse', className)} {...props}>
      {warnMissingBreadcrumbLabel(breadcrumbs, breadcrumbsLabel, 'PageHero')}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* plain <img>: the library is framework-agnostic; apps decide on next/image */}
        <img src={image.src} alt="" width={image.width} height={image.height} className="size-full object-cover" />
        <div data-overlay className="absolute inset-0 bg-bg-hero/81" />
      </div>
      <Container className="flex flex-col items-start justify-end gap-6 pt-50 pb-24">
        {breadcrumbs && breadcrumbs.length > 0 && breadcrumbsLabel ? <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} tone="dark" /> : null}
        <Heading level={1} tone="inverse" className="max-w-275">
          {title}
        </Heading>
        {subtitle ? (
          <Text size="lg" tone="inverse" className="max-w-140">
            {subtitle}
          </Text>
        ) : null}
        {action ? (
          <Button href={action.href} variant={action.variant ?? 'primary'} size="md">
            {action.label}
          </Button>
        ) : null}
      </Container>
    </section>
  ),
);
PageHero.displayName = 'PageHero';
