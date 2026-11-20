'use client';

import * as React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { cn } from '../../lib/cn';
import type { FaqItem } from '../../types';

export interface FaqAccordionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: string;
  items: FaqItem[];
  /** Id of the item open at first (none by default). */
  defaultOpenId?: string;
}

/**
 * FAQ accordion (Figma 463:3590 open, 463:3596 closed): H4-sized question next to a 40 px outlined plus/minus icon, answer in Body/Large,
 * 1 px divider and 28 px vertical padding. Radix Accordion (single, collapsible): Enter/Space toggle, arrow keys move between headers,
 * `aria-expanded` is set on the trigger.
 *
 * @figma 463:3590, 463:3596, 463:1158
 */
export function FaqAccordion({ title, items, defaultOpenId, className, ...props }: FaqAccordionProps) {
  return (
    <section className={cn('flex flex-col gap-10', className)} {...props}>
      {title ? <h2 className="text-h2 font-bold text-text-heading">{title}</h2> : null}
      <Accordion.Root type="single" collapsible defaultValue={defaultOpenId}>
        {items.map((item) => (
          <Accordion.Item key={item.id} value={item.id} className="border-b border-solid border-border-subtle">
            <Accordion.Header asChild>
              <h3>
                <Accordion.Trigger className="group flex w-full cursor-pointer items-center gap-6 py-7 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring-focus">
                  <span aria-hidden="true" className="relative size-10 shrink-0 rounded-full border-(length:--border-width-focus) border-solid border-border-subtle">
                    <span className="absolute start-2.5 top-[1.0625rem] h-0.5 w-4 rounded-full bg-text-heading" />
                    <span className="absolute start-4.25 top-2.5 h-4 w-0.5 rounded-full bg-text-heading transition-opacity duration-(--motion-duration-fast) group-data-[state=open]:opacity-0" />
                  </span>
                  <span className="flex-1 text-h4 font-bold text-text-heading">{item.question}</span>
                </Accordion.Trigger>
              </h3>
            </Accordion.Header>
            <Accordion.Content className="pb-7 ps-16">
              <p className="max-w-190 text-body-lg text-text-body">{item.answer}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
