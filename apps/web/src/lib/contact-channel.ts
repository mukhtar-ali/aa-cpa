export type ContactChannelName = 'phone' | 'email' | 'whatsapp';

/** Which contact channel a link opens, or null when it is not a contact link. */
export function channelOf(href: string): ContactChannelName | null {
    if (href.startsWith('tel:')) return 'phone';
    if (href.startsWith('mailto:')) return 'email';
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\b/i.test(href)) return 'whatsapp';
    return null;
}
