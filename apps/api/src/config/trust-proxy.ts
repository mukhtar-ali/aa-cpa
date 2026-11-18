export const MAX_TRUSTED_PROXY_HOPS = 10;

/**
 * Parses TRUST_PROXY into the number of reverse-proxy hops Express should trust when
 * deriving `req.ip` from `X-Forwarded-For`.
 *
 * Only a plain positive integer (1..MAX_TRUSTED_PROXY_HOPS) is accepted. `true`, `*`, subnet
 * lists and anything else return `false` (do not trust), because trusting every
 * `X-Forwarded-For` entry lets any client choose its own IP and sidestep the per-IP
 * throttles and the login audit trail.
 *
 * Behind a reverse proxy (Coolify/Traefik, nginx, a load balancer) without this setting every
 * request appears to come from the proxy's IP, so the per-IP rate limits (10 auth
 * attempts / 15 min) would apply to ALL users together.
 */
export function parseTrustProxy(raw: string | undefined): number | false {
    if (raw === undefined || !/^\d+$/.test(raw)) {
        return false;
    }
    const hops = Number(raw);
    return Number.isSafeInteger(hops) && hops >= 1 && hops <= MAX_TRUSTED_PROXY_HOPS ? hops : false;
}
