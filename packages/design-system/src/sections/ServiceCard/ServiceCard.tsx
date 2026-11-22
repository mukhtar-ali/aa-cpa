import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import type { ServiceSummary } from '../../types';

export interface ServiceCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  service: ServiceSummary;
  /** Heading level of the title (default 2). */
  level?: 2 | 3;
}

/**
 * Service card for the services list (Figma 448:41771): white card with 32 px radius, H2-sized title, Body/Large summary at 80 %
 * opacity, primary button, and a 20 px-radius photo at the inline end. The photo sits at 32 px from the card edges.
 *
 * @figma 448:41771
 */
export const ServiceCard = React.forwardRef<HTMLElement, ServiceCardProps>(({ service, level = 2, className, ...props }, ref) => {
  const Title = `h${level}` as const;
  return (
    <article ref={ref} className={cn('grid gap-8 overflow-hidden rounded-card-lg bg-bg-surface p-8 text-ice-950 md:grid-cols-[1fr_26.8125rem]', className)} {...props}>
      <div className="flex flex-col justify-between gap-8 py-6 md:py-6">
        <div className="flex flex-col gap-4">
          <Title className="text-h2 font-bold">{service.title}</Title>
          <p className="text-body-lg opacity-80">{service.summary}</p>
        </div>
        {service.href && service.ctaLabel ? (
          <Button href={service.href} className="self-start">
            {service.ctaLabel}
            <span className="sr-only">: {service.title}</span>
          </Button>
        ) : null}
      </div>
      {service.image ? (
        <img
          src={service.image.src}
          alt={service.image.decorative ? '' : service.image.alt}
          width={service.image.width}
          height={service.image.height}
          className="aspect-[429/336] w-full rounded-card object-cover"
        />
      ) : null}
    </article>
  );
});
ServiceCard.displayName = 'ServiceCard';
