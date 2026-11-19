import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { join } from 'path';
import { AppModule } from './app.module';
import { customEnv } from './config/custom-env';
import { isSwaggerEnabled } from './config/swagger';
import { parseTrustProxy } from './config/trust-proxy';
import { assertProductionEnv } from './config/validate-env';
import { csrfProtection } from './common/csrf.middleware';
import { securityHeaders } from './common/security-headers.middleware';
import { LOCAL_PUBLIC_URL_PATH, LocalStorage } from './resource/storage/local.storage';
import { resolveStorageDriverName } from './resource/storage/storage-config';

async function bootstrap() {
    assertProductionEnv();

    const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));

    // Let SIGTERM/SIGINT run the module destroy hooks (PrismaService disconnects) instead of killing the
    // process mid-request, so container stops and rolling deploys shut down cleanly.
    app.enableShutdownHooks();
    app.disable('x-powered-by');
    app.use(securityHeaders());

    app.useStaticAssets(join(__dirname, '..', 'public'));

    // Local-disk uploads (STORAGE_DRIVER=local, or no S3 configured): serve the PUBLIC folder only. Private files (résumés)
    // live in a sibling folder that is never mounted; they are reached through the signed download route instead.
    if (resolveStorageDriverName(customEnv) === 'local') {
        const storage = new LocalStorage();
        await storage.assertReady();
        app.useStaticAssets(storage.publicDir, {
            prefix: LOCAL_PUBLIC_URL_PATH,
            dotfiles: 'deny',
            index: false,
            redirect: false,
            maxAge: '365d',
            immutable: true,
            // Uploaded SVGs are served from the API origin: a sandboxed, script-less policy keeps a malicious one inert.
            setHeaders: (res) => res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox"),
        });
        app.get(Logger).log(`Uploads are stored on local disk at ${storage.root}`, 'Storage');
    }

    // Behind a reverse proxy, trust exactly N hops of X-Forwarded-For so req.ip is the real client
    // (per-IP throttles and the login audit trail depend on it). Off unless TRUST_PROXY is a hop count.
    const trustProxyHops = parseTrustProxy(process.env.TRUST_PROXY);
    if (trustProxyHops) {
        app.set('trust proxy', trustProxyHops);
    }

    app.use(cookieParser());

    // credentials: true cannot be combined with origin: '*' per the CORS spec — browsers
    // reject that combination outright. The refresh/logout endpoints rely on an httpOnly
    // cookie, so this needs a real allow-list.
    app.enableCors({
        origin: [customEnv.ADMIN_PORTAL_URL, customEnv.FRONTEND_URL],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-csrf-token'],
    });

    // Scoped, not global: CSRF only matters where a browser auto-attaches a credential
    // (the httpOnly refresh-token cookie on these two routes). Every other route uses a
    // Bearer token that a malicious site can't attach on a victim's behalf, so CSRF there
    // would add friction — every admin/web mutation would need a fetched CSRF token — for
    // no real protection. (wujud's own equivalent middleware ships commented out in
    // app.ts, and inverted: it exempted /auth/* rather than scoping to it.)
    app.use(['/api/auth/refresh', '/api/auth/logout'], csrfProtection);

    const swaggerEnabled = isSwaggerEnabled();
    if (swaggerEnabled) {
        const config = new DocumentBuilder()
            .setTitle('Ahmad Abdullah CPA API')
            .setDescription('Bilingual (AR/EN) Content, Fee Estimator & Lead Management API for Ahmad Abdullah CPA')
            .setVersion('1.0')
            .addTag('site', 'Public site chrome & global SEO')
            .addTag('pages', 'Public bilingual page aggregators')
            .addTag('services', 'CPA professional services')
            .addTag('sectors', 'Economic sectors served')
            .addTag('articles', 'Articles, insights & case stories')
            .addTag('careers', 'Job postings & candidate applications')
            .addTag('estimator', 'Server-side fee estimator & quote requests')
            .addTag('leads', 'Contact requests & lead pipeline')
            .addTag('privacy', 'PDPL consent, export & erasure')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
            .build();

        const documentFactory = () => SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/swagger', app, cleanupOpenApiDoc(documentFactory()), {
            swaggerOptions: { persistAuthorization: true },
        });
    }

    await app.listen(customEnv.APP_PORT, '0.0.0.0');
    app.get(Logger).log(`API running on http://localhost:${customEnv.APP_PORT}`);
    if (swaggerEnabled) {
        app.get(Logger).log(`Swagger: http://localhost:${customEnv.APP_PORT}/api/swagger`);
    }
}
bootstrap();
