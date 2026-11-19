import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Removed Real-Estate Domain (E2E)', () => {
    let app: INestApplication;
    let baseUrl: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({
                $connect: jest.fn().mockResolvedValue(undefined),
                $disconnect: jest.fn().mockResolvedValue(undefined),
                onModuleInit: jest.fn().mockResolvedValue(undefined),
                onModuleDestroy: jest.fn().mockResolvedValue(undefined),
                section: {
                    findUnique: jest.fn().mockResolvedValue(null),
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.listen(0);
        const server = app.getHttpServer();
        const address = server.address();
        const port = typeof address === 'string' ? address : address.port;
        baseUrl = `http://127.0.0.1:${port}`;
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    const removedRoutes = [
        ['GET', '/api/projects'],
        ['GET', '/api/projects/web'],
        ['POST', '/api/project'],
        ['GET', '/api/units'],
        ['GET', '/api/units/web'],
        ['POST', '/api/units'],
        ['GET', '/api/inquiries'],
        ['POST', '/api/inquiry'],
        ['GET', '/api/location-groups'],
        ['GET', '/api/project-location/web'],
        ['GET', '/api/media'],
        ['GET', '/api/media/web'],
        ['GET', '/api/community/web'],
        ['GET', '/api/investor-relations/web'],
    ];

    it.each(removedRoutes)('%s %s should return 404 Not Found', async (method, route) => {
        const res = await fetch(`${baseUrl}${route}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: method === 'POST' ? JSON.stringify({}) : undefined,
        });
        expect(res.status).toBe(404);
    });
});
