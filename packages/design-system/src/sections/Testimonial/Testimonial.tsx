import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../primitives/Avatar';
import { Rating } from '../../primitives/Rating';
import type { Testimonial as TestimonialData } from '../../types';

export interface TestimonialProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  testimonial: TestimonialData;
  /** Accessible text of the rating, for example "5 of 5". Required when the testimonial has a rating. */
  ratingLabel?: string;
  /** Visual tone: `dark` for the estimator band (default), `light` on page tones. */
  tone?: 'dark' | 'light';
}

/**
 * Client quote with optional rating, avatar, name and role (Figma 411:3871 to 411:3880). Quote size and tone are not fully
 * specified in the frame (to verify).
 *
 * @figma 411:3871, 411:3877, 411:3878, 411:3879, 411:3880
 */
export const Testimonial = React.forwardRef<HTMLElement, TestimonialProps>(({ testimonial, ratingLabel, tone = 'dark', className, ...props }, ref) => {
  const dark = tone === 'dark';
  const role = [testimonial.role, testimonial.company].filter(Boolean).join(' · ');
  return (
    <figure ref={ref} className={cn('flex flex-col gap-6', className)} {...props}>
      {testimonial.rating && ratingLabel ? <Rating value={testimonial.rating} label={ratingLabel} /> : null}
      <blockquote className={cn('text-h5 font-bold', dark ? 'text-text-inverse' : 'text-text-heading')}>{testimonial.quote}</blockquote>
      <figcaption className="flex items-center gap-4">
        <Avatar name={testimonial.name} image={testimonial.avatar} />
        <span className="flex flex-col">
          <span className={cn('text-body-md font-bold', dark ? 'text-text-inverse' : 'text-text-heading')}>{testimonial.name}</span>
          <span className={cn('text-body-sm', dark ? 'text-text-inverse-muted' : 'text-text-muted')}>{role}</span>
        </span>
      </figcaption>
    </figure>
  );
});
Testimonial.displayName = 'Testimonial';
