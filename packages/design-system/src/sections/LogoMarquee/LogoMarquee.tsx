'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import type { LogoItem } from '../../types';

export interface LogoMarqueeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Accessible name of the region, for example "Our clients". */
  label: string;
  /** Rows of logos; neighbouring rows scroll in opposite directions. */
  rows: LogoItem[][];
  /** Accessible name of the pause button (pressed = paused), for example "Pause animation". */
  pauseLabel: string;
  /** Seconds for one loop (default 60). */
  duration?: number;
}

function LogoCell({ logo, decorative }: { logo: LogoItem; decorative: boolean }) {
  return (
    <li className="flex h-33 w-60 shrink-0 items-center justify-center rounded-sm border border-solid border-border-decor bg-bg-surface p-4">
      {logo.image ? (
        <img src={logo.image.src} alt={decorative || logo.image.decorative ? '' : logo.image.alt || logo.name} width={logo.image.width} height={logo.image.height} className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-body-sm text-text-muted">{decorative ? '' : logo.name}</span>
      )}
    </li>
  );
}

/**
 * Client logo marquee (Figma 569:5848): 240 x 132 cells 20 px apart, rows scrolling in opposite directions, faded edges. CSS-only
 * animation; it pauses on hover and keyboard focus, through the pause button (`aria-pressed`) and under prefers-reduced-motion. The
 * second copy of each row is `aria-hidden` so every logo is announced once.
 *
 * @figma 569:5848
 */
export function LogoMarquee({ label, rows, pauseLabel, duration = 60, className, ...props }: LogoMarqueeProps) {
  const reduced = useReducedMotion();
  const [userPaused, setUserPaused] = React.useState(false);
  const paused = reduced || userPaused;
  return (
    <section aria-label={label} className={cn('ds-marquee-group relative flex flex-col gap-5 overflow-hidden bg-bg-page py-section-md', className)} {...props}>
      {rows.map((row, index) => (
        <div key={index} className="relative overflow-hidden">
          <div className="ds-marquee-track flex w-max" data-paused={paused} data-reverse={index % 2 === 1} style={{ ['--ds-marquee-duration' as string]: `${duration}s` }}>
            <ul className="flex gap-5 pe-5">
              {row.map((logo) => (
                <LogoCell key={logo.name} logo={logo} decorative={false} />
              ))}
            </ul>
            <ul aria-hidden="true" className="flex gap-5 pe-5">
              {row.map((logo) => (
                <LogoCell key={logo.name} logo={logo} decorative />
              ))}
            </ul>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-0 w-60 bg-linear-to-r from-bg-page to-transparent rtl:bg-linear-to-l" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-0 w-60 bg-linear-to-l from-bg-page to-transparent rtl:bg-linear-to-r" />
        </div>
      ))}
      <button
        type="button"
        aria-pressed={paused}
        disabled={reduced}
        onClick={() => setUserPaused((value) => !value)}
        className="mx-auto mt-2 rounded-full border border-solid border-border-subtle bg-bg-surface px-4 py-1.5 text-body-sm font-bold text-text-heading disabled:opacity-60"
      >
        {pauseLabel}
      </button>
    </section>
  );
}
