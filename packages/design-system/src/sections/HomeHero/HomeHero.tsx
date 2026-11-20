import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import { Heading } from '../../primitives/Heading';
import { Text } from '../../primitives/Text';
import { Container } from '../../layout/Container';
import { Pattern } from '../../layout/Pattern';
import type { ActionRef, ImageRef } from '../../types';

export interface HomeHeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  body: string;
  /** Up to two actions: the first renders as the primary button, the second as the secondary button. */
  actions: ActionRef[];
  /** Portrait photo (630 x 498 in Figma, a plain rectangle crop). */
  image: ImageRef;
}

/**
 * Homepage hero (Figma 411:3700 to 411:3711): dark hero tone with flow lines, the H1 (gradient text on dark, as in Figma) and two buttons at the inline start, a
 * 630 x 498 photo in the middle overlapped by the title, and the intro paragraph at the inline end. The grid positions follow the
 * Figma coordinates on a 12-column 1140 px grid; the exact offsets are to be verified in the parity pass.
 *
 * @figma 411:3700, 411:3701, 411:3702, 411:3706, 411:3709
 */
export const HomeHero = React.forwardRef<HTMLElement, HomeHeroProps>(({ title, body, actions, image, className, ...props }, ref) => {
  const [primary, secondary] = actions;
  return (
    <section ref={ref} className={cn('relative isolate overflow-hidden bg-bg-hero text-text-inverse', className)} {...props}>
      <Pattern name="flow-lines" tone="dark" className="-z-10 opacity-60" />
      <Container className="grid gap-8 pt-36 pb-24 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:gap-x-6 lg:pt-38 lg:pb-0">
        <Heading level={1} tone="inverse" className="bg-linear-to-b from-gradient-start to-gradient-end bg-clip-text text-transparent lg:z-10 lg:col-span-6 lg:col-start-1 lg:row-start-1">
          {title}
        </Heading>
        <div className="flex flex-wrap items-start gap-4 lg:z-10 lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:self-start">
          {primary ? (
            <Button href={primary.href} variant={primary.variant ?? 'primary'}>
              {primary.label}
            </Button>
          ) : null}
          {secondary ? (
            <Button href={secondary.href} variant={secondary.variant ?? 'secondary'}>
              {secondary.label}
            </Button>
          ) : null}
        </div>
        <Text size="lg" tone="inverse-muted" className="lg:col-span-4 lg:col-start-9 lg:row-start-2">
          {body}
        </Text>
        <div className="lg:col-span-6 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:self-end">
          <img src={image.src} alt={image.decorative ? '' : image.alt} width={image.width} height={image.height} className="aspect-[630/498] w-full object-cover" />
        </div>
      </Container>
    </section>
  );
});
HomeHero.displayName = 'HomeHero';
