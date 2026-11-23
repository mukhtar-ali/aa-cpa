import { NextResponse } from 'next/server';
import { forwardApplication } from '@/src/actions/apply-core';
import { isLang } from '@/src/lib/i18n/dictionaries';

export const dynamic = 'force-dynamic';

/**
 * POST `/api/apply-upload?slug=&lang=` (multipart). The careers form uses an XHR to this route only to get upload progress
 * (research R4); it forwards to the same code as the Server Action. Status mapping: 201 ok, 400 field/file problem,
 * 413 too large, 415 wrong type, 429 rate limited, 502 anything else.
 */
export async function POST(request: Request) {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug') ?? '';
    const lang = url.searchParams.get('lang') ?? '';
    if (!isLang(lang) || !/^[a-z0-9-]+$/i.test(slug)) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

    const data = await request.formData().catch(() => null);
    if (!data) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
    const result = await forwardApplication(data, { slug, lang, clientIp });
    if (result.ok) return NextResponse.json({ ok: true }, { status: 201 });
    const status = result.fileError === 'tooLarge' ? 413 : result.fileError === 'wrongType' ? 415 : result.error === 'rateLimited' ? 429 : result.error === 'closed' ? 410 : result.error === 'generic' ? 502 : 400;
    return NextResponse.json(result, { status });
}
