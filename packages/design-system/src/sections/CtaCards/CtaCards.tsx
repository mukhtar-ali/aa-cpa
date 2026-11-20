import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { Pattern } from '../../layout/Pattern';
import { Button } from '../../primitives/Button';
import type { ActionRef } from '../../types';

export interface CtaCardData {
  icon: IconName;
  title: string;
  body: string;
  action: ActionRef;
  /** `light` is the white FAQ card (448:43007); `dark` is the "talk to an expert" card with the ribbon pattern (448:42994). */
  tone?: 'light' | 'dark';
}

export interface CtaCardsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Optional heading above the cards, for example "Not sure the service is for you?". */
  title?: string;
  cards: CtaCardData[];
}

/**
 * Two call-to-action cards side by side (Figma 448:42994 and 448:43007, 558 x 324): 24 px radius, a 64 px round icon on emerald/100, H4
 * title, Body/Medium text and a primary button. The dark variant is inferred from the frame (ribbons background) and is unverified.
 *
 * @figma 448:42994, 448:43007, 473:36122, 473:36200
 */
export const CtaCards = React.forwardRef<HTMLElement, CtaCardsProps>(({ title, cards, className, ...props }, ref) => (
  <section ref={ref} className={cn('flex flex-col gap-8', className)} {...props}>
    {title ? <h2 className="text-h4 font-bold text-text-heading">{title}</h2> : null}
    <ul className="grid gap-6 md:grid-cols-2">
      {cards.map((card) => {
        const dark = card.tone === 'dark';
        return (
          <li key={card.title} className={cn('relative isolate flex flex-col items-start gap-5 overflow-hidden rounded-cta p-10', dark ? 'bg-bg-inverse text-text-inverse' : 'bg-bg-surface text-text-heading')}>
            {dark ? <Pattern name="flow-lines" tone="dark" className="-z-10 opacity-60" /> : null}
            <span className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Icon name={card.icon} size={32} />
            </span>
            <h3 className="text-h4 font-bold">{card.title}</h3>
            <p className={cn('text-body-md', dark ? 'text-text-inverse' : 'text-text-body')}>{card.body}</p>
            <Button href={card.action.href} variant={dark ? 'paper' : (card.action.variant ?? 'primary')} className="mt-auto">
              {card.action.label}
            </Button>
          </li>
        );
      })}
    </ul>
  </section>
));
CtaCards.displayName = 'CtaCards';
