import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { IconButton } from '../../primitives/IconButton';
import type { ContactChannel, FooterColumn, LinkRef, SocialLink } from '../../types';
import { Container } from '../Container';
import { BackToTop } from './BackToTop';

export interface FooterProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Logo element (on-dark variant). */
  logo: React.ReactNode;
  description: string;
  socials: SocialLink[];
  /** Link columns (Figma shows three: quick links, services, offices). */
  columns: FooterColumn[];
  contacts: ContactChannel[];
  legal: { copyright: string; registry: string[]; links: LinkRef[] };
  backToTopLabel: string;
  /** Giant faded brand word at the bottom (live text with a gradient fade). */
  wordmark: string;
  /** Accessible name of the social links group. */
  socialsLabel: string;
}

const SOCIAL_ICONS: Record<SocialLink['network'], IconName> = {
  linkedin: 'linkedin',
  x: 'x',
  instagram: 'instagram',
  whatsapp: 'whatsapp',
};

const CONTACT_ICONS: Record<ContactChannel['type'], IconName> = {
  phone: 'phone',
  email: 'mail',
  whatsapp: 'whatsapp',
  hours: 'clock',
};

const hrefFor = (c: ContactChannel): string | undefined => {
  if (c.href) return c.href;
  if (c.type === 'phone') return `tel:${c.value.replace(/[^\d+]/g, '')}`;
  if (c.type === 'email') return `mailto:${c.value}`;
  return undefined;
};

/**
 * Site footer (Figma 411:3881 / 407:85): dark band with brand and socials, three link columns, contact row, legal row with
 * back-to-top, and a faded wordmark. Server-safe except the back-to-top leaf.
 *
 * @figma 407:85, 411:3881
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ logo, description, socials, columns, contacts, legal, backToTopLabel, wordmark, socialsLabel, className, ...props }, ref) => (
    <footer ref={ref} className={cn('overflow-hidden bg-bg-inverse pt-24 text-text-inverse', className)} {...props}>
      <Container className="flex flex-col gap-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-[22.75rem_repeat(3,10.625rem)] lg:justify-between">
          <div className="col-span-2 flex flex-col gap-6 lg:col-span-1">
            <div>{logo}</div>
            <p className="text-body-md text-text-inverse-muted">{description}</p>
            <ul aria-label={socialsLabel} className="flex gap-3">
              {socials.map((social) => (
                <li key={social.network}>
                  <IconButton
                    label={social.label}
                    icon={SOCIAL_ICONS[social.network]}
                    href={social.href}
                    variant="ghost-light"
                    size="sm"
                    external
                  />
                </li>
              ))}
            </ul>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-labelledby={`footer-col-${column.title}`} className="flex flex-col gap-5">
              <h2 id={`footer-col-${column.title}`} className="text-body-md font-bold text-text-inverse">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-3.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-body-md text-text-inverse-muted transition-colors duration-(--motion-duration-fast) ease-standard hover:text-text-inverse"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {contacts.length > 0 ? (
          <ul className="flex flex-wrap gap-x-16 gap-y-6">
            {contacts.map((contact) => {
              const href = hrefFor(contact);
              const value = <bdi dir="ltr">{contact.value}</bdi>;
              return (
                <li key={contact.type + contact.value} className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-solid border-border-inverse text-text-inverse">
                    <Icon name={CONTACT_ICONS[contact.type]} size={18} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-body-sm text-text-inverse-muted">{contact.label}</span>
                    {href ? (
                      <a href={href} className="text-body-md font-bold text-text-inverse hover:underline">
                        {value}
                      </a>
                    ) : (
                      <span className="text-body-md font-bold text-text-inverse">{value}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="flex flex-col-reverse items-start justify-between gap-6 text-body-sm md:flex-row md:items-end">
          <div className="flex flex-col gap-2 text-text-inverse-muted">
            <p>{legal.copyright}</p>
            <p className="flex flex-wrap gap-x-2">
              {legal.registry.map((entry, i) => (
                <React.Fragment key={entry}>
                  {i > 0 ? <span aria-hidden="true">|</span> : null}
                  <span>{entry}</span>
                </React.Fragment>
              ))}
              {legal.links.map((link) => (
                <React.Fragment key={link.href}>
                  <span aria-hidden="true">|</span>
                  <a href={link.href} className="underline underline-offset-4 hover:text-text-inverse">
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </p>
          </div>
          <BackToTop label={backToTopLabel} />
        </div>

        <div aria-hidden="true" className="overflow-hidden" style={{ height: 'min(15.5vw, 14.375rem)' }}>
          <p
            className="-mt-[0.053em] w-full bg-linear-to-b from-text-inverse/90 to-text-inverse/6 to-85% bg-clip-text font-bold leading-[1.15] text-transparent"
            style={{ fontSize: 'min(15vw, 14.0625rem)' }}
          >
            {wordmark}
          </p>
        </div>
      </Container>
    </footer>
  ),
);
Footer.displayName = 'Footer';
