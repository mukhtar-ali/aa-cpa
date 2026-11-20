import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../IconButton';

export interface PaginationLabels {
  /** Accessible name of the `nav`. */
  nav: string;
  previous: string;
  next: string;
  /** Builds the label of a page link, for example (n) => `Page ${n}`. */
  page: (page: number) => string;
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  page: number;
  pageCount: number;
  /** Link mode: href of a page (server-renderable). */
  hrefFor?: (page: number) => string;
  /** Button mode (client). */
  onPageChange?: (page: number) => void;
  labels: PaginationLabels;
}

/** Pages to show: all when 7 or fewer, otherwise first, last and a window around the current page with ellipses. */
export function pageItems(page: number, pageCount: number): Array<number | 'gap-start' | 'gap-end'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const items: Array<number | 'gap-start' | 'gap-end'> = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);
  if (from > 2) items.push('gap-start');
  for (let n = from; n <= to; n++) items.push(n);
  if (to < pageCount - 1) items.push('gap-end');
  items.push(pageCount);
  return items;
}

const pageClasses = (current: boolean) =>
  cn(
    'inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-solid px-3 text-body-sm font-bold',
    'transition-colors duration-(--motion-duration-fast) ease-standard',
    current ? 'border-bg-inverse bg-bg-inverse text-text-inverse' : 'border-border-subtle bg-bg-surface text-text-heading hover:bg-bg-page',
  );

/**
 * Page navigation (Figma 530:4416: 40 px pills, current = inverse fill). Renders real links with `hrefFor`, otherwise buttons.
 *
 * @figma 530:4416
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ page, pageCount, hrefFor, onPageChange, labels, className, ...props }, ref) => {
    if (pageCount <= 1) return null;
    const go = (n: number) => (onPageChange ? () => onPageChange(n) : undefined);
    const prevDisabled = page <= 1;
    const nextDisabled = page >= pageCount;
    return (
      <nav ref={ref} aria-label={labels.nav} className={cn('flex flex-wrap items-center justify-center gap-2', className)} {...props}>
        <IconButton
          label={labels.previous}
          icon="chevron"
          reverseIcon
          size="sm"
          disabled={prevDisabled}
          href={hrefFor && !prevDisabled ? hrefFor(page - 1) : undefined}
          onClick={go(page - 1)}
        />
        <ul className="flex flex-wrap items-center gap-2">
          {pageItems(page, pageCount).map((item) =>
            typeof item === 'string' ? (
              <li key={item} aria-hidden="true" className="px-1 text-text-muted">
                …
              </li>
            ) : (
              <li key={item}>
                {hrefFor ? (
                  <a href={hrefFor(item)} aria-label={labels.page(item)} aria-current={item === page ? 'page' : undefined} className={pageClasses(item === page)}>
                    {item}
                  </a>
                ) : (
                  <button
                    type="button"
                    aria-label={labels.page(item)}
                    aria-current={item === page ? 'page' : undefined}
                    onClick={go(item)}
                    className={pageClasses(item === page)}
                  >
                    {item}
                  </button>
                )}
              </li>
            ),
          )}
        </ul>
        <IconButton
          label={labels.next}
          icon="chevron"
          size="sm"
          disabled={nextDisabled}
          href={hrefFor && !nextDisabled ? hrefFor(page + 1) : undefined}
          onClick={go(page + 1)}
        />
      </nav>
    );
  },
);
Pagination.displayName = 'Pagination';
