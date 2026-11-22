import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';

export interface WhatsAppFloatProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string;
  /** Visible label, for example "WhatsApp". */
  label: string;
}

/**
 * Floating WhatsApp call-to-action (Figma 226:10011): paper pill with shadow, label then bubble. Fixed 24 px from the bottom and
 * the inline end (bottom-left in Arabic), above the iOS safe area. Hiding it on the contact page is the page's job.
 *
 * @figma 226:10011
 */
export const WhatsAppFloat = React.forwardRef<HTMLAnchorElement, WhatsAppFloatProps>(({ href, label, className, ...props }, ref) => (
  <a
    ref={ref}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      'fixed end-6 bottom-6 z-40 mb-[env(safe-area-inset-bottom)] inline-flex items-center gap-3 rounded-full bg-bg-page px-6 py-4',
      'text-body-lg font-bold text-text-strong shadow-float transition-transform duration-(--motion-duration-fast) ease-standard hover:-translate-y-0.5',
      className,
    )}
    {...props}
  >
    <span>{label}</span>
    <Icon name="whatsapp" size={22} />
  </a>
));
WhatsAppFloat.displayName = 'WhatsAppFloat';
