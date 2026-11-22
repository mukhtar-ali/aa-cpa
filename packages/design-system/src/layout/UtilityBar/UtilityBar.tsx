import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { ContactChannel } from '../../types';
import { Container } from '../Container';

export interface UtilityBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Licence line, shown in the accent colour, for example the SOCPA licence number. */
  license: string;
  /** Network membership line. */
  network: string;
  /** Cities / offices. */
  city: string;
  phone: ContactChannel;
  /** Language switch, normally a `LanguageToggle`. */
  localeSwitch?: React.ReactNode;
}

const divider = <span aria-hidden="true" className="h-11 w-px shrink-0 bg-text-on-action/10" />;

/**
 * Institutional utility bar above the header (Figma 445:40612): credentials (network and licence) on the inline start;
 * language pill, phone and cities on the end (Arabic-first order, mirrored in English). Dark hero tone, 44 px high with a 10 % white bottom border. The credentials collapse below `lg`.
 *
 * @figma 445:40612
 */
export const UtilityBar = React.forwardRef<HTMLDivElement, UtilityBarProps>(
  ({ license, network, city, phone, localeSwitch, className, ...props }, ref) => (
    <div ref={ref} className={cn('border-b border-solid border-text-on-action/10 bg-bg-hero text-body-sm text-text-on-action/85', className)} {...props}>
      <Container className="flex h-11 items-center justify-between gap-6">
        <div className="hidden items-center gap-5 lg:flex">
          <span>{network}</span>
          {divider}
          <span className="font-bold text-text-accent-inverse">{license}</span>
        </div>
        <div className="flex items-center gap-4">
          {localeSwitch}
          {localeSwitch ? divider : null}
          <a href={phone.href ?? `tel:${phone.value.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-text-on-action">
            <bdi dir="ltr">{phone.value}</bdi>
            <Icon name="phone" size={14} />
          </a>
          {divider}
          <span className="hidden sm:inline">{city}</span>
        </div>
      </Container>
    </div>
  ),
);
UtilityBar.displayName = 'UtilityBar';
