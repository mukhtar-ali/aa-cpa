import { cookies, draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { PREVIEW_FLAG_COOKIE, PREVIEW_TOKEN_COOKIE, safeLocalePath } from '@/src/lib/preview';

export const dynamic = 'force-dynamic';

/** GET `/api/preview/exit?path=`: turns draft mode off, clears the preview cookies and goes back (inside the site only). */
export async function GET(request: Request) {
    const url = new URL(request.url);
    (await draftMode()).disable();
    const jar = await cookies();
    jar.delete(PREVIEW_TOKEN_COOKIE);
    jar.delete(PREVIEW_FLAG_COOKIE);
    return NextResponse.redirect(new URL(safeLocalePath(url.searchParams.get('path')) ?? '/', request.url), 307);
}
