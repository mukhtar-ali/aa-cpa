'use client';

import { safeHttpUrl, type WebsiteInfoSectionModelWeb } from '@repo/shared';
import { useT } from '@/dictionaries/client';
import { Logo } from './Logo';

interface Props {
    /** Settings > General from the admin (already localized). Missing fields fall back to the dictionary. */
    info?: WebsiteInfoSectionModelWeb | null;
}

// A plain address only: `?`, `&`, `#`, `%`, `,` and `;` are excluded so a CMS value like "a@b.co?bcc=x" cannot
// add mailto headers (bcc/subject/body) to the link.
const EMAIL_SHAPE = /^[^\s@<>"'?&#%,;]+@[^\s@<>"'?&#%,;]+\.[^\s@<>"'?&#%,;]+$/;
const text = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

export const CustomFooter = ({ info }: Props) => {
    const t = useT();

    const email = text(info?.email) ?? t.footer.contact.email;
    const address = text(info?.address) ?? t.footer.contact.address;
    const phone = text(info?.phone);
    const description = text(info?.footerDescription);
    const siteName = text(info?.siteName);
    const copyright = siteName ? `© ${new Date().getFullYear()} ${siteName}` : t.footer.copyright;

    // CMS URLs are only rendered as links when they are real http(s) URLs (a javascript: URL would run on click).
    const socials = [
        ['Facebook', info?.facebookUrl],
        ['Instagram', info?.instagramUrl],
        ['LinkedIn', info?.linkedinUrl],
        ['YouTube', info?.youtubeUrl],
    ]
        .map(([label, url]) => ({ label: label as string, href: safeHttpUrl(url) }))
        .filter((social): social is { label: string; href: string } => social.href !== undefined);

    return (
        <footer id="main-footer-id" className="mt-16 border-t border-line bg-soft py-12">
            <div id="contact" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div className="space-y-1">
                    <span className="logo inline-block">
                        <Logo />
                    </span>
                    {description && <p className="max-w-md text-sm text-muted">{description}</p>}
                    <p className="footer-desc text-sm font-medium text-current">
                        {EMAIL_SHAPE.test(email) ? (
                            <a href={`mailto:${email}`} className="hover:underline">
                                {email}
                            </a>
                        ) : (
                            email
                        )}
                    </p>
                    {phone && (
                        <p className="text-sm text-muted">
                            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:underline" dir="ltr">
                                {phone}
                            </a>
                        </p>
                    )}
                    <p className="text-sm text-muted">{address}</p>
                </div>
                <div className="space-y-3 sm:text-end">
                    {socials.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm sm:justify-end">
                            {socials.map((social) => (
                                <li key={social.label}>
                                    <a href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg hover:underline">
                                        {social.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="text-sm text-muted">{copyright}</p>
                </div>
            </div>
        </footer>
    );
};
