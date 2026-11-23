import crypto from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TAG = /^[a-z]+(:[a-z0-9-]+)?$/;
const MAX_TAGS = 50;

const sameSecret = (given: string | null, expected: string) => {
    if (!given || !expected) return false;
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/** POST `/api/revalidate` from the API's outbox: header `x-revalidate-secret`, body `{ tags: string[] }`. */
export async function POST(request: Request) {
    if (!sameSecret(request.headers.get('x-revalidate-secret'), process.env.WEB_REVALIDATE_SECRET ?? '')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
    const tags = body?.tags;
    if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS || !tags.every((t) => typeof t === 'string' && TAG.test(t))) {
        return NextResponse.json({ error: 'invalid tags' }, { status: 400 });
    }
    const unique = [...new Set(tags as string[])];
    for (const tag of unique) revalidateTag(tag, 'max');
    return NextResponse.json({ revalidated: unique });
}
