import * as React from 'react';
import { cn } from '../../lib/cn';
import type { MethodologyRow } from '../../types';

export interface MethodologyListProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  rows: MethodologyRow[];
}

/**
 * "Our methodology" list (Figma 448:42773 to 448:42796): one capability per row, a 33 px bold name at the inline start and a Body/Large
 * description at the end, 24 px vertical padding and a hairline divider. Rows are not links in this version (the Figma note about a
 * hover colour applies when a row links somewhere).
 *
 * @figma 448:42728, 448:42778
 */
export const MethodologyList = React.forwardRef<HTMLElement, MethodologyListProps>(({ title, rows, className, ...props }, ref) => (
  <section ref={ref} className={cn('flex flex-col gap-10 text-blue-950', className)} {...props}>
    <h2 className="text-h2 font-bold">{title}</h2>
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li key={row.title} className="flex flex-col gap-3 border-b border-solid border-black/6 py-6 md:flex-row md:items-start md:justify-between md:gap-12">
          <h3 className="text-h3 font-bold md:w-[30rem] md:shrink-0">{row.title}</h3>
          <p className="text-body-lg md:max-w-130">{row.body}</p>
        </li>
      ))}
    </ul>
  </section>
));
MethodologyList.displayName = 'MethodologyList';
