import { cookies, draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { pathForScope, PREVIEW_FLAG_COOKIE, PREVIEW_TOKEN_COOKIE, safeLocalePath, verifyPreviewToken } from '@/src/lib/preview';

export const dynamic = 'force-dynamic';

/**
 * GET `/api/preview?token=&path=` (or `&lang=` when the admin link has no path). Verifies the API-issued token locally, turns on
 * draft mode, remembers the token (httpOnly) so pages can ask the API for drafts, and redirects inside the site. Invalid or
 * expired token → 401 and draft mode stays off.
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const payload = verifyPreviewToken(url.searchParams.get('token'), process.env.PREVIEW_SECRET ?? '');
    if (!payload) return NextResponse.json({ error: 'invalid or expired token' }, { status: 401 });

    const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'ar';
    const target = safeLocalePath(url.searchParams.get('path')) ?? pathForScope(lang, payload);
    if (!target) return NextResponse.json({ error: 'invalid path' }, { status: 400 });

    (await draftMode()).enable();
    const jar = await cookies();
    const maxAge = Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
    const base = { path: '/', sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge };
    jar.set(PREVIEW_TOKEN_COOKIE, url.searchParams.get('token')!, { ...base, httpOnly: true });
    jar.set(PREVIEW_FLAG_COOKIE, '1', { ...base, httpOnly: false });
    return NextResponse.redirect(new URL(target, request.url), 307);
}
