import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import { Pattern } from '../../layout/Pattern';
import type { ActionRef, ImageRef } from '../../types';

export interface PhotoQuoteBandProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The quote headline (H2 here; Figma uses the H1 size). Break lines with `\n`. */
  title: string;
  body: string;
  action?: ActionRef;
  image: ImageRef;
}

/**
 * Half-photo, half-quote band on the inverse tone (Figma 411:3846: 720 x 640 photo, H1-sized headline, Body/Large text, paper button).
 * The panel carries the logo-mark pattern. The text sits at the inline start and the photo at the inline end.
 *
 * @figma 411:3846, 411:3848
 */
export const PhotoQuoteBand = React.forwardRef<HTMLElement, PhotoQuoteBandProps>(({ title, body, action, image, className, ...props }, ref) => (
  <section ref={ref} className={cn('grid bg-bg-inverse text-text-inverse lg:grid-cols-2', className)} {...props}>
    <div className="relative isolate flex flex-col items-start justify-center gap-6 overflow-hidden px-4 py-16 sm:px-6 lg:px-16 lg:py-24">
      <Pattern name="logo-lines" tone="dark" className="-z-10 opacity-50" />
      <h2 className="text-h1 font-bold whitespace-pre-line">{title}</h2>
      <p className="text-body-lg">{body}</p>
      {action ? (
        <Button href={action.href} variant="paper">
          {action.label}
        </Button>
      ) : null}
    </div>
    <img src={image.src} alt={image.decorative ? '' : image.alt} width={image.width} height={image.height} className="aspect-[720/640] h-full w-full object-cover" />
  </section>
));
PhotoQuoteBand.displayName = 'PhotoQuoteBand';
