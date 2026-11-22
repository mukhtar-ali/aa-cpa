import * as React from 'react';
import { cn } from '../../lib/cn';
import { Container } from '../../layout/Container';
import { Pattern } from '../../layout/Pattern';
import { Heading } from '../../primitives/Heading';
import { Text } from '../../primitives/Text';
import type { Testimonial as TestimonialData } from '../../types';
import { Estimator, type EstimatorProps } from '../Estimator';
import { Testimonial } from '../Testimonial';

export interface EstimatorSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  heading: string;
  intro: string;
  /** Props of the estimator card. */
  estimator: EstimatorProps;
  testimonial: TestimonialData;
  /** Accessible text of the testimonial rating, for example "5 of 5". */
  ratingLabel?: string;
}

/**
 * Estimator band (Figma 411:3854): flow lines on the page tone, the H1-sized heading with intro and a client testimonial at the
 * inline start, the dark estimator card at the inline end. Grid offsets approximate the frame (to verify in the parity pass).
 *
 * @figma 411:3854, 411:3855, 411:3869, 411:3870
 */
export const EstimatorSection = React.forwardRef<HTMLElement, EstimatorSectionProps>(({ heading, intro, estimator, testimonial, ratingLabel, className, ...props }, ref) => (
  <section ref={ref} className={cn('relative isolate overflow-hidden bg-bg-page py-section-lg', className)} {...props}>
    <Pattern name="flow-lines" tone="light" className="-z-10 opacity-40" />
    <Container className="grid gap-12 lg:grid-cols-[1fr_35rem] lg:gap-x-6">
      <div className="flex flex-col gap-6">
        <Heading level={2} size="h1" className="text-text-strong lg:max-w-md">
          {heading}
        </Heading>
        <Text size="lg">{intro}</Text>
        <Testimonial testimonial={testimonial} ratingLabel={ratingLabel} tone="light" className="mt-6" />
      </div>
      <div>
        <Estimator {...estimator} />
      </div>
    </Container>
  </section>
));
EstimatorSection.displayName = 'EstimatorSection';
