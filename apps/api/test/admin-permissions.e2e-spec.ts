import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

describe('Admin Routes Permission Enforcement (E2E)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({})
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (ctx: any) => {
                    const req = ctx.switchToHttp().getRequest();
                    // Authenticated user with zero permissions
                    req.user = { id: 'no-perm-user', permissions: [] };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    const protectedRoutes: [string, string][] = [
        ['GET', '/api/admin/services'],
        ['POST', '/api/admin/services'],
        ['GET', '/api/admin/sectors'],
        ['POST', '/api/admin/sectors'],
        ['GET', '/api/admin/news'],
        ['POST', '/api/admin/news'],
        ['GET', '/api/admin/article-categories'],
        ['GET', '/api/admin/authors'],
        ['GET', '/api/admin/jobs'],
        ['POST', '/api/admin/jobs'],
        ['GET', '/api/admin/job-departments'],
        ['GET', '/api/admin/offices'],
        ['GET', '/api/admin/testimonials'],
        ['GET', '/api/admin/client-logos'],
        ['GET', '/api/admin/credentials'],
        ['GET', '/api/admin/faqs'],
        ['GET', '/api/admin/sections/site-chrome'],
        ['PUT', '/api/admin/sections/site-chrome'],
        ['GET', '/api/admin/leads'],
        ['PATCH', '/api/admin/leads/lead-1'],
        ['GET', '/api/admin/leads/export.csv'],
        ['GET', '/api/admin/applications'],
        ['PATCH', '/api/admin/applications/app-1'],
        ['GET', '/api/admin/applications/app-1/resume'],
        ['GET', '/api/admin/applications/export.csv'],
        ['POST', '/api/admin/privacy/export'],
        ['POST', '/api/admin/privacy/erase'],
        ['GET', '/api/admin/outbox'],
        ['POST', '/api/admin/outbox/out-1/retry'],
        ['POST', '/api/preview/token'],
    ];

    it.each(protectedRoutes)(
        '%s %s refuses with 403 Forbidden when user lacks required permission',
        async (method, route) => {
            const req = (request(app.getHttpServer()) as any)[method.toLowerCase()](route);
            const res = await req;
            expect(res.status).toBe(403);
        },
    );
});
