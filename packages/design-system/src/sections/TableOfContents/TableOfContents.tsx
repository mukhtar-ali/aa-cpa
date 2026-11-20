'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatNumber } from '../../lib/format';
import type { TocItem } from '../../types';

export interface TableOfContentsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Card title, for example "In this article". */
  title: string;
  items: TocItem[];
  /** Accessible name of the navigation landmark. */
  label: string;
  locale?: 'ar' | 'en';
}

/**
 * Article table of contents (Figma 506:4001): white 24 px-radius card, H6 title, rows of 44 px with a gold two-digit number, a hairline
 * divider between rows, and a 3 px emerald indicator on the inline-start edge of the active row. The active section follows scrolling
 * (IntersectionObserver); activating a row moves focus to the section and scrolls it into view.
 *
 * @figma 506:4001, 525:3854
 */
export function TableOfContents({ title, items, label, locale = 'ar', className, ...props }: TableOfContentsProps) {
  const [active, setActive] = React.useState(items[0]?.id ?? '');

  React.useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-10% 0px -70% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  const go = (event: React.MouseEvent, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <nav aria-label={label} className={cn('rounded-cta border border-solid border-border-subtle bg-bg-surface p-6', className)} {...props}>
      <h2 className="text-h6 font-bold text-text-heading">{title}</h2>
      <ol className="mt-4 flex flex-col">
        {items.map((item, index) => {
          const current = item.id === active;
          return (
            <li key={item.id} className={cn('relative flex items-center gap-3 py-2.5', index < items.length - 1 && 'border-b border-solid border-border-subtle')}>
              {current ? <span aria-hidden="true" data-indicator className="absolute inset-y-2.5 -start-3 w-0.75 rounded-full bg-emerald-600" /> : null}
              <span aria-hidden="true" className="w-7.5 shrink-0 text-body-sm font-bold text-text-accent">
                {formatNumber(item.index ?? index + 1, locale, { minimumIntegerDigits: 2 })}
              </span>
              <a href={`#${item.id}`} aria-current={current ? 'location' : undefined} onClick={(e) => go(e, item.id)} className={cn('text-body-sm', current ? 'font-bold text-text-heading' : 'text-text-body hover:text-text-heading')}>
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
