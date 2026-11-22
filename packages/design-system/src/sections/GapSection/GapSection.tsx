import * as React from 'react';
import { cn } from '../../lib/cn';
import { Eyebrow } from '../../primitives/Eyebrow';
import { Heading } from '../../primitives/Heading';
import { Text } from '../../primitives/Text';
import { Container } from '../../layout/Container';
import { Pattern } from '../../layout/Pattern';
import type { ImageRef } from '../../types';

export interface GapSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The large statement (Heading/H3 size). */
  statement: string;
  eyebrow: string;
  body: string;
  /** Two photos: a small one (220 x 181, 10 px radius) and a tall one (315 x 415). */
  images: [ImageRef, ImageRef];
}

/**
 * "The gap we fill" band (Figma 411:3788): flow lines on the page tone, a large statement at the inline start, two photos in the
 * middle, and the eyebrow with the explanatory paragraph underneath. Grid offsets approximate the Figma coordinates (to verify).
 *
 * @figma 411:3788, 411:3796, 411:3797, 411:3798, 411:3801, 411:3805
 */
export const GapSection = React.forwardRef<HTMLElement, GapSectionProps>(({ statement, eyebrow, body, images, className, ...props }, ref) => {
  const [small, tall] = images;
  return (
    <section ref={ref} className={cn('relative isolate overflow-hidden bg-bg-page py-section-lg text-text-heading', className)} {...props}>
      <Pattern name="flow-lines" tone="light" className="-z-10 opacity-40" />
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-x-6">
        <Heading level={2} size="h3" className="bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-transparent lg:col-span-5 lg:col-start-1 lg:row-start-1">
          {statement}
        </Heading>
        <div className="flex items-start gap-6 lg:col-span-7 lg:col-start-6 lg:row-start-1">
          <img src={tall.src} alt={tall.decorative ? '' : tall.alt} width={tall.width} height={tall.height} className="aspect-[315/415] w-full object-cover sm:w-1/2" />
          <img src={small.src} alt={small.decorative ? '' : small.alt} width={small.width} height={small.height} className="hidden aspect-[220/181] w-1/3 rounded-thumb object-cover sm:block" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-1 lg:row-start-2">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <Text size="lg" className="lg:col-span-6 lg:col-start-7 lg:row-start-2">
          {body}
        </Text>
      </Container>
    </section>
  );
});
GapSection.displayName = 'GapSection';
