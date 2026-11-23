import { endpoint } from '@repo/shared';

/** Cache tags (research R1). Must match the tags the API sends to `/api/revalidate`. */
export const tags = {
    chrome: 'chrome',
    page: (key: string) => `page:${key}`,
    services: 'services',
    service: (slug: string) => `service:${slug}`,
    sectors: 'sectors',
    articles: 'articles',
    article: (slug: string) => `article:${slug}`,
    jobs: 'jobs',
    job: (slug: string) => `job:${slug}`,
    legal: (key: string) => `legal:${key}`,
    estimator: 'estimator',
} as const;

export const endpoints = endpoint;
