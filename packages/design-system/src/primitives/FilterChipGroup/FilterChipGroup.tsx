'use client';

import * as React from 'react';
import { useDirection } from '@radix-ui/react-direction';
import { cn } from '../../lib/cn';

export interface FilterChipItem {
  value: string;
  label: string;
}

export interface FilterChipGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'aria-label'> {
  items: FilterChipItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name of the group (required). */
  label: string;
}

/**
 * Single-select filter chips (Figma 499:1149: 40 px pills; selected = inverse fill). Roving tabindex; arrow keys move and select
 * following the reading direction (in RTL, ArrowLeft goes to the next chip); each chip exposes `aria-pressed`.
 *
 * @figma 499:1149
 */
export function FilterChipGroup({ items, value, onValueChange, label, className, ...props }: FilterChipGroupProps) {
  const dir = useDirection();
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );

  const move = (from: number, step: number) => {
    const next = (from + step + items.length) % items.length;
    refs.current[next]?.focus();
    const item = items[next];
    if (item) onValueChange(item.value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === backward) {
      event.preventDefault();
      move(index, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(index, -index);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(index, items.length - 1 - index);
    }
  };

  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-3', className)} {...props}>
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            aria-pressed={selected}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-full border border-solid px-5.5 text-body-sm font-bold whitespace-nowrap',
              'transition-colors duration-(--motion-duration-fast) ease-standard',
              selected ? 'border-bg-inverse bg-bg-inverse text-text-inverse' : 'border-border-chip bg-transparent text-text-heading hover:bg-bg-surface',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
