'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/use-reduced-motion';

export interface BackToTopProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
}

/** Scrolls to the top of the page; honours prefers-reduced-motion (instant jump instead of smooth scroll). */
export function BackToTop({ label, className, onClick, ...props }: BackToTopProps) {
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      className={cn('text-body-sm text-text-inverse underline-offset-4 hover:underline', className)}
      onClick={(event) => {
        onClick?.(event);
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      }}
      {...props}
    >
      {label}
    </button>
  );
}
