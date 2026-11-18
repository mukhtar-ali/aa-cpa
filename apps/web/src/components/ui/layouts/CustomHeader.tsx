'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentLocale, useT } from '@/dictionaries/client';
import type { HeaderProject } from '@/src/lib/server-data';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

const baseLink = 'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-soft hover:text-fg';

export const CustomHeader = ({ projects = [] }: { projects?: HeaderProject[] }) => {
    const lang = useCurrentLocale();
    const t = useT();
    const pathname = usePathname();

    // "Open" is stored as the path it was opened on, so navigating anywhere closes both menus
    // without an effect that sets state.
    const [drawerPath, setDrawerPath] = useState<string | null>(null);
    const [menuPath, setMenuPath] = useState<string | null>(null);
    const drawerOpen = drawerPath === pathname;
    const menuOpen = menuPath === pathname;
    const menuRef = useRef<HTMLDivElement>(null);
    const drawerButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!drawerOpen && !menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (drawerOpen) drawerButtonRef.current?.focus();
            setDrawerPath(null);
            setMenuPath(null);
        };
        const onPointer = (e: MouseEvent) => {
            if (menuOpen && !menuRef.current?.contains(e.target as Node)) setMenuPath(null);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onPointer);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onPointer);
        };
    }, [drawerOpen, menuOpen]);

    // Stop the page behind the drawer from scrolling.
    useEffect(() => {
        if (!drawerOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [drawerOpen]);

    const links = [
        { href: `/${lang}`, label: t.header.menu.home },
        { href: `/${lang}/about`, label: t.header.menu.about },
        { href: `/${lang}/news`, label: t.news.title },
        { href: `/${lang}/careers`, label: t.applyNow },
        { href: `/${lang}/contact`, label: t.header.menu.contactUs },
    ];
    // The current page's link reads as selected (and says so to screen readers).
    const isActive = (href: string) => (href === `/${lang}` ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
    const linkClass = (href?: string) => `${baseLink} ${href && isActive(href) ? 'bg-soft text-fg' : 'text-muted'}`;
    const projectLinks = projects.map((p) => ({ href: `/${lang}/${p.slug}`, label: p.title }));

    return (
        <header
            id="main-header"
            className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur"
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <Logo />

                <nav aria-label={t.header.menu.title} className="hidden items-center gap-6 md:flex">
                    <Link href={links[0].href} className={linkClass(links[0].href)} aria-current={isActive(links[0].href) ? 'page' : undefined}>
                        {links[0].label}
                    </Link>

                    {projectLinks.length > 0 ? (
                        <div ref={menuRef} className="relative">
                            <button
                                type="button"
                                aria-expanded={menuOpen}
                                aria-haspopup="true"
                                onClick={() => setMenuPath(menuOpen ? null : pathname)}
                                className={linkClass()}
                            >
                                {t.header.menu.projects}
                                <span aria-hidden="true"> ▾</span>
                            </button>
                            {menuOpen && (
                                <ul className="absolute start-0 top-full mt-3 min-w-56 rounded-xl border border-line bg-card p-2 shadow-lg">
                                    {projectLinks.map((p) => (
                                        <li key={p.href}>
                                            <Link href={p.href} className="block rounded-md px-3 py-2 text-sm hover:bg-soft">
                                                {p.label}
                                            </Link>
                                        </li>
                                    ))}
                                    <li className="mt-1 border-t border-line pt-1">
                                        <Link href={`/${lang}/projects`} className="block rounded-md px-3 py-2 text-sm font-medium text-brand hover:bg-soft">
                                            {t.header.menu.allProjects}
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        <Link href={`/${lang}/projects`} className={linkClass()}>
                            {t.header.menu.projects}
                        </Link>
                    )}

                    {links.slice(1).map((link) => (
                        <Link key={link.href} href={link.href} className={linkClass(link.href)} aria-current={isActive(link.href) ? 'page' : undefined}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <button
                        ref={drawerButtonRef}
                        type="button"
                        className="-me-2 rounded-md p-2 hover:bg-soft md:hidden"
                        aria-label={drawerOpen ? t.header.menu.close : t.header.menu.open}
                        aria-expanded={drawerOpen}
                        aria-controls="mobile-drawer"
                        onClick={() => setDrawerPath(drawerOpen ? null : pathname)}
                    >
                        <span aria-hidden="true" className="text-2xl leading-none">
                            {drawerOpen ? '✕' : '☰'}
                        </span>
                    </button>
                </div>
            </div>

            {drawerOpen && (
                <nav
                    id="mobile-drawer"
                    aria-label={t.header.menu.title}
                    className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-line bg-bg px-4 py-4 md:hidden"
                >
                    <ul className="space-y-1">
                        <DrawerLink href={links[0].href} label={links[0].label} />
                        <DrawerLink href={`/${lang}/projects`} label={t.header.menu.projects} />
                        {projectLinks.map((p) => (
                            <DrawerLink key={p.href} href={p.href} label={p.label} nested />
                        ))}
                        {links.slice(1).map((l) => (
                            <DrawerLink key={l.href} href={l.href} label={l.label} />
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
};

const DrawerLink = ({ href, label, nested }: { href: string; label: string; nested?: boolean }) => (
    <li>
        <Link href={href} className={nested ? 'block rounded px-2 py-2 ps-6 text-sm text-muted' : 'block rounded px-2 py-3 text-base font-medium'}>
            {label}
        </Link>
    </li>
);
