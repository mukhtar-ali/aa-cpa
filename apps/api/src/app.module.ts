import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';
import * as path from 'path';

import { HttpExceptionFilter } from './common/exception.filter';
import { I18nHelper } from './common/i18n.helper';
import { LangMiddleware } from './common/lang.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { ResourceModule } from './resource/resource.module';
import { SectionModule } from './section/section.module';
import { SeoModule } from './seo/seo.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { NewsModule } from './news/news.module';
import { CareersModule } from './careers/careers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { ServiceModule } from './service/service.module';
import { SectorModule } from './sector/sector.module';
import { ReferenceModule } from './reference/reference.module';
import { RedirectsModule } from './redirects/redirects.module';
import { PagesModule } from './pages/pages.module';
import { PreviewModule } from './preview/preview.module';
import { PublicCacheInterceptor } from './preview/public-cache.interceptor';
import { OutboxModule } from './outbox/outbox.module';
import { PrivacyModule } from './privacy/privacy.module';
import { LeadsModule } from './leads/leads.module';
import { EstimatorModule } from './estimator/estimator.module';

@Module({
    imports: [
        LoggerModule.forRoot({
            pinoHttp: {
                transport: process.env.NODE_ENV !== 'production'
                    ? { target: 'pino-pretty', options: { singleLine: true } }
                    : undefined,
                level: process.env.LOG_LEVEL ?? 'info',
            },
        }),
        I18nModule.forRoot({
            fallbackLanguage: 'ar',
            loaderOptions: {
                path: path.join(__dirname, '/i18n/'),
                watch: true,
            },
            resolvers: [AcceptLanguageResolver],
        }),
        // 60 req/min/IP by default; specific routes (login, uploads) override this with
        // @Throttle({ default: { limit, ttl } }) for tighter limits — see auth.controller.ts
        // and resource.controller.ts.
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 60 }]),
        ScheduleModule.forRoot(),
        PrismaModule,
        AuthModule,
        EmailModule,
        UsersModule,
        ResourceModule,
        SectionModule,
        SeoModule,
        MonitoringModule,
        NewsModule,
        CareersModule,
        DashboardModule,
        HealthModule,
        ServiceModule,
        SectorModule,
        ReferenceModule,
        RedirectsModule,
        PagesModule,
        PreviewModule,
        OutboxModule,
        PrivacyModule,
        LeadsModule,
        EstimatorModule,
    ],
    controllers: [],
    providers: [
        I18nHelper,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: PublicCacheInterceptor,
        },
        // ThrottlerModule.forRoot() only registers the config — without this guard,
        // nothing was ever actually being throttled (including the pre-existing
        // @Throttle() on monitoring.controller.ts, which was a silent no-op).
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LangMiddleware).forRoutes('*');
    }
}
