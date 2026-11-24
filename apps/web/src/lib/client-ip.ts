/**
 * Visitor IP for the API's rate limit and consent record. The first `X-Forwarded-For` entry is whatever the visitor sent, so it can be
 * forged; the last one is added by the proxy in front of this app. Prefer `X-Real-IP` (set by the proxy), else the last entry.
 * The deployment must have a proxy that sets one of them (Coolify/Traefik/nginx do).
 */
export function clientIpFrom(headers: { get(name: string): string | null }): string | undefined {
    const real = headers.get('x-real-ip')?.trim();
    if (real) return real;
    const parts = headers.get('x-forwarded-for')?.split(',').map((p) => p.trim()).filter(Boolean);
    return parts?.at(-1);
}
