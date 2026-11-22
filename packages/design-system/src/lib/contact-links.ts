import { safeHref } from './safe-href';

/** Mailbox without separators that could add mailto headers (`?bcc=`, `&body=`) or extra recipients (`,` `;`). */
const MAILBOX = /^[^\s@?&,;<>]+@[^\s@?&,;<>]+\.[^\s@?&,;<>]{2,}$/;

/**
 * Link for a contact value: an explicit `href` (checked by safeHref) wins; otherwise tel:, mailto: or https://wa.me/ is built from the value.
 * Returns `undefined` when the value cannot make a safe link (the caller renders plain text).
 */
export function contactHref(type: 'phone' | 'email' | 'whatsapp' | 'hours', value: string, href?: string): string | undefined {
  if (href) return safeHref(href);
  if (type === 'email') return MAILBOX.test(value.trim()) ? `mailto:${value.trim()}` : undefined;
  const digits = value.replace(/[^\d+]/g, '');
  if (type === 'phone') return /\d/.test(digits) ? `tel:${digits}` : undefined;
  if (type === 'whatsapp') {
    const number = digits.replace(/\D/g, '').replace(/^00/, '').replace(/^0+/, '');
    return number ? `https://wa.me/${number}` : undefined;
  }
  return undefined;
}
