import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** GET `/api/health` for uptime checks (feature 004). The version is the build SHA when the pipeline sets it. */
export function GET() {
    return NextResponse.json({ status: 'ok', version: process.env.BUILD_SHA ?? process.env.NEXT_PUBLIC_BUILD_SHA ?? 'dev' }, { headers: { 'cache-control': 'no-store' } });
}
