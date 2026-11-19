import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Reference Entities API (E2E)', () => {
    let app: INestApplication;
    let baseUrl: string;

    const mockOffice = {
        id: 'off-1',
        city: { ar: 'الرياض', en: 'Riyadh' },
        address: { ar: 'طريق الملك فهد', en: 'King Fahd Rd' },
        mapUrl: 'https://maps.google.com',
        mapX: 50,
        mapY: 50,
        image: null,
        isHeadquarters: true,
        order: 0,
        isPublished: true,
        isDeleted: false,
    };

    const mockFaq = {
        id: 'faq-1',
        question: { ar: 'سؤال', en: 'Question' },
        answer: { ar: 'جواب', en: 'Answer' },
        scope: 'global',
        order: 0,
        isPublished: true,
        isDeleted: false,
    };

    const mockPrisma = {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn().mockResolvedValue(undefined),
        onModuleDestroy: jest.fn().mockResolvedValue(undefined),
        section: {
            findUnique: jest.fn().mockResolvedValue(null),
        },
        office: {
            findMany: jest.fn().mockResolvedValue([mockOffice]),
            findUnique: jest.fn().mockResolvedValue(mockOffice),
        },
        testimonial: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        clientLogo: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        credential: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        faqItem: {
            findMany: jest.fn().mockResolvedValue([mockFaq]),
            findUnique: jest.fn().mockResolvedValue(mockFaq),
        },
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
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

    it('GET /api/offices returns 200 with list of offices', async () => {
        const res = await fetch(`${baseUrl}/api/offices`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body[0].city).toBe('الرياض');
    });

    it('GET /api/faqs returns 200 with list of faqs', async () => {
        const res = await fetch(`${baseUrl}/api/faqs`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body[0].question).toBe('سؤال');
    });
});
