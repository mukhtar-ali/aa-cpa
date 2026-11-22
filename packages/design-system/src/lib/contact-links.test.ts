import { describe, expect, it } from 'vitest';
import { contactHref } from './contact-links';

describe('contactHref', () => {
  it('builds tel, mailto and wa.me links', () => {
    expect(contactHref('phone', '+966 55 534 6560')).toBe('tel:+966555346560');
    expect(contactHref('email', ' info@aacpa.sa ')).toBe('mailto:info@aacpa.sa');
    expect(contactHref('whatsapp', '+966 55 534 6560')).toBe('https://wa.me/966555346560');
    expect(contactHref('whatsapp', '00966555346560')).toBe('https://wa.me/966555346560');
  });

  it('refuses mailto headers and extra recipients', () => {
    for (const v of ['a@b.sa?bcc=x@y.sa', 'a@b.sa&body=hi', 'a@b.sa,c@d.sa', 'a@b.sa;c@d.sa', 'not an email']) expect(contactHref('email', v), v).toBeUndefined();
  });

  it('returns nothing for values without digits and for opening hours', () => {
    expect(contactHref('phone', 'call us')).toBeUndefined();
    expect(contactHref('whatsapp', 'chat')).toBeUndefined();
    expect(contactHref('hours', '9 to 5')).toBeUndefined();
  });

  it('an explicit href wins but must be safe', () => {
    expect(contactHref('phone', '011', 'tel:+966110000000')).toBe('tel:+966110000000');
    expect(contactHref('phone', '011', 'javascript:alert(1)')).toBeUndefined();
  });
});
