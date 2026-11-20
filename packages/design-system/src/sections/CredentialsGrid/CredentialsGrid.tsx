import * as React from 'react';
import { cn } from '../../lib/cn';
import type { LogoItem } from '../../types';

export interface CredentialsGridProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  description?: string;
  logos: LogoItem[];
  /** Show dashed placeholder cells (`placeholder: true` items). Hidden by default so production pages never show them. */
  showPlaceholders?: boolean;
  /** Text inside placeholder cells, for example "Organisation logo". */
  placeholderLabel?: string;
}

/**
 * Accreditations band (Figma 585:6030): dark section with an H4 title and an intro line, then 209 x 120 logo cells (white, 4 px radius,
 * decor border) and dashed placeholder cells for logos still to come.
 *
 * @figma 585:6030, 561:1235
 */
export const CredentialsGrid = React.forwardRef<HTMLElement, CredentialsGridProps>(
  ({ title, description, logos, showPlaceholders = false, placeholderLabel, className, ...props }, ref) => {
    const visible = logos.filter((logo) => showPlaceholders || !logo.placeholder);
    return (
      <section ref={ref} className={cn('bg-bg-inverse py-section-md text-text-on-action', className)} {...props}>
        <div className="mx-auto flex max-w-285 flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            <h2 className="text-h4 font-bold">{title}</h2>
            {description ? <p className="max-w-130 text-body-md">{description}</p> : null}
          </div>
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((logo) => (
              <li
                key={logo.name}
                className={cn(
                  'flex h-30 items-center justify-center overflow-hidden rounded-sm border border-solid p-4',
                  logo.placeholder ? 'border-dashed border-border-subtle text-body-sm text-text-inverse-muted' : 'border-border-decor bg-bg-surface',
                )}
              >
                {logo.image ? (
                  <img src={logo.image.src} alt={logo.image.decorative ? '' : logo.image.alt || logo.name} width={logo.image.width} height={logo.image.height} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span>{logo.placeholder ? (placeholderLabel ?? logo.name) : logo.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  },
);
CredentialsGrid.displayName = 'CredentialsGrid';
