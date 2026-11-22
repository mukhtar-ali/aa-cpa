import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';

const ICONS: Record<'location' | 'contract' | 'experience' | 'date', IconName> = {
  location: 'location',
  contract: 'briefcase',
  experience: 'award',
  date: 'calendar',
};

export interface MetaPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: keyof typeof ICONS;
  children: React.ReactNode;
}

/**
 * Job / article meta pill: label then 18 px icon in a 40 px bordered pill.
 *
 * @figma 529:4333
 */
export const MetaPill = React.forwardRef<HTMLSpanElement, MetaPillProps>(({ icon, className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center gap-2 rounded-full border border-border-subtle bg-bg-surface ps-4 pe-3.5 text-body-sm text-text-body',
      className,
    )}
    {...props}
  >
    <span>{children}</span>
    <Icon name={ICONS[icon]} size={18} className="text-emerald-600" />
  </span>
));
MetaPill.displayName = 'MetaPill';
