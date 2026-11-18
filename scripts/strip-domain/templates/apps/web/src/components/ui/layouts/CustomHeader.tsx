'use client';

import Link from 'next/link';
import { useCurrentLocale, useT } from '@/dictionaries/client';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Core-starter header: logo, a short link list (extend `links`) and the language switcher. */
export const CustomHeader = () => {
    const lang = useCurrentLocale();
    const t = useT();
    const links = [{ href: `/${lang}`, label: t.header.menu.home }];

    return (
        <header
            id="main-header"
            className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/90"
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                <Logo />
                <nav aria-label={t.header.menu.title} className="flex items-center gap-6">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm font-medium transition-colors hover:opacity-70">
                            {link.label}
                        </Link>
                    ))}
                    <LanguageSwitcher />
                </nav>
            </div>
        </header>
    );
};
