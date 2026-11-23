import type { NextConfig } from 'next';

// next/image only loads remote images from hosts listed here. The API's own origin is added so images stored on the
// API's local disk (STORAGE_DRIVER=local, served at <API>/uploads/...) work; S3 hosts stay allowed as before.
function apiImagePattern(): NonNullable<NextConfig['images']>['remotePatterns'] {
    try {
        const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? process.env.BASE_URL ?? '');
        if (api.protocol !== 'http:' && api.protocol !== 'https:') return [];
        return [
            {
                protocol: api.protocol === 'http:' ? 'http' : 'https',
                hostname: api.hostname,
                ...(api.port ? { port: api.port } : {}),
                pathname: '/uploads/**',
            },
        ];
    } catch {
        return [];
    }
}

// Extra CDN hosts for next/image, comma separated (IMAGE_HOSTS=cdn.example.com,images.example.com), https only.
function envImagePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
    return (process.env.IMAGE_HOSTS ?? '')
        .split(',')
        .map((host) => host.trim())
        .filter((host) => /^[a-z0-9.*-]+$/i.test(host))
        .map((hostname) => ({ protocol: 'https' as const, hostname }));
}

// These three are inlined into the build. Deploy tools (Coolify) pass an EMPTY value for a variable that was never filled
// in, which used to produce a site whose every page hung: an empty BASE_URL makes the server's fetch() of a relative URL
// wait forever, and an empty NEXT_PUBLIC_SITE_URL put "/sitemap.xml" in robots.txt. Refuse to build instead. An unset
// variable is fine (the localhost defaults apply); only "set but empty" is rejected.
for (const name of ['BASE_URL', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SITE_URL'] as const) {
    const value = process.env[name];
    if (value !== undefined && value.trim() === '') {
        throw new Error(
            `${name} is set but empty. Give it the public https address (for example ${name === 'NEXT_PUBLIC_SITE_URL' ? 'https://www.example.com' : 'https://api.example.com'}) in the environment variables of this deployment, then build again.`,
        );
    }
}

const nextConfig: NextConfig = {
    transpilePackages: ['@repo/design-system'],
    // Job applications carry a CV (up to 5 MB in 002) through a Server Action; the default 1 MB would reject it.
    experimental: { serverActions: { bodySizeLimit: '6mb' } },
    async redirects() {
        return [{ source: '/:lang(ar|en)/news/:path*', destination: '/:lang/articles/:path*', permanent: true }];
    },
    env: {
        BASE_URL: process.env.BASE_URL,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.amazonaws.com' },
            ...(envImagePatterns() ?? []),
            ...(apiImagePattern() ?? []),
        ],
        // Next refuses to optimise images served from localhost/private addresses by default. That is right in
        // production (a public API host), but breaks local development where the API is http://localhost:3001.
        ...(process.env.NODE_ENV !== 'production' ? { dangerouslyAllowLocalIP: true } : {}),
    },
};

export default nextConfig;
