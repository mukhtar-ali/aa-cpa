'use client';

import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import { Pattern } from '../../layout/Pattern';
import type { ServiceSummary } from '../../types';

export interface ServiceTabsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: string;
  title: string;
  services: ServiceSummary[];
  /** Id of the service shown first (default: the first one). */
  defaultServiceId?: string;
  /** Accessible name of the tab list. */
  tabsLabel: string;
}

/**
 * Services tabs (Figma 411:3712): the heading and a vertical list of large tab labels, and for the selected service a photo with a
 * floating statistic card (425:2), the summary and a gradient link. Radix Tabs: arrow keys move between tabs, Home/End jump, and the
 * panel swaps. Selected-tab styling is not specified in the frame (to verify).
 *
 * @figma 411:3712, 425:2
 */
export function ServiceTabs({ eyebrow, title, services, defaultServiceId, tabsLabel, className, ...props }: ServiceTabsProps) {
  const first = services[0];
  if (!first) return null;
  return (
    <section className={cn('relative isolate overflow-hidden rounded-t-section bg-bg-surface-ice py-section-lg', className)} {...props}>
      <Pattern name="flow-lines" tone="light" className="-z-10 opacity-40" />
      <Tabs.Root defaultValue={defaultServiceId ?? first.id} orientation="vertical" className="mx-auto grid max-w-301 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-x-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-1">
          <div className="flex flex-col gap-1.5">
            {eyebrow ? <p className="text-body-lg font-bold text-text-heading">{eyebrow}</p> : null}
            <h2 className="text-h4 font-bold text-text-heading">{title}</h2>
          </div>
          <Tabs.List aria-label={tabsLabel} className="flex flex-col">
            {services.map((service) => (
              <Tabs.Trigger
                key={service.id}
                value={service.id}
                className={cn(
                  'py-2.5 text-start text-h3 font-bold text-text-muted outline-none transition-colors duration-(--motion-duration-fast) ease-standard',
                  'hover:text-text-heading focus-visible:ring-3 focus-visible:ring-ring-focus data-[state=active]:text-text-heading',
                )}
              >
                {service.title}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>
        {services.map((service) => (
          <Tabs.Content key={service.id} value={service.id} className="flex flex-col gap-6 outline-none lg:col-span-7 lg:col-start-6">
            {service.image ? (
              <div className="relative">
                <img
                  src={service.image.src}
                  alt={service.image.decorative ? '' : service.image.alt}
                  width={service.image.width}
                  height={service.image.height}
                  className="aspect-[557/470] w-full object-cover"
                />
                {service.highlight ? (
                  <div className="absolute end-4 bottom-4 flex w-68 flex-col gap-1 rounded-float bg-bg-surface px-5.5 py-5 shadow-card-float sm:end-8 sm:bottom-8">
                    <p className="text-body-sm text-text-muted">{service.highlight.label}</p>
                    <p className="bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-h3 font-bold text-transparent">{service.highlight.value}</p>
                    {service.highlight.note ? <p className="text-body-xs text-text-body">{service.highlight.note}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
            <p className="text-body-lg text-text-body">{service.summary}</p>
            {service.href && service.ctaLabel ? (
              <a href={service.href} className="inline-flex items-center gap-2 self-start text-body-lg font-bold">
                <span className="bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-transparent">{service.ctaLabel}</span>
                <Icon name="arrow" size={20} className="text-text-heading" />
              </a>
            ) : null}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}
