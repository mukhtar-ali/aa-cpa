import * as React from 'react';
import { cn } from '../../lib/cn';

export interface LanguageToggleProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** Link to the same page in the other language. */
  href: string;
  /** Short label of the language you switch TO, for example "EN" or "AR". */
  label: string;
  /** BCP 47 code of the target language; sets `lang` and `hreflang` so screen readers pronounce the label correctly. */
  targetLang: string;
  /** Accessible name, for example "Switch to English". Defaults to the label. */
  accessibleLabel?: string;
}

/**
 * Language switch pill from the utility bar (Figma 445:40614): 11 px bold label, 1 px light-blue outline at 40 %, fully rounded.
 * Designed for dark backgrounds. (The old library set 64:28 is not used as a reference.)
 *
 * @figma 445:40614
 */
export const LanguageToggle = React.forwardRef<HTMLAnchorElement, LanguageToggleProps>(
  ({ href, label, targetLang, accessibleLabel, className, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      hrefLang={targetLang}
      lang={targetLang}
      aria-label={accessibleLabel}
      className={cn(
        'inline-flex items-start rounded-full border border-solid border-icon-accent/40 px-2.5 py-px text-body-xs font-bold text-text-on-action/90',
        'transition-colors duration-(--motion-duration-fast) ease-standard hover:bg-text-on-action/10',
        className,
      )}
      {...props}
    >
      {label}
    </a>
  ),
);
LanguageToggle.displayName = 'LanguageToggle';
