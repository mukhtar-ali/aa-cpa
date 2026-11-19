import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PreviewKind, PreviewService } from './preview.service';

const PUBLIC_CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=86400';

@Injectable()
export class PublicCacheInterceptor implements NestInterceptor {
    constructor(private readonly previewService: PreviewService) {}

    private inferScope(path: string): { kind: PreviewKind; key?: string } | undefined {
        const cleanPath = path.split('?')[0];

        const legalMatch = cleanPath.match(/^\/api\/pages\/legal\/([^/]+)$/);
        if (legalMatch) {
            return { kind: 'page', key: legalMatch[1] };
        }

        const pageMatch = cleanPath.match(/^\/api\/pages\/([^/]+)$/);
        if (pageMatch) {
            return { kind: 'page', key: pageMatch[1] };
        }

        if (cleanPath.startsWith('/api/site/')) {
            return { kind: 'page' };
        }

        const serviceSlugMatch = cleanPath.match(/^\/api\/services\/([^/]+)$/);
        if (serviceSlugMatch) {
            return { kind: 'service', key: serviceSlugMatch[1] };
        }
        if (cleanPath === '/api/services') {
            return { kind: 'service' };
        }

        const sectorSlugMatch = cleanPath.match(/^\/api\/sectors\/([^/]+)$/);
        if (sectorSlugMatch) {
            return { kind: 'sector', key: sectorSlugMatch[1] };
        }
        if (cleanPath === '/api/sectors') {
            return { kind: 'sector' };
        }

        const articleSlugMatch = cleanPath.match(/^\/api\/(?:articles|news\/web)\/([^/]+)$/);
        if (articleSlugMatch) {
            return { kind: 'article', key: articleSlugMatch[1] };
        }
        if (cleanPath === '/api/articles' || cleanPath === '/api/news/web') {
            return { kind: 'article' };
        }

        const jobSlugMatch = cleanPath.match(/^\/api\/jobs(?:\/web)?\/([^/]+)$/);
        if (jobSlugMatch) {
            return { kind: 'job', key: jobSlugMatch[1] };
        }
        if (cleanPath === '/api/jobs' || cleanPath === '/api/jobs/web') {
            return { kind: 'job' };
        }

        return undefined;
    }

    private isPublicReadRoute(method: string, path: string): boolean {
        if (method !== 'GET') return false;
        const cleanPath = path.split('?')[0];
        if (cleanPath.startsWith('/api/admin/')) return false;
        return (
            cleanPath.startsWith('/api/site/') ||
            cleanPath.startsWith('/api/pages/') ||
            cleanPath.startsWith('/api/services') ||
            cleanPath.startsWith('/api/sectors') ||
            cleanPath.startsWith('/api/articles') ||
            cleanPath.startsWith('/api/news/web') ||
            cleanPath.startsWith('/api/jobs') ||
            cleanPath.startsWith('/api/offices') ||
            cleanPath.startsWith('/api/testimonials') ||
            cleanPath.startsWith('/api/client-logos') ||
            cleanPath.startsWith('/api/credentials') ||
            cleanPath.startsWith('/api/faqs') ||
            cleanPath === '/api/estimator'
        );
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();

        if (!req || !res) {
            return next.handle();
        }

        const method = req.method || 'GET';
        const url = req.originalUrl || req.url || '';

        if (!this.isPublicReadRoute(method, url)) {
            return next.handle();
        }

        const rawToken = req.headers?.['x-preview-token'];
        const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
        const scope = this.inferScope(url);
        const verified = token ? this.previewService.verifyToken(token, scope) : null;

        if (verified) {
            req.preview = verified;
            req.isPreview = true;
            res.setHeader('Cache-Control', 'no-store');
        } else {
            // Strip invalid/expired/mismatched token so downstream treats request as anonymous
            if (req.headers) {
                delete req.headers['x-preview-token'];
            }
            req.preview = null;
            req.isPreview = false;
            res.setHeader('Cache-Control', PUBLIC_CACHE_HEADER);
        }

        return next.handle();
    }
}
