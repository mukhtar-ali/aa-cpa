import React from 'react';
import { cn } from '../../lib/cn';
import { LogoLines } from './LogoLines';

export type PatternName = 'flow-lines' | 'dots-grid' | 'logo-lines';
export type PatternTone = 'light' | 'dark';

export interface PatternProps extends React.HTMLAttributes<HTMLDivElement> {
  name: PatternName;
  tone?: PatternTone;
}

function FlowLinesSvg() {
  const clipId = React.useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1512"
      height="771"
      fill="none"
      overflow="visible"
      preserveAspectRatio="none"
      style={{ display: 'block' }}
      viewBox="0 0 1512 771"
      className="w-full h-full"
    >
      <g stroke="currentColor" clipPath={`url(#${clipId})`}>
        <path d="M-60 260C453.6 120 937.44 400 1572 80" opacity=".3" />
        <path d="M-60 286c513.6-135.333 997.44 136 1632-176" opacity=".487" />
        <path d="M-60 312c513.6-130.667 997.44 132 1632-172" opacity=".666" />
        <path d="M-60 338c513.6-126 997.44 128 1632-168" opacity=".829" />
        <path d="M-60 364c513.6-121.333 997.44 124 1632-164" opacity=".969" />
        <path d="M-60 390c513.6-116.667 997.44 120 1632-160" />
        <path d="M-60 416c513.6-112 997.44 116 1632-156" />
        <path d="M-60 442c513.6-107.333 997.44 112 1632-152" />
        <path d="M-60 468c513.6-102.667 997.44 108 1632-148" />
        <path d="M-60 494c513.6-98 997.44 104 1632-144" />
        <path d="M-60 520c513.6-93.333 997.44 100 1632-140" />
        <path d="M-60 546c513.6-88.667 997.44 96 1632-136" opacity=".969" />
        <path d="M-60 572c513.6-84 997.44 92 1632-132" opacity=".829" />
        <path d="M-60 598c513.6-79.333 997.44 88 1632-128" opacity=".666" />
        <path d="M-60 624c513.6-74.667 997.44 84 1632-124" opacity=".487" />
        <path d="M-60 650c513.6-70 997.44 80 1632-120" opacity=".3" />
      </g>
      <defs>
        <clipPath id={clipId}>
          <path d="M0 0h1512v771H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function DotsGridSvg() {
  const patternId = React.useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1479"
      height="741"
      fill="none"
      viewBox="0 0 1479 741"
      className="w-full h-full"
    >
      <defs>
        <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <path fill={`url(#${patternId})`} d="M0 0h1479v741H0z" />
    </svg>
  );
}

function getPatternColorClass(name: PatternName, tone: PatternTone): string {
  switch (name) {
    case 'logo-lines':
      return tone === 'dark' ? 'text-border-inverse' : 'text-border-decor';
    case 'flow-lines':
      return 'text-border-inverse';
    case 'dots-grid':
      return 'text-text-strong';
  }
}

/**
 * Background pattern overlays derived from Figma assets.
 * Rendered inline, positioned absolutely with logical insets, and marked aria-hidden.
 *
 * @figma 413:323, 411:171, 428:2043
 */
export const Pattern = React.forwardRef<HTMLDivElement, PatternProps>(
  ({ name, tone = 'light', className, ...props }, ref) => {
    const colorClass = getPatternColorClass(name, tone);
    const isDirectional = name === 'flow-lines';

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          'absolute inset-0 pointer-events-none overflow-hidden',
          colorClass,
          isDirectional && 'rtl:-scale-x-100',
          className,
        )}
        {...props}
      >
        {name === 'flow-lines' && <FlowLinesSvg />}
        {name === 'dots-grid' && <DotsGridSvg />}
        {name === 'logo-lines' && <LogoLines tone={tone} />}
      </div>
    );
  },
);

Pattern.displayName = 'Pattern';
