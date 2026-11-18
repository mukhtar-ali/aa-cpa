import Link from 'next/link';
import { getT } from '@/dictionaries/server';

/**
 * Server-rendered prev/next links for a paginated list. Each page is a real URL (`?page=N`), so crawlers
 * can reach every item. Renders nothing for a single page.
 */
export async function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
    if (totalPages <= 1) return null;
    const t = (await getT()).pagination;
    const href = (n: number) => (n <= 1 ? basePath : `${basePath}?page=${n}`);

    return (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4 text-sm">
            {page > 1 ? (
                <Link href={href(page - 1)} rel="prev" className="card card-link px-4 py-2">
                    {t.previous}
                </Link>
            ) : (
                <span />
            )}
            <span className="text-muted">
                {t.page} {page} {t.of} {totalPages}
            </span>
            {page < totalPages ? (
                <Link href={href(page + 1)} rel="next" className="card card-link px-4 py-2">
                    {t.next}
                </Link>
            ) : (
                <span />
            )}
        </nav>
    );
}
