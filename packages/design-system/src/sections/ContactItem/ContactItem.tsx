import * as React from 'react';
import { cn } from '../../lib/cn';
import { contactHref } from '../../lib/contact-links';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import type { ContactChannel } from '../../types';

export interface ContactItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  channel: ContactChannel;
}

const ICONS: Record<ContactChannel['type'], IconName> = { phone: 'phone', email: 'mail', whatsapp: 'whatsapp', hours: 'clock' };


/**
 * Contact line: icon in a 48 px emerald-100 circle, muted label and bold value. Phone, email and WhatsApp values are links (tel:, mailto:,
 * wa.me); opening hours are plain text. Values are isolated as LTR text. The contact icon sheet (527:5423) gives the icons; the layout is
 * inferred (to verify).
 *
 * @figma 527:5423
 */
export const ContactItem = React.forwardRef<HTMLElement, ContactItemProps>(({ channel, className, ...props }, ref) => {
  const href = contactHref(channel.type, channel.value, channel.href);
  const value = channel.type === 'hours' ? channel.value : <bdi dir="ltr">{channel.value}</bdi>;
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cn('flex items-center gap-4', className)} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Icon name={ICONS[channel.type]} size={22} />
      </span>
      <div className="flex flex-col">
        <span className="text-body-sm text-text-muted">{channel.label}</span>
        {href ? (
          <a href={href} {...(channel.type === 'whatsapp' ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="text-body-md font-bold text-text-heading hover:underline">
            {value}
          </a>
        ) : (
          <span className="text-body-md font-bold text-text-heading">{value}</span>
        )}
      </div>
    </div>
  );
});
ContactItem.displayName = 'ContactItem';
