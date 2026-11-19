'use client';

import Link from 'next/link';
import { useCurrentLocale } from '@/dictionaries/client';

export const Logo = () => {
    const lang = useCurrentLocale();

    return (
        <Link href={`/${lang}`} className="text-lg font-bold tracking-tight text-current">
            Starter
        </Link>
    );
};
