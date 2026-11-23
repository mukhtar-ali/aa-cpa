import type { SiteChromeWeb } from '@repo/shared';
import type { ActionRef, ContactChannel, FooterColumn, LinkRef, NavItem } from '@repo/design-system/types';
import type { Lang } from '@/src/lib/i18n/dictionaries';
import { localizeHref } from './href';

export interface ChromeProps {
    logo: { href: string; label: string };
    utility: { license: string; network: string; city: string; phone: ContactChannel };
    nav: NavItem[];
    cta: ActionRef;
    localeSwitch?: { current: Lang; label: string; href: string };
    footer: {
        description: string;
        socials: SiteChromeWeb['footer']['socials'];
        columns: FooterColumn[];
        contacts: ContactChannel[];
        legal: { copyright: string; registry: string[]; links: LinkRef[] };
        backToTopLabel?: string;
        wordmark?: string;
    };
    /** WhatsApp number link for the floating button, taken from the contact channels. */
    whatsapp?: { href: string; label: string };
}

const navItem = (lang: Lang, item: NavItem): NavItem => ({
    ...item,
    href: localizeHref(lang, item.href),
    ...(item.children ? { children: item.children.map((child: NavItem) => navItem(lang, child)) } : {}),
});
const link = (lang: Lang, l: LinkRef): LinkRef => ({ ...l, href: localizeHref(lang, l.href) });
const channel = (lang: Lang, c: ContactChannel): ContactChannel => ({ ...c, ...(c.href ? { href: localizeHref(lang, c.href) } : {}) });

/**
 * `/api/site/chrome` → props for Header, UtilityBar, Footer and WhatsAppFloat. The API sends route paths without the
 * language prefix; this adds it (research R2). `switchHref` is the current page in the other language, computed by the
 * layout so the switch keeps the path and query (FR-002).
 */
export function toChromeProps(chrome: SiteChromeWeb, lang: Lang, switchHref?: string): ChromeProps {
    const whatsapp = [...chrome.footer.contacts, chrome.utility.phone].find((c) => c.type === 'whatsapp' && c.href);
    return {
        logo: { href: localizeHref(lang, chrome.logo.href), label: chrome.logo.label },
        utility: { ...chrome.utility, phone: channel(lang, chrome.utility.phone as ContactChannel) },
        nav: (chrome.nav as NavItem[]).map((item) => navItem(lang, item)),
        cta: link(lang, chrome.cta as ActionRef) as ActionRef,
        localeSwitch: chrome.localeSwitch
            ? { current: chrome.localeSwitch.current, label: chrome.localeSwitch.label, href: switchHref ?? chrome.localeSwitch.href }
            : undefined,
        footer: {
            description: chrome.footer.description,
            socials: chrome.footer.socials,
            columns: chrome.footer.columns.map((col) => ({ ...col, links: col.links.map((l) => link(lang, l as LinkRef)) })),
            contacts: chrome.footer.contacts.map((c) => channel(lang, c as ContactChannel)),
            legal: { ...chrome.footer.legal, links: chrome.footer.legal.links.map((l) => link(lang, l as LinkRef)) },
            backToTopLabel: chrome.footer.backToTopLabel,
            wordmark: chrome.footer.wordmark,
        },
        whatsapp: whatsapp ? { href: whatsapp.href!, label: whatsapp.label } : undefined,
    };
}
