import { Test, TestingModule } from '@nestjs/testing';
import { SeoService } from './seo.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SeoContentSchema, SeoSchema } from '@repo/shared';

describe('SeoService', () => {
    let service: SeoService;
    let prisma: {
        seo: {
            findUnique: jest.Mock;
            upsert: jest.Mock;
        };
    };

    beforeEach(async () => {
        prisma = {
            seo: {
                findUnique: jest.fn(),
                upsert: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SeoService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<SeoService>(SeoService);
    });

    it('validates SeoContentSchema with ogImage and noindex', () => {
        const validSeo = {
            title: { ar: 'الرئيسية', en: 'Home' },
            description: { ar: 'وصف', en: 'Desc' },
            keywords: { ar: 'كلمات', en: 'Keywords' },
            canonicalUrl: 'https://aacpa.sa/ar',
            ogTitle: { ar: 'عنوان المشاركة', en: 'Share Title' },
            ogDescription: { ar: 'وصف المشاركة', en: 'Share Desc' },
            ogType: 'website',
            ogImage: 'https://aacpa.sa/og/home.png',
            noindex: true,
        };

        const parsed = SeoContentSchema.safeParse(validSeo);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.noindex).toBe(true);
            expect(parsed.data.ogImage).toBe('https://aacpa.sa/og/home.png');
        }
    });

    it('fetches SEO record by pageKey', async () => {
        const mockSeo = {
            id: 'seo-1',
            pageKey: 'services',
            content: {
                title: { ar: 'خدماتنا', en: 'Our Services' },
                noindex: false,
            },
        };
        prisma.seo.findUnique.mockResolvedValue(mockSeo);

        const result = await service.getByPageKey('services');
        expect(prisma.seo.findUnique).toHaveBeenCalledWith({ where: { pageKey: 'services' } });
        expect(result).toEqual(mockSeo);
    });

    it('upserts SEO record with ogImage and noindex content', async () => {
        const inputData = {
            pageKey: 'about',
            content: {
                title: { ar: 'من نحن', en: 'About Us' },
                ogImage: 'https://example.com/about-og.jpg',
                noindex: false,
            },
        };

        prisma.seo.upsert.mockResolvedValue({
            id: 'seo-2',
            pageKey: 'about',
            content: inputData.content,
        });

        const result = await service.update(inputData as any);
        expect(prisma.seo.upsert).toHaveBeenCalledWith({
            where: { pageKey: 'about' },
            update: { content: inputData.content },
            create: { pageKey: 'about', content: inputData.content },
        });
        expect(result.pageKey).toBe('about');
    });
});
