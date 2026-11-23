import Link from 'next/link';
import { cn } from '@repo/design-system/lib';

export interface FilterLink {
    label: string;
    href: string;
    active: boolean;
}

/** Filters as plain links (server-rendered, work without JavaScript, shareable URLs). `aria-current` marks the active one. */
export function FilterLinks({ items, label }: { items: FilterLink[]; label: string }) {
    return (
        <nav aria-label={label}>
            <ul className="flex flex-wrap gap-3">
                {items.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            aria-current={item.active ? 'true' : undefined}
                            className={cn(
                                'inline-flex h-10 items-center rounded-full border border-solid px-5.5 text-body-sm font-bold whitespace-nowrap',
                                item.active ? 'border-transparent bg-bg-inverse text-text-inverse' : 'border-border-chip text-text-heading hover:bg-bg-surface-ice',
                            )}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
